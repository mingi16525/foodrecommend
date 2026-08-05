import Redis from 'ioredis';

// Mock in-memory storage if Redis is not available
const memoryCache: Record<string, unknown> = {};

export class FeatureStore {
  private redis: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 2) {
          console.warn('[FeatureStore] Redis connection failed, switching to memory mock.');
          return null;
        }
        return Math.min(times * 50, 2000);
      }
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
      console.log('[FeatureStore] Connected to Redis.');
    });

    this.redis.on('error', (err) => {
      if (this.isConnected) {
        console.warn('[FeatureStore] Redis Error:', err.message);
      }
      this.isConnected = false;
    });
  }

  public async getUserFeatures(userId: string): Promise<{ flavors: string[], allergies: string[] } | null> {
    try {
      if (this.isConnected && this.redis) {
        const data = await this.redis.get(`user:features:${userId}`);
        if (data) return JSON.parse(data);
      } else {
        if (memoryCache[userId]) return memoryCache[userId];
      }
    } catch (e) {
      console.warn('[FeatureStore] Error getting user features:', e);
    }
    return null;
  }

  public async updateUserFeatures(userId: string, dishId: string, action: 'like' | 'skip') {
    // Trong thực tế, chúng ta lấy đặc trưng của món ăn (dishId) từ CSDL
    // sau đó cộng/trừ trọng số của đặc trưng đó vào Profile của User.
    // Ở đây ta mô phỏng đơn giản việc lưu vết update.
    
    console.log(`[FeatureStore] Updating features for User ${userId}, Action: ${action} on Dish ${dishId}`);
    
    // Mock get existing
    let currentPrefs = await this.getUserFeatures(userId);
    if (!currentPrefs) {
      currentPrefs = { flavors: ['savory'], allergies: [] }; // Default
    }

    // Giả lập logic: Nếu like thì củng cố flavors, v.v...
    if (action === 'like') {
      if (!currentPrefs.flavors.includes('spicy')) {
        // Just mock adding a flavor to demonstrate updates
        currentPrefs.flavors.push('spicy');
      }
    }

    try {
      if (this.isConnected && this.redis) {
        await this.redis.set(`user:features:${userId}`, JSON.stringify(currentPrefs), 'EX', 3600); // 1h expiry
      } else {
        memoryCache[userId] = currentPrefs;
      }
      console.log(`[FeatureStore] Successfully updated profile for User ${userId}.`);
    } catch (e) {
      console.warn('[FeatureStore] Error setting user features:', e);
    }
  }
}

export const featureStore = new FeatureStore();
