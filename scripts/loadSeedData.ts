import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { QdrantClient } from '@qdrant/js-client-rest';

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
});

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  checkCompatibility: false
});

async function run() {
  console.log('[Seed] Starting data preparation...');

  try {
    // 1. Run seed.sql
    const seedSqlPath = path.join(__dirname, '..', 'seed.sql');
    if (fs.existsSync(seedSqlPath)) {
      console.log('[Seed] Executing seed.sql...');
      const sql = fs.readFileSync(seedSqlPath, 'utf8');
      await db.query(sql);
      console.log('[Seed] seed.sql executed successfully.');
    } else {
      console.warn('[Seed] seed.sql not found at', seedSqlPath);
    }

    // 2. Load embeddings into Qdrant
    const jsonPath = path.join(__dirname, '..', 'dish_embeddings.json');
    if (fs.existsSync(jsonPath)) {
      console.log('[Seed] Loading dish_embeddings.json...');
      const rawData = fs.readFileSync(jsonPath, 'utf8');
      const dishes = JSON.parse(rawData);

      const collectionName = 'dishes';

      // Ensure collection exists
      try {
        const collections = await qdrant.getCollections();
        const exists = collections.collections.find(c => c.name === collectionName);
        if (!exists) {
          console.log(`[Seed] Creating Qdrant collection: ${collectionName}...`);
          await qdrant.createCollection(collectionName, {
            vectors: {
              size: 384, // all-MiniLM-L6-v2 output dimension
              distance: 'Cosine'
            }
          });
        }
      } catch (e) {
        console.warn('[Seed] Warning on Qdrant collection check:', e);
      }

      // Upsert points
      const points = dishes.map((d: any) => ({
        id: d.id, // Must be UUID
        vector: d.embedding,
        payload: {
          name: d.name,
          ingredients: d.ingredients || []
        }
      }));

      if (points.length > 0) {
        console.log(`[Seed] Upserting ${points.length} points to Qdrant...`);
        await qdrant.upsert(collectionName, {
          wait: true,
          points: points
        });
        console.log('[Seed] Upsert complete.');
      }
    } else {
      console.warn('[Seed] dish_embeddings.json not found at', jsonPath);
    }

    console.log('[Seed] Data preparation finished successfully.');
  } catch (error) {
    console.error('[Seed] Error during data preparation:', error);
  } finally {
    await db.end();
  }
}

run();
