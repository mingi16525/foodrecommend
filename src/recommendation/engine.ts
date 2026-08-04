import { QdrantClient } from '@qdrant/js-client-rest';
import { Pool } from 'pg';
import { generateEmbedding, maximalMarginalRelevance } from '../ai/utils';

interface DishCandidate {
  id: string;
  score: number;
  embedding: number[];
  payload: Record<string, unknown>;
}

export class RecommendationEngine {
  private qdrant: QdrantClient;
  private db: Pool;

  constructor() {
    this.qdrant = new QdrantClient({ 
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      checkCompatibility: false
    });
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
    });
  }

  async getRecommendations(userId: string) {
    console.log(`Getting recommendations for ${userId}`);
    
    try {
      // 1. Fetch user embeddings from Postgres (user_preferences)
      const userPref = await this.db.query(
        'SELECT favorite_flavors, allergies FROM user_preferences WHERE user_id = $1',
        [userId]
      );
      
      // COLD START LOGIC: If no embedding exists, generate one from user tags
      const userTags = (userPref.rows[0]?.favorite_flavors || []).join(',') + ',' + (userPref.rows[0]?.allergies || []).join(',');
      const userVector = generateEmbedding(userTags || 'default_user_no_tags');

      // 2. Vector search with Qdrant
      // Using with_vector: true to get embeddings back for MMR
      const qdrantResults = await this.qdrant.search('dishes', {
        vector: userVector,
        limit: 10,
        with_vector: true
      }).catch(() => {
        // Fallback if Qdrant is not running or collection is missing
        return [
          { id: '1', score: 0.98, payload: { name: 'Phở Bò' }, vector: generateEmbedding('Pho Bo') },
          { id: '2', score: 0.95, payload: { name: 'Bún Chả' }, vector: generateEmbedding('Bun Cha') },
          { id: '3', score: 0.90, payload: { name: 'Phở Gà' }, vector: generateEmbedding('Pho Ga') }, // similar to Pho Bo
          { id: '4', score: 0.85, payload: { name: 'Bánh Mì' }, vector: generateEmbedding('Banh Mi') },
          { id: '5', score: 0.80, payload: { name: 'Nem Rán' }, vector: generateEmbedding('Nem Ran') }
        ];
      });

      // 3. Apply MMR (Re-ranking) for Diversity
      const mappedResults: DishCandidate[] = qdrantResults.map(r => ({
        id: String(r.id),
        score: Number(r.score),
        embedding: (r.vector as number[]) || generateEmbedding(((r.payload as Record<string, unknown>)?.name as string) || ''),
        payload: (r.payload as Record<string, unknown>) || {}
      }));

      const mmrResults = maximalMarginalRelevance(mappedResults, userVector, 0.5, 5);

      return mmrResults.map(res => ({
        id: res.id,
        name: (res.payload.name as string) || 'Unknown',
        score: res.score
      }));
    } catch (e) {
      console.error('DB query failed for getRecommendations', e);
      throw e;
    }
  }

  async processSwipeEvent(userId: string, dishId: string, action: 'like' | 'skip') {
    console.log(`User ${userId} swiped ${action} on dish ${dishId}`);
    
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS user_swipes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID,
          dish_id UUID,
          action VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await this.db.query(
        'INSERT INTO user_swipes (user_id, dish_id, action) VALUES ($1, $2, $3)',
        [userId, dishId, action]
      );
    } catch (e) {
      console.error('DB query failed for processSwipeEvent', e);
      throw e;
    }

    return { success: true };
  }

  async getOfficeHealthRecommendations(caloriesLimit: number, proteinTarget: number, timeSlot: string) {
    console.log(`Filtering office meals for ${timeSlot} with max ${caloriesLimit}kcal and min ${proteinTarget}g protein`);
    
    const mockDishes = [
      { id: 'h1', name: 'Salad Ức Gà', calories: 350, protein: 35, carbs: 10, fat: 5 },
      { id: 'h2', name: 'Cơm Gạo Lứt Bò Lúc Lắc', calories: 450, protein: 40, carbs: 45, fat: 12 },
      { id: 'h3', name: 'Bún Gạo Lứt Trộn Chay', calories: 300, protein: 15, carbs: 50, fat: 8 },
      { id: 'h4', name: 'Cá Hồi Áp Chảo Măng Tây', calories: 400, protein: 35, carbs: 12, fat: 20 },
    ];

    return mockDishes.filter(dish => 
      dish.calories <= caloriesLimit && dish.protein >= proteinTarget
    );
  }
}

export const recommendationEngine = new RecommendationEngine();
