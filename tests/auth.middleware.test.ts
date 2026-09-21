jest.unmock('../src/auth/authMiddleware');

import jwt from 'jsonwebtoken';
import { authenticateToken } from '../src/auth/authMiddleware';

describe('authenticateToken', () => {
  const secret = process.env.JWT_SECRET || 'test-secret-key-for-jest-only-min-32-chars-long!!';

  const invoke = (authorization?: string) => {
    const req = { headers: authorization ? { authorization } : {} } as never;
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as never;
    const next = jest.fn();
    authenticateToken(req, res, next);
    return { req: req as { user?: { userId: string; email: string } }, status, next, json };
  };

  it('rejects a missing token', () => {
    const result = invoke();

    expect(result.next).not.toHaveBeenCalled();
    expect(result.status).toHaveBeenCalledWith(401);
  });

  it('accepts a valid JWT and attaches its claims', () => {
    const token = jwt.sign({ userId: 'user-1', email: 'user@example.com' }, secret);
    const result = invoke(`Bearer ${token}`);

    expect(result.next).toHaveBeenCalledTimes(1);
    expect(result.req.user).toMatchObject({ userId: 'user-1', email: 'user@example.com' });
  });

  it('rejects malformed authorization values', () => {
    const result = invoke('Basic abc');

    expect(result.next).not.toHaveBeenCalled();
    expect(result.status).toHaveBeenCalledWith(403);
  });
});
