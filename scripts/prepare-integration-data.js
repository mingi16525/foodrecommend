const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { Kafka } = require('kafkajs');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';
const collectionName = 'dishes';

const pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
const redis = new Redis(redisUrl, { connectTimeout: 5000, maxRetriesPerRequest: 1 });
const qdrant = new QdrantClient({ url: qdrantUrl, checkCompatibility: false, timeout: 5000 });
const admin = new Kafka({
  clientId: 'foodrecommend-test-preparer',
  brokers: [kafkaBroker],
  connectionTimeout: 5000,
  retry: { retries: 2 }
}).admin();

async function ensureSwipeTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_swipes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
      action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'skip')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS user_swipes_user_created_idx ON user_swipes (user_id, created_at DESC)');
}

async function ensureQdrantData() {
  const embeddingPath = path.join(__dirname, '..', 'dish_embeddings.json');
  if (!fs.existsSync(embeddingPath)) {
    throw new Error('dish_embeddings.json is missing; generate embeddings before preparing integration data');
  }

  const embeddings = JSON.parse(fs.readFileSync(embeddingPath, 'utf8'));
  if (!Array.isArray(embeddings) || embeddings.length === 0 || embeddings.some((dish) => dish.embedding?.length !== 384)) {
    throw new Error('dish_embeddings.json must contain non-empty 384-dimensional embeddings');
  }

  const dishes = await pool.query(`
    SELECT d.id, d.name, d.ingredients, d.restaurant_id, r.location
    FROM dishes d
    LEFT JOIN restaurants r ON r.id = d.restaurant_id
  `);
  const dishById = new Map(dishes.rows.map((dish) => [dish.id, dish]));
  const points = embeddings.map((embedding) => {
    const dish = dishById.get(embedding.id);
    const location = dish?.location || {};
    return {
      id: embedding.id,
      vector: embedding.embedding,
      payload: {
        name: dish?.name || embedding.name,
        ingredients: dish?.ingredients || embedding.ingredients || [],
        restaurant_id: dish?.restaurant_id,
        lat: Number(location.lat),
        lng: Number(location.lng)
      }
    };
  });

  const collections = await qdrant.getCollections();
  if (!collections.collections.some((collection) => collection.name === collectionName)) {
    await qdrant.createCollection(collectionName, {
      vectors: { size: 384, distance: 'Cosine' }
    });
  }
  await qdrant.upsert(collectionName, { wait: true, points });
  const info = await qdrant.getCollection(collectionName);
  if (info.points_count !== points.length) {
    throw new Error(`Qdrant point count mismatch: expected ${points.length}, got ${info.points_count}`);
  }
  return points.length;
}

async function prepare() {
  await pool.query('SELECT 1');
  await redis.ping();
  await admin.connect();
  await ensureSwipeTable();
  const pointCount = await ensureQdrantData();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{ topic: 'swipe-events', numPartitions: 1, replicationFactor: 1 }]
  }).catch((error) => {
    if (!String(error.message).toLowerCase().includes('already exists')) throw error;
  });

  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS users,
      (SELECT COUNT(*)::int FROM restaurants) AS restaurants,
      (SELECT COUNT(*)::int FROM dishes) AS dishes,
      (SELECT COUNT(*)::int FROM posts) AS posts,
      (SELECT COUNT(*)::int FROM user_swipes) AS swipes
  `);
  console.log(JSON.stringify({ database: counts.rows[0], qdrantPoints: pointCount, kafkaTopic: 'swipe-events' }, null, 2));
}

prepare()
  .then(async () => {
    await Promise.all([pool.end(), redis.quit(), admin.disconnect()]);
  })
  .catch(async (error) => {
    console.error('[test:prepare] failed:', error.message);
    await Promise.allSettled([pool.end(), redis.quit(), admin.disconnect()]);
    process.exitCode = 1;
  });
