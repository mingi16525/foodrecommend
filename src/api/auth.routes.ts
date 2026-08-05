import { Router } from 'express';
import { authService } from '../auth/authService';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await authService.register(email, password, fullName || '');
    res.status(201).json({ success: true, data: user });
  } catch (e: unknown) {
    res.status(400).json({ error: (e as Error).message || 'Registration failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const data = await authService.login(email, password);
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(401).json({ error: (e as Error).message || 'Login failed' });
  }
});
