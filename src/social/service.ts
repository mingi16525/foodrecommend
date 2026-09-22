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

  async getFeed(userLat?: number, userLng?: number, page: number = 1, limit: number = 20) {
    try {
      let selectDistance = "'0km' as distance";
      if (
        userLat !== undefined && userLng !== undefined &&
        Number.isFinite(userLat) && Number.isFinite(userLng) &&
        userLat >= -90 && userLat <= 90 &&
        userLng >= -180 && userLng <= 180
      ) {
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

      const offset = (page - 1) * limit;

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
          p.likes_count as likes,
          p.comments_count as comments
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        LEFT JOIN dishes d ON p.dish_id = d.id
        LEFT JOIN restaurants r ON d.restaurant_id = r.id
        ORDER BY p.created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      const result = await this.db.query(query, [limit, offset]);
      return result.rows;
    } catch (e) {
      console.error('DB error in getFeed', e);
      throw e;
    }
  }

  async likePost(postId: string, userId: string) {
    const res = await this.db.query(
      'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1',
      [postId, userId]
    );
    if (res.rowCount && res.rowCount > 0) {
      await this.db.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
    }
  }

  async unlikePost(postId: string, userId: string) {
    const res = await this.db.query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2 RETURNING 1',
      [postId, userId]
    );
    if (res.rowCount && res.rowCount > 0) {
      await this.db.query('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1', [postId]);
    }
  }

  async commentPost(postId: string, userId: string, commentText: string) {
    const result = await this.db.query(
      'INSERT INTO post_comments (post_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
      [postId, userId, commentText]
    );
    await this.db.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);
    return result.rows[0];
  }

  async followUser(followerId: string, followingId: string) {
    await this.db.query(
      'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerId, followingId]
    );
  }
}

export const socialService = new SocialService();
