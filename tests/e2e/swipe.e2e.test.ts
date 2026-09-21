import request from 'supertest';
import app from '../../src/index';

const auth = { Authorization: 'Bearer mock.jwt.token' };

describe('E2E: recommendation and swipe flow', () => {
  it('returns recommendations for an authenticated user', async () => {
    const response = await request(app)
      .get('/api/recommendation?lat=10.762622&lng=106.660172')
      .set(auth);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it.each(['like', 'skip'])('accepts a %s swipe event', async (action) => {
    const response = await request(app)
      .post('/api/recommendation/swipe')
      .set(auth)
      .send({ dishId: '22222222-2222-4222-8222-222222222222', action });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('rejects an unsupported swipe action', async () => {
    const response = await request(app)
      .post('/api/recommendation/swipe')
      .set(auth)
      .send({ dishId: '22222222-2222-4222-8222-222222222222', action: 'remove' });

    expect(response.status).toBe(400);
  });
});
