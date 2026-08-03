import request from 'supertest';
import app from '../src/index';

describe('Group API Routes', () => {
  it('POST /api/groups should return 400 if data is missing', async () => {
    const res = await request(app).post('/api/groups').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name and creatorId are required');
  });

  it('POST /api/groups should create a group successfully', async () => {
    const res = await request(app).post('/api/groups').send({
      name: 'Weekend Food Trip',
      creatorId: 'user1'
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe('Weekend Food Trip');
  });

  it('GET /api/groups/:id should return group details', async () => {
    const res = await request(app).get('/api/groups/g123');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe('g123');
  });

  it('POST /api/groups/:id/members should return 400 if userId missing', async () => {
    const res = await request(app).post('/api/groups/g123/members').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/groups/:id/members should add member successfully', async () => {
    const res = await request(app).post('/api/groups/g123/members').send({
      userId: 'user2'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
