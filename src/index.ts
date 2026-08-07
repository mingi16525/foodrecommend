import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import { recommendationRouter } from './api/recommendation.routes';
import { userRouter } from './api/user.routes';
import { restaurantRouter } from './api/restaurant.routes';
import { socialRouter } from './api/social.routes';
import { groupRouter } from './api/group.routes';
import { authRouter } from './api/auth.routes';
import { authenticateToken } from './auth/authMiddleware';
import { setupSocket } from './socket';

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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

setupSocket(io);

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
