import { Pool } from 'pg';

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
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
    });
  }

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

  async searchRestaurants(query: string) {
    try {
      const result = await this.db.query(
        'SELECT * FROM restaurants WHERE name ILIKE $1 OR tags::text ILIKE $1 LIMIT 10',
        [`%${query}%`]
      );
      return result.rows;
    } catch (e) {
      console.error('DB error in searchRestaurants', e);
      throw e;
    }
  }
}

export const restaurantService = new RestaurantService();
