import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const _JWT_SECRET = process.env.JWT_SECRET;
if (!_JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = _JWT_SECRET;
const SALT_ROUNDS = 10;
const otpStore = new Map<string, string>();

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

    // Lưu vào cơ sở dữ liệu (mặc định is_verified = false)
    const result = await this.db.query(
      'INSERT INTO users (email, password_hash, full_name, is_verified) VALUES ($1, $2, $3, false) RETURNING id, email, full_name',
      [email, passwordHash, fullName]
    );

    // Tự động gửi OTP
    await this.sendOtp(email);

    return result.rows[0];
  }

  public async login(email: string, passwordRaw: string) {
    // Lấy thông tin user
    const result = await this.db.query(
      'SELECT id, email, password_hash, full_name, is_verified FROM users WHERE email = $1',
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

    if (user.is_verified === false) {
      throw new Error('Account not verified. Please verify OTP.');
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

  public async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp);
    console.log(`[MOCK OTP] Sent OTP ${otp} to email ${email}`);
    return true;
  }

  public async verifyOtp(email: string, otp: string) {
    const storedOtp = otpStore.get(email);
    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Invalid OTP');
    }
    otpStore.delete(email);

    // Cập nhật trạng thái xác thực trong CSDL
    await this.db.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);
    return true;
  }
}

export const authService = new AuthService();
