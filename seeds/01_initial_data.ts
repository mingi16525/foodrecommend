import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries in reverse order of foreign keys
  await knex('loyalty_history').del();
  await knex('payments').del();
  await knex('group_swipes').del();
  await knex('group_members').del();
  await knex('group_orders').del();
  await knex('groups').del();
  await knex('posts').del();
  await knex('social_interactions').del();
  await knex('social_connections').del();
  await knex('user_swipes').del();
  await knex('users').del();
  await knex('restaurants').del();

  // Seed Restaurants
  const restaurants = [
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Quán Phở Ngon',
      address: '123 Nguyễn Văn Cừ, Q5',
      category: 'Vietnamese',
      price_level: 2,
      location: knex.raw('ST_SetSRID(ST_MakePoint(106.68, 10.76), 4326)'),
      rating: 4.5,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'BBQ King',
      address: '456 Lê Lợi, Q1',
      category: 'Korean',
      price_level: 3,
      location: knex.raw('ST_SetSRID(ST_MakePoint(106.70, 10.77), 4326)'),
      rating: 4.2,
    }
  ];

  await knex('restaurants').insert(restaurants);

  // Seed Users
  const user1Id = knex.raw('gen_random_uuid()');
  const user2Id = knex.raw('gen_random_uuid()');

  await knex('users').insert([
    {
      id: user1Id,
      email: 'test1@example.com',
      password_hash: '$2b$10$Ep2Q9/Lg.s0Z7O59gR2S/u0vG/o7D9kQkPj3P9kQkPj3P9kQkPj3P9', // mock hash
      full_name: 'Người Dùng 1',
      preferences: JSON.stringify({ "allergies": [] }),
      points: 100,
      referral_code: 'REF123',
    },
    {
      id: user2Id,
      email: 'test2@example.com',
      password_hash: '$2b$10$Ep2Q9/Lg.s0Z7O59gR2S/u0vG/o7D9kQkPj3P9kQkPj3P9kQkPj3P9', // mock hash
      full_name: 'Người Dùng 2',
      preferences: JSON.stringify({ "allergies": ["peanut"] }),
      points: 0,
      referral_code: 'REF456',
    }
  ]);

  // Seed Posts
  await knex('posts').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      user_id: user1Id,
      content: 'Bữa nay ăn bún đậu mắm tôm ngon bá cháy',
      media_urls: JSON.stringify(['https://example.com/image1.jpg']),
    }
  ]);
}
