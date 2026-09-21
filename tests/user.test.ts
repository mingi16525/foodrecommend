import request from 'supertest';
import app from '../src/index';

jest.mock('../src/user/service', () => ({
  userService: {
    getUserProfile: jest.fn().mockResolvedValue({ id: '11111111-1111-4111-8111-111111111111', email: 'mock@example.com', full_name: 'Mock User', preferences: null }),
    updatePreferences: jest.fn().mockResolvedValue({ user_id: '11111111-1111-4111-8111-111111111111', favorite_flavors: ['spicy', 'sweet'] })
  }
}));

describe('User API Routes', () => {
  it('GET /api/users/:id should return user profile', async () => {
    const res = await request(app).get('/api/users/11111111-1111-4111-8111-111111111111').set('Authorization', 'Bearer mock.jwt.token');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('PUT /api/users/:id/preferences should return 400 if preferences missing', async () => {
    const res = await request(app).put('/api/users/11111111-1111-4111-8111-111111111111/preferences').set('Authorization', 'Bearer mock.jwt.token').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('PUT /api/users/:id/preferences should update preferences successfully', async () => {
    const preferences = {
      favorite_flavors: ['spicy', 'sweet'],
      allergies: ['peanuts']
    };
    const res = await request(app).put('/api/users/11111111-1111-4111-8111-111111111111/preferences').set('Authorization', 'Bearer mock.jwt.token').send({ preferences });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user_id).toBe('11111111-1111-4111-8111-111111111111');
    expect(res.body.data.favorite_flavors).toEqual(['spicy', 'sweet']);
  });
});
