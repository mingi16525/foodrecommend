import { db } from '../db';

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  rating?: number;
  tags?: string[];
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  price?: number;
}

export class RestaurantService {
  private db = db;

  async getRestaurantById(id: string) {
    try {
      const restResult = await this.db.query('SELECT * FROM restaurants WHERE id = $1', [id]);
      if (restResult.rows.length === 0) return null;

      const dishesResult = await this.db.query('SELECT * FROM dishes WHERE restaurant_id = $1 LIMIT 5', [id]);

      return {
        ...restResult.rows[0],
        dishes: dishesResult.rows
      };
    } catch (e) {
      console.error('DB error in getRestaurantById', e);
      throw e;
    }
  }

  async getDishesByRestaurantId(id: string) {
    try {
      const dishesResult = await this.db.query('SELECT * FROM dishes WHERE restaurant_id = $1', [id]);
      return dishesResult.rows;
    } catch (e) {
      console.error('DB error in getDishesByRestaurantId', e);
      throw e;
    }
  }

  async searchRestaurants(query: string) {
    try {
      const result = await this.db.query(
        'SELECT * FROM restaurants WHERE name ILIKE $1 LIMIT 10',
        [`%${query}%`]
      );
      return result.rows;
    } catch (e) {
      console.error('DB error in searchRestaurants', e);
      throw e;
    }
  }

  async createRestaurant(userId: string, name: string, address: string, geohash?: string) {
    try {
      const result = await this.db.query(
        'INSERT INTO restaurants (name, address, geohash, is_verified, claimed_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, address, geohash, false, null] // auto-created are unverified by default
      );
      return result.rows[0];
    } catch (e) {
      console.error('DB error in createRestaurant', e);
      throw e;
    }
  }

  async claimRestaurant(restaurantId: string, userId: string) {
    try {
      // Đăng ký quyền sở hữu nhưng is_verified = false (chờ Admin duyệt)
      const result = await this.db.query(
        'UPDATE restaurants SET claimed_by = $1, is_verified = false WHERE id = $2 AND (claimed_by IS NULL OR claimed_by = $1) RETURNING *',
        [userId, restaurantId]
      );
      if (result.rows.length === 0) return null; // already claimed by someone else or not found
      return result.rows[0];
    } catch (e) {
      console.error('DB error in claimRestaurant', e);
      throw e;
    }
  }

  async approveClaim(restaurantId: string) {
    try {
      const result = await this.db.query(
        'UPDATE restaurants SET is_verified = true WHERE id = $1 AND claimed_by IS NOT NULL RETURNING *',
        [restaurantId]
      );
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (e) {
      console.error('DB error in approveClaim', e);
      throw e;
    }
  }

  async addDish(restaurantId: string, name: string, price?: number, description?: string, imageUrl?: string) {
    try {
      const result = await this.db.query(
        'INSERT INTO dishes (restaurant_id, name, price, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [restaurantId, name, price || 0, description || '', imageUrl || '']
      );
      return result.rows[0];
    } catch (e) {
      console.error('DB error in addDish', e);
      throw e;
    }
  }
}

export const restaurantService = new RestaurantService();
