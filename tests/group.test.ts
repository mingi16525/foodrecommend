import request from 'supertest';
import app from '../src/index';

jest.mock('../src/group/service', () => ({
  groupService: {
    createGroup: jest.fn().mockResolvedValue({ id: 'mock_group_id', name: 'Weekend Food Trip', creator_id: '11111111-1111-1111-1111-111111111111' }),
    getGroupDetails: jest.fn().mockResolvedValue({ id: '33333333-3333-3333-3333-333333333333', name: 'Mock Group', members: [] }),
    addMember: jest.fn().mockResolvedValue(true)
  }
}));

describe('Group API Routes', () => {
  it('POST /api/groups should return 400 if data is missing', async () => {
    const res = await request(app).post('/api/groups').set('Authorization', 'Bearer mock.jwt.token').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('POST /api/groups should create a group successfully', async () => {
    const res = await request(app).post('/api/groups').set('Authorization', 'Bearer mock.jwt.token').send({
      name: 'Weekend Food Trip',
      creatorId: '11111111-1111-1111-1111-111111111111'
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe('Weekend Food Trip');
  });

  it('GET /api/groups/:id should return group details', async () => {
    const res = await request(app).get('/api/groups/33333333-3333-3333-3333-333333333333').set('Authorization', 'Bearer mock.jwt.token');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    // mock response logic returns the passed ID
    expect(res.body.data.id).toBe('33333333-3333-3333-3333-333333333333');
  });

  it('POST /api/groups/:id/members should return 400 if userId missing', async () => {
    const res = await request(app).post('/api/groups/33333333-3333-3333-3333-333333333333/members').set('Authorization', 'Bearer mock.jwt.token').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/groups/:id/members should add member successfully', async () => {
    const res = await request(app).post('/api/groups/33333333-3333-3333-3333-333333333333/members').set('Authorization', 'Bearer mock.jwt.token').send({
      userId: '22222222-2222-4222-8222-222222222222'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
