import { Router } from 'express';
import { authService } from '../auth/authService';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/auth.validator';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    const user = await authService.register(email, password, fullName || '');
    res.status(201).json({ success: true, data: user });
  } catch (e: unknown) {
    res.status(400).json({ error: (e as Error).message || 'Registration failed' });
  }
});

authRouter.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await authService.login(email, password);
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(401).json({ error: (e as Error).message || 'Login failed' });
  }
});

authRouter.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await authService.sendOtp(email);
    res.json({ success: true, message: 'OTP sent' });
  } catch (e: unknown) {
    res.status(400).json({ error: (e as Error).message || 'Failed to send OTP' });
  }
});

authRouter.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  try {
    await authService.verifyOtp(email, otp);
    res.json({ success: true, message: 'OTP verified' });
  } catch (e: unknown) {
    res.status(400).json({ error: (e as Error).message || 'OTP verification failed' });
  }
});
