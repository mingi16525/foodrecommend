import request from 'supertest';
import app from '../src/index';

jest.mock('../src/recommendation/engine', () => ({
  recommendationEngine: {
    getRecommendations: jest.fn().mockResolvedValue([
      { id: '1', name: 'Mock Dish', score: 0.99 }
    ]),
    processSwipeEvent: jest.fn().mockResolvedValue({ success: true })
  }
}));

describe('API Routes', () => {
  it('GET /api/recommendations should return 400 if userId is missing', async () => {
    const res = await request(app).get('/api/recommendations');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('userId is required');
  });

  it('GET /api/recommendations should return recommendations for a valid userId', async () => {
    const res = await request(app).get('/api/recommendations?userId=11111111-1111-1111-1111-111111111111');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  }, 30000); // 30s timeout for model load

  it('POST /api/recommendations/swipe should return 400 if data is missing', async () => {
    const res = await request(app).post('/api/recommendations/swipe').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/recommendations/swipe should process swipe successfully', async () => {
    const res = await request(app).post('/api/recommendations/swipe').send({
      userId: '11111111-1111-1111-1111-111111111111',
      dishId: '22222222-2222-2222-2222-222222222222',
      action: 'like'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
