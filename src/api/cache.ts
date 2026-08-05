import Redis from 'ioredis';

class CacheClient {
  private redis: Redis | null = null;
  private memoryFallback: Map<string, { value: string; expiry: number }> = new Map();
  private isConnected = false;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 times
        return Math.min(times * 50, 2000);
      }
    });

    this.redis.on('connect', () => {
      console.log('[Cache] Redis connected.');
      this.isConnected = true;
    });

    this.redis.on('error', (err) => {
      console.warn('[Cache] Redis error:', err.message);
      this.isConnected = false;
    });
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        // fallback
      }
    }
    const data = this.memoryFallback.get(key);
    if (!data) return null;
    if (Date.now() > data.expiry) {
      this.memoryFallback.delete(key);
      return null;
    }
    return data.value;
  }

  async setEx(key: string, seconds: number, value: string): Promise<void> {
    if (this.isConnected && this.redis) {
      try {
        await this.redis.setex(key, seconds, value);
        return;
      } catch {
        // fallback
      }
    }
    const expiry = Date.now() + seconds * 1000;
    this.memoryFallback.set(key, { value, expiry });
  }

  async quit() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export const redisCache = new CacheClient();

export const withCache = async <T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> => {
  try {
    const cachedData = await redisCache.get(key);
    if (cachedData) {
      console.log(`[Cache Hit] Key: ${key}`);
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.warn('[Cache Error] Failed to read from cache:', error);
  }

  console.log(`[Cache Miss] Fetching fresh data for Key: ${key}`);
  const freshData = await fetcher();

  try {
    await redisCache.setEx(key, ttlSeconds, JSON.stringify(freshData));
  } catch (error) {
    console.warn('[Cache Error] Failed to write to cache:', error);
  }

  return freshData;
};
