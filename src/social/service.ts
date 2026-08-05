import { db } from '../db';

export interface Post {
  id: string;
  user_id: string;
  post_type: string;
  content?: string;
  video_url?: string;
}

export class SocialService {
  private db = db;

  async createPost(userId: string, type: string, content?: string, videoUrl?: string) {
    try {
      const result = await this.db.query(
        'INSERT INTO posts (user_id, post_type, content, video_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, type, content, videoUrl]
      );
      return result.rows[0];
    } catch (e) {
      console.error('DB error in createPost', e);
      throw e;
    }
  }

  async getFeed() {
    try {
      const result = await this.db.query(
        'SELECT p.*, u.full_name as author_name FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 20'
      );
      return result.rows;
    } catch (e) {
      console.error('DB error in getFeed', e);
      throw e;
    }
  }
}

export const socialService = new SocialService();
