/* eslint-disable */
import { QdrantClient } from '@qdrant/js-client-rest';
import { Pool } from 'pg';
export class RecommendationEngine {
  private qdrant: QdrantClient;
  private db: Pool;
  private extractor: any;

  constructor() {
    this.qdrant = new QdrantClient({ 
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      checkCompatibility: false
    });
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
    });
    // Removed initModel() from constructor to avoid async overhead during test initialization
  }

  async initModel() {
    if (!this.extractor) {
      console.log('Loading local AI model (all-MiniLM-L6-v2) for Recommendation Engine...');
      // Use dynamic import to avoid ESM issues in CommonJS/Jest
      const transformers = await Function('return import("@xenova/transformers")')();
      this.extractor = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Model loaded successfully.');
    }
  }

  async getRecommendations(userId: string) {
    console.log(`Getting Local Beta AI recommendations for ${userId}`);
    await this.initModel(); // Ensure model is loaded

    try {
      // 1. Fetch user preferences
      const userPref = await this.db.query(
        'SELECT favorite_flavors, allergies FROM user_preferences WHERE user_id = $1',
        [userId]
      );
      
      const flavors = userPref.rows[0]?.favorite_flavors || ['savory'];
      const allergies = userPref.rows[0]?.allergies || [];
      
      // 2. Generate Context Embedding based on user flavors
      const textToEmbed = `Flavor preferences: ${flavors.join(", ")}`;
      const embeddingResult = await this.extractor(textToEmbed, { pooling: 'mean', normalize: true });
      const vector = Array.from(embeddingResult.data);

      // 3. Build Qdrant Filter (Remove allergies)
      const mustNotConditions = allergies.map((allergy: string) => ({
        key: 'ingredients',
        match: { value: allergy }
      }));

      // 4. Candidate Generation (Vector Search in Qdrant)
      const qdrantResults = await this.qdrant.search('dishes', {
        vector: vector as number[],
        limit: 10,
        filter: mustNotConditions.length > 0 ? { must_not: mustNotConditions } : undefined,
      });

      // 5. Ranking Stage (Content-based + Mock Swipe History scoring)
      // In a full implementation, we'd query Redis for the user's swipe history and boost scores.
      const rankedResults = qdrantResults.map(res => {
        // Here we just use the raw cosine similarity score as the ranking score
        return {
          id: res.id,
          name: res.payload?.name || 'Unknown',
          score: res.score,
          ingredients: res.payload?.ingredients || []
        };
      });

      return rankedResults;
    } catch (e) {
      console.error('Error in AI Pipeline getRecommendations:', e);
      // Fallback
      return [
        { id: '1', name: 'Fallback Phở Bò', score: 0.99 },
        { id: '2', name: 'Fallback Bún Chả', score: 0.95 }
      ];
    }
  }

  async processSwipeEvent(userId: string, dishId: string, action: 'like' | 'skip') {
    console.log(`User ${userId} swiped ${action} on dish ${dishId}`);
    
    // Insert swipe action into Postgres
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
    }
    return { success: true };
  }
}

export const recommendationEngine = new RecommendationEngine();
