import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
});

db.on('connect', () => {
  console.log('[PostgreSQL] Connected to the database');
});

db.on('error', (err) => {
  console.error('[PostgreSQL] Database error:', err.message);
});
