import { Pool } from 'pg';
import Redis from 'ioredis';
import { QdrantClient } from '@qdrant/js-client-rest';
import { Kafka, Admin } from 'kafkajs';

const enabled = process.env.RUN_INTEGRATION_TESTS === 'true';
const describeIntegration = enabled ? describe : describe.skip;

describeIntegration('Infrastructure integration', () => {
  let pool: Pool | undefined;
  let redis: Redis | undefined;
  let qdrant: QdrantClient | undefined;
  let admin: Admin | undefined;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend',
      connectionTimeoutMillis: 1500
    });
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 1500,
      retryStrategy: () => null
    });
    qdrant = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      checkCompatibility: false,
      timeout: 1500
    });
    admin = new Kafka({
      clientId: 'foodrecommend-integration-test',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      connectionTimeout: 1500,
      retry: { retries: 0 }
    }).admin();

    try {
      await pool.query('SELECT 1');
      await redis.connect();
      await redis.ping();
      await qdrant.getCollections();
      await admin.connect();
    } catch (error) {
      await Promise.allSettled([
        pool.end(),
        redis.quit(),
        admin.disconnect()
      ]);
      throw new Error('Infrastructure integration prerequisites are unavailable', { cause: error });
    }
  });

  afterAll(async () => {
    await Promise.allSettled([
      pool?.end(),
      redis?.quit(),
      admin?.disconnect()
    ]);
  });

  it('verifies PostgreSQL, Redis, Qdrant and Kafka connectivity', async () => {
    const result = await pool!.query<{ table_name: string | null }>(
      "SELECT to_regclass('public.user_swipes')::text AS table_name"
    );

    expect(result.rows[0].table_name).toBe('user_swipes');
    const key = `foodrecommend:test:${Date.now()}`;
    await redis!.set(key, 'ok', 'EX', 30);

    await expect(redis!.get(key)).resolves.toBe('ok');
    await redis!.del(key);
    const [collections, topics] = await Promise.all([
      qdrant!.getCollections(),
      admin!.listTopics()
    ]);

    expect(Array.isArray(collections.collections)).toBe(true);
    expect(Array.isArray(topics)).toBe(true);
  });
});
