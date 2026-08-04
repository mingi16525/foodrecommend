import { Request, Response } from 'express';
import { register, login } from '../src/api/auth.routes';

describe('Auth API mock tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
      })
    };
  });

  test('should register a user successfully', async () => {
    mockRequest = {
      body: {
        email: 'test@example.com',
        phone: '123456789',
        full_name: 'Test User'
      }
    };

    await register(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(responseObject).toHaveProperty('id');
    expect(responseObject.email).toBe('test@example.com');
  });

  test('should login and return token', async () => {
    mockRequest = {
      body: {
        email: 'test@example.com'
      }
    };

    await login(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(responseObject).toHaveProperty('token');
    expect(responseObject.user.email).toBe('test@example.com');
  });

  test('should return 401 for unknown user login', async () => {
    mockRequest = {
      body: {
        email: 'unknown@example.com'
      }
    };

    await login(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(responseObject).toHaveProperty('error');
  });
});
