import request from 'supertest';
import app from '../src/index';

describe('Restaurant API Routes', () => {
  it('GET /api/restaurants/search should return 400 if query missing', async () => {
    const res = await request(app).get('/api/restaurants/search');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Search query "q" is required');
  });

  it('GET /api/restaurants/search should return results for valid query', async () => {
    const res = await request(app).get('/api/restaurants/search?q=pho');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/restaurants/:id should return restaurant profile', async () => {
    const res = await request(app).get('/api/restaurants/r123');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    // Fallback data returns id: r123
    expect(res.body.data.id).toBe('r123');
  });

  it('GET /api/restaurants/:id/review-summary should return AI review summary', async () => {
    const res = await request(app).get('/api/restaurants/r123/review-summary');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.restaurant_id).toBe('r123');
    expect(res.body.data.summary).toBeDefined();
  });
});
