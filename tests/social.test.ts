import request from 'supertest';
import app from '../src/index';

const auth = { Authorization: 'Bearer mock.jwt.token' };

describe('Social API Routes', () => {
  it('POST /api/social/posts should return 400 if data is missing', async () => {
    const res = await request(app).post('/api/social/posts').set(auth).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('POST /api/social/posts should create a post successfully', async () => {
    const res = await request(app).post('/api/social/posts').set(auth).send({
      userId: '11111111-1111-4111-8111-111111111111',
      type: 'review',
      content: 'Great food!',
      videoUrl: 'http://example.com/video.mp4'
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.content).toBe('Great food!');
  });

  it('GET /api/social/feed should return feed', async () => {
    const res = await request(app).get('/api/social/feed').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
