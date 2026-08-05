import request from 'supertest';
import app from '../src/index';

jest.mock('../src/recommendation/engine', () => ({
  recommendationEngine: {
    getRecommendations: jest.fn().mockResolvedValue([
      { id: '1', name: 'Mock Dish', score: 0.99 }
    ]),
    processSwipeEvent: jest.fn().mockResolvedValue({ success: true }),
    getUserPreferences: jest.fn().mockResolvedValue({ flavors: [], allergies: [] }),
    generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2]),
    searchDishes: jest.fn().mockResolvedValue([])
  }
}));

describe('API Routes', () => {


  it('GET /api/recommendation should return recommendations for a valid userId', async () => {
    const res = await request(app).get('/api/recommendation?userId=11111111-1111-1111-1111-111111111111');
    if (res.status !== 200) console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  }, 30000); // 30s timeout for model load

  it('POST /api/recommendation/swipe should return 400 if data is missing', async () => {
    const res = await request(app).post('/api/recommendation/swipe').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/recommendation/swipe should process swipe successfully', async () => {
    const res = await request(app).post('/api/recommendation/swipe').send({
      userId: '11111111-1111-1111-1111-111111111111',
      dishId: '22222222-2222-2222-2222-222222222222',
      action: 'like'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
