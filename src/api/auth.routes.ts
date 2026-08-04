/* eslint-disable */
import { Request, Response } from 'express';
import { AuthService } from '../auth/authService';

const authService = new AuthService();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, full_name } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    const user = await authService.register(email, phone, full_name);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    const result = await authService.login(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
