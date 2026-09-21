// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

jest.mock('./../src/auth/authMiddleware', () => ({
  authenticateToken: (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Access token missing or invalid' });
    if (authorization !== 'Bearer mock.jwt.token') return res.status(403).json({ error: 'Token expired or invalid' });
    req.user = { userId: '11111111-1111-4111-8111-111111111111', email: 'test@example.com' };
    next();
  }
}));

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(true),
      send: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn().mockResolvedValue(true)
    }),
    consumer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(true),
      subscribe: jest.fn().mockResolvedValue(true),
      run: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn().mockResolvedValue(true)
    })
  }))
}));

jest.mock('ioredis', () => jest.fn().mockImplementation(() => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn(),
  quit: jest.fn(),
  on: jest.fn()
})));

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn().mockResolvedValue({ rows: [{ id: '123', name: 'Mock Dish', description: 'Mock Description', image_url: '', price: 10, currency: 'USD', restaurant_id: 'rest1', content: 'Great food!', tags: [], match_score: 95 }] }),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn()
  };
  return { Pool: jest.fn(() => mPool) };
});

jest.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue([{ id: '1', score: 0.9, payload: { name: 'Pho', lat: 10, lng: 10, suitable_for: ['breakfast'] } }])
  }))
}));

jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn().mockResolvedValue(jest.fn().mockResolvedValue({ data: new Float32Array(384) }))
}));
