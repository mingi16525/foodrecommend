/* eslint-disable */
// Mock Redis Client for Caching Layer
class MockRedisClient {
  private cache: Map<string, { value: string, expiry: number }> = new Map();

  async connect() {
    console.log('[Redis] Mock connection established.');
  }

  async get(key: string): Promise<string | null> {
    const data = this.cache.get(key);
    if (!data) return null;
    
    if (Date.now() > data.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return data.value;
  }

  async setEx(key: string, seconds: number, value: string): Promise<void> {
    const expiry = Date.now() + (seconds * 1000);
    this.cache.set(key, { value, expiry });
  }

  async quit() {
    console.log('[Redis] Mock connection closed.');
  }
}

export const redisCache = new MockRedisClient();

export const withCache = async (key: string, ttlSeconds: number, fetcher: () => Promise<any>) => {
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
