import express from 'express';
import http from 'http';

import { recommendationRouter } from './api/recommendation.routes';
import { userRouter } from './api/user.routes';
import { restaurantRouter } from './api/restaurant.routes';
import { socialRouter } from './api/social.routes';
import { groupRouter } from './api/group.routes';
import { initSocket } from './group/socket';

const app = express();
const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

app.use(express.json());

app.use('/api/recommendations', recommendationRouter);
app.use('/api/users', userRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/social', socialRouter);
app.use('/api/groups', groupRouter);

app.get('/', (req, res) => {
  res.send('FoodRecommend API is running');
});

if (require.main === module) {
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
