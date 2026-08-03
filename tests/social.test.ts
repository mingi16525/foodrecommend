import request from 'supertest';
import app from '../src/index';

describe('Social API Routes', () => {
  it('POST /api/social/posts should return 400 if data is missing', async () => {
    const res = await request(app).post('/api/social/posts').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('userId and type are required');
  });

  it('POST /api/social/posts should create a post successfully', async () => {
    const res = await request(app).post('/api/social/posts').send({
      userId: 'user1',
      type: 'review',
      content: 'Great food!',
      videoUrl: 'http://example.com/video.mp4'
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.content).toBe('Great food!');
  });

  it('GET /api/social/feed should return feed', async () => {
    const res = await request(app).get('/api/social/feed');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
