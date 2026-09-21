import { db } from '../db';

export class LoyaltyService {
  async getLoyaltyInfo(userId: string) {
    const userResult = await db.query(
      'SELECT points, referral_code FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const historyResult = await db.query(
      'SELECT * FROM loyalty_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    return {
      points: userResult.rows[0].points,
      referral_code: userResult.rows[0].referral_code,
      history: historyResult.rows,
    };
  }

  async processReferral(userId: string, code: string) {
    const referrerResult = await db.query(
      'SELECT id FROM users WHERE referral_code = $1',
      [code]
    );

    if (referrerResult.rows.length === 0) {
      throw new Error('Invalid referral code');
    }

    const referrerId = referrerResult.rows[0].id;
    if (referrerId === userId) {
      throw new Error('Cannot use own referral code');
    }

    // Check if this user already used a code (we can query loyalty_history for 'Welcome bonus from referral')
    const usedCodeResult = await db.query(
      "SELECT id FROM loyalty_history WHERE user_id = $1 AND reason = 'Welcome bonus from referral'",
      [userId]
    );

    if (usedCodeResult.rows.length > 0) {
      throw new Error('Referral code already used');
    }

    // Add points in a transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Add points to referrer (e.g. 50 points)
      await client.query(
        'UPDATE users SET points = points + 50 WHERE id = $1',
        [referrerId]
      );
      await client.query(
        "INSERT INTO loyalty_history (user_id, points_change, reason) VALUES ($1, $2, $3)",
        [referrerId, 50, `Referred user ${userId}`]
      );

      // Add points to new user (e.g. 50 points)
      await client.query(
        'UPDATE users SET points = points + 50 WHERE id = $1',
        [userId]
      );
      await client.query(
        "INSERT INTO loyalty_history (user_id, points_change, reason) VALUES ($1, $2, $3)",
        [userId, 50, 'Welcome bonus from referral']
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

export const loyaltyService = new LoyaltyService();
