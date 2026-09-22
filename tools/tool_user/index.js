require('dotenv').config({ path: '../../.env' });
const { Client } = require('pg');
const { fakerVI: faker } = require('@faker-js/faker');
const { Kafka } = require('kafkajs');

async function createUsers(db) {
  console.log('Tạo 10 Premium Users và 20 Free Users...');
  const users = [];
  
  for (let i = 1; i <= 10; i++) {
    users.push({
      email: `user_premium_${i.toString().padStart(3, '0')}@example.com`,
      fullName: faker.person.fullName(),
      tier: 'PREMIUM'
    });
  }
  for (let i = 11; i <= 30; i++) {
    users.push({
      email: `user_free_${i.toString().padStart(3, '0')}@example.com`,
      fullName: faker.person.fullName(),
      tier: 'FREE'
    });
  }

  const insertedUserIds = [];
  for (const user of users) {
    console.log(`Đang lưu user: ${user.email} - ${user.tier}`);
    const res = await db.query(
      `INSERT INTO users (email, password_hash, full_name, subscription_tier) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`, 
      [user.email, 'hashed_password', user.fullName, user.tier]
    );
    insertedUserIds.push(res.rows[0].id);
  }
  return insertedUserIds;
}

async function simulateBehavior(db, producer, userIds, kafkaConnected) {
  console.log('Mô phỏng hành vi: Swiping...');
  
  // Lấy danh sách món ăn
  const dishRes = await db.query('SELECT id FROM dishes LIMIT 100');
  const dishes = dishRes.rows.map(r => r.id);
  
  if (dishes.length === 0) {
    console.log('Không có món ăn nào trong DB để swipe!');
    return;
  }

  // Mỗi user swipe 5-10 món ngẫu nhiên
  for (const userId of userIds) {
    const swipeCount = Math.floor(Math.random() * 5) + 5;
    for (let i = 0; i < swipeCount; i++) {
      const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
      const action = Math.random() > 0.2 ? 'like' : 'skip'; // 80% like
      
      const payload = {
        userId,
        dishId: randomDish,
        action,
        timestamp: new Date().toISOString()
      };

      if (kafkaConnected) {
        await producer.send({
          topic: 'swipe-events',
          messages: [{ value: JSON.stringify(payload) }]
        });
      }

      // Lưu luôn vào DB để đảm bảo có dữ liệu
      await db.query(
        'INSERT INTO user_swipes (user_id, dish_id, action, created_at) VALUES ($1, $2, $3, $4)',
        [userId, randomDish, action, payload.timestamp]
      );
      
      console.log(`User ${userId} swiped ${action} on dish ${randomDish}`);
    }
  }
}

async function main() {
  const db = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/food_recommend_db'
  });
  
  const kafka = new Kafka({
    clientId: 'tool_user',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });
  const producer = kafka.producer();

  try {
    await db.connect();
    console.log('Connected to DB');
    
    let kafkaConnected = false;
    try {
      await producer.connect();
      console.log('Connected to Kafka');
      kafkaConnected = true;
    } catch (e) {
      console.log('Kafka connection failed, skipping event generation (users will still be inserted).');
    }
    
    const userIds = await createUsers(db);
    await simulateBehavior(db, producer, userIds, kafkaConnected);
    
    console.log('Mô phỏng người dùng hoàn tất!');
  } catch (err) {
    console.error('Simulation error:', err);
  } finally {
    try { await producer.disconnect(); } catch (e) {}
    await db.end();
  }
}

main();
