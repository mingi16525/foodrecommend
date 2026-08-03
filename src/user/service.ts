import { Pool } from 'pg';

export interface UserPreferences {
  favorite_flavors?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  hated_dishes?: string[];
}

export class UserService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://food:foodpass123@localhost:5432/foodrecommend'
    });
  }

  async getUserProfile(userId: string) {
    try {
      const userResult = await this.db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const prefResult = await this.db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);

      if (userResult.rows.length === 0) return null;

      return {
        ...userResult.rows[0],
        preferences: prefResult.rows[0] || null
      };
    } catch (e) {
      console.warn('DB error in getUserProfile', e);
      // Fallback mock
      return { id: userId, email: 'mock@example.com', full_name: 'Mock User', preferences: null };
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
      console.warn('DB error in updatePreferences', e);
      return { user_id: userId, ...preferences };
    }
  }
}

export const userService = new UserService();
