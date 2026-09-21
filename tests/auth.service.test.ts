import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from '../src/auth/authService';

type AuthDb = { query: jest.Mock };

describe('AuthService', () => {
  let database: AuthDb;

  beforeEach(() => {
    database = (authService as unknown as { db: AuthDb }).db;
    database.query.mockReset();
  });

  it('hashes passwords and returns the created public user', async () => {
    database.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ id: 'u1', email: 'user@example.com', full_name: 'User' }], rowCount: 1 });

    const result = await authService.register('user@example.com', 'password123', 'User');

    expect(result).toEqual({ id: 'u1', email: 'user@example.com', full_name: 'User' });
    const [, params] = database.query.mock.calls[1];
    await expect(bcrypt.compare('password123', params[1])).resolves.toBe(true);
  });

  it('rejects duplicate email before hashing/inserting', async () => {
    database.query.mockResolvedValueOnce({ rows: [{ id: 'existing' }], rowCount: 1 });

    await expect(authService.register('user@example.com', 'password123', 'User'))
      .rejects.toThrow('Email already exists');
    expect(database.query).toHaveBeenCalledTimes(1);
  });

  it('returns a JWT with the authenticated user claims', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    database.query.mockResolvedValueOnce({
      rows: [{ id: 'u1', email: 'user@example.com', password_hash: passwordHash, full_name: 'User' }],
      rowCount: 1
    });

    const result = await authService.login('user@example.com', 'password123');
    const claims = jwt.verify(result.token, process.env.JWT_SECRET!) as { userId: string; email: string };

    expect(claims).toMatchObject({ userId: 'u1', email: 'user@example.com' });
    expect(result.user).toEqual({ id: 'u1', email: 'user@example.com', fullName: 'User' });
  });

  it('uses the same public error for unknown user and wrong password', async () => {
    database.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    await expect(authService.login('missing@example.com', 'wrong')).rejects.toThrow('Invalid email or password');

    const passwordHash = await bcrypt.hash('correct', 4);
    database.query.mockResolvedValueOnce({ rows: [{ id: 'u1', email: 'user@example.com', password_hash: passwordHash }], rowCount: 1 });
    await expect(authService.login('user@example.com', 'wrong')).rejects.toThrow('Invalid email or password');
  });
});
