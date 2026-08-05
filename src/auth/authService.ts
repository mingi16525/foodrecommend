import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-123456';
const SALT_ROUNDS = 10;

export class AuthService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
    });
  }

  public async register(email: string, passwordRaw: string, fullName: string) {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await this.db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      throw new Error('Email already exists');
    }

    // Mã hóa mật khẩu
    const passwordHash = await bcrypt.hash(passwordRaw, SALT_ROUNDS);

    // Lưu vào cơ sở dữ liệu
    const result = await this.db.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, passwordHash, fullName]
    );

    return result.rows[0];
  }

  public async login(email: string, passwordRaw: string) {
    // Lấy thông tin user
    const result = await this.db.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    );

    if (!result.rowCount || result.rowCount === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(passwordRaw, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Tạo JWT Token
    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    };
  }

  private generateToken(id: string, email: string) {
    const payload = { userId: id, email };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }
}

export const authService = new AuthService();
