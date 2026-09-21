import request from 'supertest';
import app from '../src/index';
import { eventCollector } from '../src/recommendation/eventCollector';

jest.mock('../src/recommendation/eventCollector', () => ({
  eventCollector: { trackSwipe: jest.fn().mockResolvedValue(undefined) }
}));

describe('Recommendation API authorization and validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not accept a caller-supplied userId for swipe events', async () => {
    const response = await request(app).post('/api/recommendation/swipe').set('Authorization', 'Bearer mock.jwt.token').send({
      dishId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      action: 'like'
    });

    expect(response.status).toBe(200);
    expect(eventCollector.trackSwipe).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'like'
    );
  });

  it('rejects actions outside the supported event contract', async () => {
    const response = await request(app).post('/api/recommendation/swipe').set('Authorization', 'Bearer mock.jwt.token').send({
      dishId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      action: 'delete'
    });

    expect(response.status).toBe(400);
    expect(eventCollector.trackSwipe).not.toHaveBeenCalled();
  });
});
