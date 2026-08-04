/* eslint-disable */
export class AuthService {
  // Temporary in-memory store for MVP since schema lacks a password field
  // and we don't have a DB connection configured here in this basic mock.
  private users: any[] = [];

  async register(email: string, phone?: string, fullName?: string) {
    const existing = this.users.find(u => u.email === email);
    if (existing) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: `mock-uuid-${Date.now()}`,
      email,
      phone,
      full_name: fullName,
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async login(email: string) {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Mocking a JWT token using base64 for MVP
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');
    const signature = 'mock-signature';
    
    const token = `${header}.${payload}.${signature}`;

    return {
      user,
      token
    };
  }
}
