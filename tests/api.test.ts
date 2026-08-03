import request from 'supertest';
import app from '../src/index';

describe('API Routes', () => {
  it('GET /api/recommendations should return 400 if userId is missing', async () => {
    const res = await request(app).get('/api/recommendations');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('userId is required');
  });

  it('GET /api/recommendations should return recommendations for a valid userId', async () => {
    const res = await request(app).get('/api/recommendations?userId=123');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/recommendations/swipe should return 400 if data is missing', async () => {
    const res = await request(app).post('/api/recommendations/swipe').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/recommendations/swipe should process swipe successfully', async () => {
    const res = await request(app).post('/api/recommendations/swipe').send({
      userId: 'user1',
      dishId: 'dish1',
      action: 'like'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
