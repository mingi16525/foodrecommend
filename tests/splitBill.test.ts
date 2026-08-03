import request from 'supertest';
import app from '../src/index';

describe('Split Bill API Routes', () => {
  it('POST /api/groups/:id/split-equally should split amount equally', async () => {
    const res = await request(app).post('/api/groups/g1/split-equally').send({
      totalAmount: 100,
      userIds: ['user1', 'user2', 'user3']
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(3);
    expect(res.body.data[0].amount).toBe(33.33); // 100/3 = 33.33
  });

  it('POST /api/groups/:id/split-equally should return 400 if invalid input', async () => {
    const res = await request(app).post('/api/groups/g1/split-equally').send({
      totalAmount: 100
      // missing userIds
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/groups/:id/split-items should split by item correctly', async () => {
    const res = await request(app).post('/api/groups/g1/split-items').send({
      items: [
        { id: 'item1', name: 'Pizza', amount: 300, assigned_users: ['user1', 'user2', 'user3'] },
        { id: 'item2', name: 'Coke', amount: 50, assigned_users: ['user1'] },
        { id: 'item3', name: 'Salad', amount: 150, assigned_users: ['user2', 'user3'] }
      ]
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    
    // User1: 300/3 + 50/1 = 150
    // User2: 300/3 + 150/2 = 175
    // User3: 300/3 + 150/2 = 175
    const data = res.body.data;
    const user1 = data.find((r: { userId: string }) => r.userId === 'user1');
    const user2 = data.find((r: { userId: string }) => r.userId === 'user2');
    const user3 = data.find((r: { userId: string }) => r.userId === 'user3');

    expect(user1.amount).toBe(150);
    expect(user2.amount).toBe(175);
    expect(user3.amount).toBe(175);
  });
});
