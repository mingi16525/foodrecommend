import { Router } from 'express';

export const socialRouter = Router();

socialRouter.get('/', (req, res) => {
  res.json({ message: 'Social API placeholder' });
});
