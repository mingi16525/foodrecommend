import { Router } from 'express';

export const groupRouter = Router();

groupRouter.get('/', (req, res) => {
  res.json({ message: 'Group API placeholder' });
});
