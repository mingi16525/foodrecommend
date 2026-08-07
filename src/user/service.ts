import { db } from '../db';

export interface UserPreferences {
  favorite_flavors?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  hated_dishes?: string[];
}

export class UserService {
  private db = db;

  async getUserProfile(userId: string) {
    try {
      const userResult = await this.db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const prefResult = await this.db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);

      if (userResult.rows.length === 0) return null;

      let postsCount = 0;
      let reviewsCount = 0;
      let savedCount = 0;

      try {
        const postsRes = await this.db.query('SELECT count(*) FROM posts WHERE user_id = $1', [userId]);
        postsCount = parseInt(postsRes.rows[0]?.count || '0', 10);
        reviewsCount = postsCount; // Assuming posts are reviews for MVP
      } catch (e) {
        // posts table might be empty or missing
      }

      try {
        const swipesRes = await this.db.query("SELECT count(*) FROM user_swipes WHERE user_id = $1 AND action = 'LIKE'", [userId]);
        savedCount = parseInt(swipesRes.rows[0]?.count || '0', 10);
      } catch (e) {
        // user_swipes table might not exist yet
      }

      return {
        ...userResult.rows[0],
        preferences: prefResult.rows[0] || null,
        posts_count: postsCount,
        reviews_count: reviewsCount,
        saved_count: savedCount
      };
    } catch (e) {
      console.error('DB error in getUserProfile', e);
      throw e;
    }
  }

  async updatePreferences(userId: string, preferences: UserPreferences) {
    try {
      const { favorite_flavors, allergies, dietary_restrictions, hated_dishes } = preferences;
      
      const query = `
        INSERT INTO user_preferences (user_id, favorite_flavors, allergies, dietary_restrictions, hated_dishes)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET 
          favorite_flavors = EXCLUDED.favorite_flavors,
          allergies = EXCLUDED.allergies,
          dietary_restrictions = EXCLUDED.dietary_restrictions,
          hated_dishes = EXCLUDED.hated_dishes
        RETURNING *;
      `;
      
      const res = await this.db.query(query, [
        userId, 
        JSON.stringify(favorite_flavors || []),
        JSON.stringify(allergies || []),
        JSON.stringify(dietary_restrictions || []),
        JSON.stringify(hated_dishes || [])
      ]);
      
      return res.rows[0];
    } catch (e) {
      console.error('DB error in updatePreferences', e);
      throw e;
    }
  }
}

export const userService = new UserService();
