import request from 'supertest';
import app from '../src/index';

describe('User API Routes', () => {
  it('GET /api/users/:id should return user profile', async () => {
    const res = await request(app).get('/api/users/user123');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    // Fallback data returns id: user123
    expect(res.body.data.id).toBe('user123');
  });

  it('PUT /api/users/:id/preferences should return 400 if preferences missing', async () => {
    const res = await request(app).put('/api/users/user123/preferences').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Preferences are required');
  });

  it('PUT /api/users/:id/preferences should update preferences successfully', async () => {
    const preferences = {
      favorite_flavors: ['spicy', 'sweet'],
      allergies: ['peanuts']
    };
    const res = await request(app).put('/api/users/user123/preferences').send({ preferences });
    expect(res.body.success).toBe(true);
    expect(res.body.data.user_id).toBe('user123');
    expect(res.body.data.favorite_flavors).toEqual(['spicy', 'sweet']);
  });

  it('POST /api/users/:id/verify-reviewer should set is_reviewer to true', async () => {
    const res = await request(app).post('/api/users/user123/verify-reviewer');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.is_reviewer).toBe(true);
  });
});
