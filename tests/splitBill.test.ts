import request from 'supertest';
import app from '../src/index';

const u1 = '11111111-1111-4111-8111-111111111111';
const u2 = '22222222-2222-4222-8222-222222222222';
const u3 = '33333333-3333-4333-8333-333333333333';
const gid = '44444444-4444-4444-8444-444444444444';

describe('Split Bill API Routes', () => {
  it('POST /api/groups/:id/split-equally should split amount equally', async () => {
    const res = await request(app).post(`/api/groups/${gid}/split-equally`).set('Authorization', 'Bearer mock.jwt.token').send({
      totalAmount: 100,
      userIds: [u1, u2, u3]
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(3);
    expect(res.body.data[0].amount).toBe(33.34);
  });

  it('POST /api/groups/:id/split-equally should return 400 if invalid input', async () => {
    const res = await request(app).post(`/api/groups/${gid}/split-equally`).set('Authorization', 'Bearer mock.jwt.token').send({
      totalAmount: 100
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/groups/:id/split-items should split by item correctly', async () => {
    const res = await request(app).post(`/api/groups/${gid}/split-items`).set('Authorization', 'Bearer mock.jwt.token').send({
      items: [
        { name: 'Pizza', price: 300, userId: u1, quantity: 3 },
        { name: 'Coke', price: 50, userId: u1, quantity: 1 }
      ]
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});
