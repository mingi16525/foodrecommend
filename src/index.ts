import express from 'express';

import { recommendationRouter } from './api/recommendation.routes';
import { userRouter } from './api/user.routes';
import { restaurantRouter } from './api/restaurant.routes';
import { socialRouter } from './api/social.routes';
import { groupRouter } from './api/group.routes';
import { authRouter } from './api/auth.routes';
import { authenticateToken } from './auth/authMiddleware';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/recommendation', authenticateToken as express.RequestHandler, recommendationRouter);
app.use('/api/users', authenticateToken as express.RequestHandler, userRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/social', socialRouter);
app.use('/api/groups', authenticateToken as express.RequestHandler, groupRouter);

app.get('/', (req, res) => {
  res.send('FoodRecommend API is running');
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
