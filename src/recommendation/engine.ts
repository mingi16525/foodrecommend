/* eslint-disable */
import { QdrantClient } from '@qdrant/js-client-rest';
import { db } from '../db';
export class RecommendationEngine {
  private qdrant: QdrantClient;
  private db = db;
  private extractor: any;

  constructor() {
    this.qdrant = new QdrantClient({ 
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      checkCompatibility: false
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

  async generateEmbedding(text: string): Promise<number[]> {
    await this.initModel();
    try {
      const embeddingResult = await this.extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(embeddingResult.data);
    } catch (e) {
      console.error('Error generating embedding', e);
      return [];
    }
  }

  async searchDishes(vector: number[], limit: number = 50, filterCondition?: any) {
    if (vector.length === 0) return [];
    try {
      const qdrantResults = await this.qdrant.search('dishes', {
        vector: vector as number[],
        limit: limit,
        filter: filterCondition,
        with_payload: true,
      });
      return qdrantResults.map(res => ({
        id: res.id,
        score: res.score,
        payload: res.payload
      }));
    } catch (e) {
      console.error('Error in Qdrant search:', e);
      return [];
    }
  }

  async getUserPreferences(userId: string) {
    try {
      const userPref = await this.db.query(
        'SELECT favorite_flavors, allergies FROM user_preferences WHERE user_id = $1',
        [userId]
      );
      return {
        flavors: userPref.rows[0]?.favorite_flavors || ['savory'],
        allergies: userPref.rows[0]?.allergies || []
      };
    } catch (e) {
      console.error('Error fetching user preferences:', e);
      return { flavors: ['savory'], allergies: [] };
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
