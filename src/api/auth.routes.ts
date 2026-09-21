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
