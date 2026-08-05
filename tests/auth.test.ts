import request from 'supertest';
import express from 'express';
import { authRouter } from '../src/api/auth.routes';
import { authService } from '../src/auth/authService';

jest.mock('../src/auth/authService');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth API mock tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register a user successfully', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      id: 'mock-id-123',
      email: 'test@example.com'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe('test@example.com');
  });

  test('should return 400 when missing email/password on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  test('should login and return token', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'mock.jwt.token',
      user: { id: 'mock-id-123', email: 'test@example.com' }
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  test('should return 401 for unknown user login', async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid email or password'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unknown@example.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid email or password');
  });
});
