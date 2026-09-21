import request from 'supertest';
import app from '../../src/index';

describe('E2E: authentication boundary', () => {
  it('rejects protected routes without a bearer token', async () => {
    const response = await request(app).get('/api/users/me');

    expect(response.status).toBe(401);
  });

  it('allows a protected route with the test token and returns the profile contract', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer mock.jwt.token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).not.toHaveProperty('password_hash');
  });

  it('rejects malformed bearer tokens', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid.token');

    expect(response.status).toBe(403);
  });
});
