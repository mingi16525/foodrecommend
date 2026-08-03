import { QdrantClient } from '@qdrant/js-client-rest';
import { Pool } from 'pg';

export class RecommendationEngine {
  private qdrant: QdrantClient;
  private db: Pool;

  constructor() {
    // Initialization logic for AI Engine & DB clients
    this.qdrant = new QdrantClient({ 
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      checkCompatibility: false
    });
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://food:foodpass123@localhost:5432/foodrecommend'
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
      
      const flavorCount = userPref.rows[0]?.favorite_flavors?.length || 0;
      
      // 2. Mock vector search with Qdrant
      // In reality: await this.qdrant.search('dishes', { vector: userPref.rows[0]?.embedding || defaultVector, limit: 10 });
      const qdrantResults = await this.qdrant.search('dishes', {
        vector: [0.1, 0.2, 0.3, 0.4 + flavorCount],
        limit: 2
      }).catch(() => {
        // Fallback if Qdrant is not running or collection is missing
        return [
          { id: '1', score: 0.98, payload: { name: 'Phở Bò' } },
          { id: '2', score: 0.95, payload: { name: 'Bún Chả' } }
        ];
      });

      return qdrantResults.map(res => ({
        id: res.id,
        name: res.payload?.name || 'Unknown',
        score: res.score
      }));
    } catch (e) {
      console.warn('DB query failed for getRecommendations', e);
      return [
        { id: '1', name: 'Phở Bò', score: 0.98 },
        { id: '2', name: 'Bún Chả', score: 0.95 }
      ];
    }
  }

  async processSwipeEvent(userId: string, dishId: string, action: 'like' | 'skip') {
    console.log(`User ${userId} swiped ${action} on dish ${dishId}`);
    
    // 1. Insert swipe action into Postgres
    try {
      // Create table dynamically if not exists for MVP, or just insert
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
      console.warn('DB query failed for processSwipeEvent', e);
    }

    // 2. Adjust user embedding in Qdrant (placeholder)
    // await this.qdrant.upsert('users', { wait: true, points: [...] });

    return { success: true };
  }
}

export const recommendationEngine = new RecommendationEngine();
