import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
});

async function run() {
  console.log('[Seed] Seeding data for test@example.com...');

  try {
    const testUserId = 'c0390890-34e4-4142-a3b6-6bed2df77328';
    
    // Check if test user exists
    const res = await db.query('SELECT * FROM users WHERE id = $1', [testUserId]);
    if (res.rows.length === 0) {
      console.error('[Seed] test@example.com does not exist. Run seed.sql first.');
      return;
    }

    // 1. Create a 1-person group for Trip Planner
    const groupId = randomUUID();
    await db.query(`
      INSERT INTO groups (id, name, created_at)
      VALUES ($1, 'Trip Planner (Cá nhân)', NOW())
    `, [groupId]);

    await db.query(`
      INSERT INTO group_members (group_id, user_id, joined_at)
      VALUES ($1, $2, NOW())
    `, [groupId, testUserId]);

    console.log('[Seed] Created 1-person group for Trip Planner.');

    // 2. Add some mock swipes to generate AI recommendations
    // Get some random dishes
    const dishesRes = await db.query('SELECT id FROM dishes LIMIT 10');
    if (dishesRes.rows.length > 0) {
      for (let i = 0; i < dishesRes.rows.length; i++) {
        const dishId = dishesRes.rows[i].id;
        const action = i % 2 === 0 ? 'LIKE' : 'SKIP';
        await db.query(`
          INSERT INTO user_swipes (user_id, dish_id, action, created_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (user_id, dish_id) DO UPDATE SET action = $3, created_at = NOW()
        `, [testUserId, dishId, action]);
      }
      console.log(`[Seed] Added ${dishesRes.rows.length} mock swipes for test user.`);
    }

    // 3. Add some feed posts
    const postRes = await db.query('SELECT * FROM posts WHERE author_id = $1', [testUserId]);
    if (postRes.rows.length === 0) {
        await db.query(`
          INSERT INTO posts (id, author_id, video_url, caption, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [randomUUID(), testUserId, 'https://test-video.mp4', 'Đây là video đầu tiên của tôi!']);
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
