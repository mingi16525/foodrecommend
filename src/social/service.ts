import { Pool } from 'pg';

export interface Post {
  id: string;
  user_id: string;
  post_type: string;
  content?: string;
  video_url?: string;
}

export class SocialService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://food:foodpass123@localhost:5432/foodrecommend'
    });
  }

  async createPost(userId: string, type: string, content?: string, videoUrl?: string) {
    try {
      const result = await this.db.query(
        'INSERT INTO posts (user_id, post_type, content, video_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, type, content, videoUrl]
      );
      return result.rows[0];
    } catch (e) {
      console.warn('DB error in createPost', e);
      return { id: 'mock_post_id', user_id: userId, post_type: type, content, video_url: videoUrl };
    }
  }

  async getFeed() {
    try {
      const result = await this.db.query(
        'SELECT p.*, u.full_name as author_name FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 20'
      );
      return result.rows;
    } catch (e) {
      console.warn('DB error in getFeed', e);
      return [
        { id: 'mock_post_id', user_id: 'user1', post_type: 'review', content: 'Mock post content', author_name: 'Mock Author' }
      ];
    }
  }
}

export const socialService = new SocialService();
