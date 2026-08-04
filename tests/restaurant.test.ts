import request from 'supertest';
import app from '../src/index';

jest.mock('../src/restaurant/service', () => ({
  restaurantService: {
    searchRestaurants: jest.fn().mockResolvedValue([{ id: 'r1', name: 'Mock Search Result' }]),
    getRestaurantById: jest.fn().mockResolvedValue({ id: 'r123', name: 'Mock Restaurant', dishes: [{ id: 'd1', name: 'Mock Dish' }] })
  }
}));

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
});
