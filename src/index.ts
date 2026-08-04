import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

import { recommendationRouter } from './api/recommendation.routes';
import { userRouter } from './api/user.routes';
import { restaurantRouter } from './api/restaurant.routes';
import { socialRouter } from './api/social.routes';
import { groupRouter } from './api/group.routes';
import notificationRoutes from './api/notification.routes';
import { initSocket } from './group/socket';

const app = express();
const port = process.env.PORT || 3000;
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

// Initialize Socket.io
initSocket(httpServer);

app.use('/api/users', userRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/social', socialRouter);
app.use('/api/groups', groupRouter);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('FoodRecommend API is running');
});

if (require.main === module) {
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
