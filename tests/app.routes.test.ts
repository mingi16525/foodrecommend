import request from 'supertest';
import app from '../src/index';

describe('Application boundaries', () => {
  it('returns the health response at the root route', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('FoodRecommend API is running');
  });

  it('returns 404 for an unknown route', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
  });

  it('enforces auth at the recommendation boundary', async () => {
    const response = await request(app).get('/api/recommendation');

    expect(response.status).toBe(401);
  });
});
