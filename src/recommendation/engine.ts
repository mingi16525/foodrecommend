/* eslint-disable */
import { QdrantClient } from '@qdrant/js-client-rest';
import { db } from '../db';
export class RecommendationEngine {
  private qdrant: QdrantClient;
  private db = db;
  private extractor: any;
  private extractorPromise: Promise<any> | null = null;

  constructor() {
    this.qdrant = new QdrantClient({ 
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      checkCompatibility: false
    });
    // Removed initModel() from constructor to avoid async overhead during test initialization
  }

  async initModel() {
    if (this.extractor) return;
    if (!this.extractorPromise) {
      this.extractorPromise = (async () => {
        console.log('Loading local AI model (all-MiniLM-L6-v2) for Recommendation Engine...');
        // Jest runs CommonJS without the VM ESM loader; production keeps the ESM path.
        const transformers = process.env.NODE_ENV === 'test'
          ? require('@xenova/transformers')
          : await Function('return import("@xenova/transformers")')();
        const extractor = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('Model loaded successfully.');
        return extractor;
      })();
    }

    try {
      this.extractor = await this.extractorPromise;
    } catch (error) {
      this.extractorPromise = null;
      throw error;
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
      const flavors = Array.isArray(userPref.rows[0]?.favorite_flavors)
        ? userPref.rows[0].favorite_flavors.filter((value: unknown): value is string => typeof value === 'string')
        : [];
      const allergies = Array.isArray(userPref.rows[0]?.allergies)
        ? userPref.rows[0].allergies.filter((value: unknown): value is string => typeof value === 'string')
        : [];
      return {
        flavors: flavors.length > 0 ? flavors : ['savory'],
        allergies
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
      await this.db.query(
        'INSERT INTO user_swipes (user_id, dish_id, action) VALUES ($1, $2, $3)',
        [userId, dishId, action]
      );
    } catch (e) {
      console.error('DB query failed for processSwipeEvent', e);
      throw new Error('Failed to persist swipe event', { cause: e });
    }
    return { success: true };
  }
}

export const recommendationEngine = new RecommendationEngine();
