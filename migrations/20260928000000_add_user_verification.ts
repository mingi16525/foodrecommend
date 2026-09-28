import { Pool } from 'pg';

export async function up(db: Pool) {
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    UPDATE users SET is_verified = TRUE; -- Auto verify existing users
  `);
}

export async function down(db: Pool) {
  await db.query(`
    ALTER TABLE users DROP COLUMN IF NOT EXISTS is_verified;
  `);
}
