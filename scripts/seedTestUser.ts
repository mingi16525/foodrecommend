import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
});

async function run() {
  console.log('[Seed] Seeding data for test@example.com...');

  try {
    // Check if test user exists
    const res = await db.query("SELECT * FROM users WHERE email = 'test@example.com'");
    if (res.rows.length === 0) {
      console.error('[Seed] test@example.com does not exist. Run seed.sql first.');
      return;
    }
    const testUserId = res.rows[0].id;

    // 1. Create a 1-person group for Trip Planner
    const groupId = randomUUID();
    await db.query(`
      INSERT INTO groups (id, name, created_at)
      VALUES ($1, 'Trip Planner (Cá nhân)', NOW())
    `, [groupId]);

    await db.query(`
      INSERT INTO group_members (group_id, user_id)
      VALUES ($1, $2)
    `, [groupId, testUserId]);

    console.log('[Seed] Created 1-person group for Trip Planner.');

    // 2. Add some mock swipes (Skipped because user_swipes table doesn't exist. Swipes are likely handled by Redis/Kafka in featureStore)

    // 3. Add some feed posts
    const postRes = await db.query('SELECT * FROM posts WHERE user_id = $1', [testUserId]);
    if (postRes.rows.length === 0) {
        await db.query(`
          INSERT INTO posts (id, user_id, post_type, video_url, content, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [randomUUID(), testUserId, 'video', 'https://test-video.mp4', 'Đây là video đầu tiên của tôi!']);
        console.log('[Seed] Added mock post for test user.');
    }

    console.log('[Seed] test@example.com seeding finished successfully.');
  } catch (error) {
    console.error('[Seed] Error during data preparation:', error);
  } finally {
    await db.end();
  }
}

run();
