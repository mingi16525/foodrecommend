import { db } from '../db';

export interface Post {
  id: string;
  user_id: string;
  post_type: string;
  content?: string;
  video_url?: string;
  dish_id?: string;
}

export class SocialService {
  private db = db;

  async createPost(userId: string, type: string, content?: string, videoUrl?: string, dishId?: string) {
    try {
      const result = await this.db.query(
        'INSERT INTO posts (user_id, post_type, content, video_url, dish_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, type, content, videoUrl, dishId]
      );
      return result.rows[0];
    } catch (e) {
      console.error('DB error in createPost', e);
      throw e;
    }
  }

  async getFeed(userLat?: number, userLng?: number) {
    try {
      // Create Haversine distance formula if userLat and userLng are provided
      let selectDistance = "'0km' as distance";
      if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng)) {
        selectDistance = `
          ROUND(
            (6371 * acos(
              cos(radians(${userLat})) * cos(radians((r.location->>'lat')::float)) *
              cos(radians((r.location->>'lng')::float) - radians(${userLng})) +
              sin(radians(${userLat})) * sin(radians((r.location->>'lat')::float))
            ))::numeric, 1
          ) || 'km' as distance
        `;
      }

      const query = `
        SELECT 
          p.*, 
          u.full_name as author_name, 
          'https://i.pravatar.cc/150?u=' || u.id as author_avatar,
          u.is_reviewer as is_verified,
          d.name as dish_name, 
          d.price, 
          r.name as restaurant_name,
          ${selectDistance},
          FLOOR(RANDOM() * 500) + 10 as likes,
          FLOOR(RANDOM() * 50) + 1 as comments
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        LEFT JOIN dishes d ON p.dish_id = d.id
        LEFT JOIN restaurants r ON d.restaurant_id = r.id
        ORDER BY p.created_at DESC 
        LIMIT 20
      `;
      const result = await this.db.query(query);
      return result.rows;
    } catch (e) {
      console.error('DB error in getFeed', e);
      throw e;
    }
  }
}

export const socialService = new SocialService();
