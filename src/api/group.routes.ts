import { Router, Request, Response } from 'express';
import { groupService } from '../group/service';
import { AuthRequest } from '../auth/authMiddleware';
import { splitBillService, BillItem } from '../group/splitBill';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const groups = await groupService.getUserGroups(userId);
    res.json({ data: groups });
  } catch (e: unknown) {
    const error = e as Error;
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  const creatorId = req.user?.userId;
  
  if (!name || !creatorId) {
    res.status(400).json({ error: 'Name and valid session are required' });
    return;
  }
  try {
    const newGroup = await groupService.createGroup(name, creatorId);
    res.json({ data: newGroup });
  } catch (e: unknown) {
    const error = e as Error;
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const group = await groupService.getGroupDetails(id);
  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }
  res.json({ data: group });
});

router.post('/:id/members', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }
  await groupService.addMember(id, userId);
  res.json({ success: true });
});

router.post('/:id/split-equally', (req: Request, res: Response): void => {
  const { totalAmount, userIds } = req.body;
  if (!totalAmount || !userIds || !Array.isArray(userIds)) {
    res.status(400).json({ error: 'totalAmount and userIds (array) are required' });
    return;
  }
  
  const results = splitBillService.splitEqually(totalAmount, userIds);
  res.json({ data: results });
});

router.post('/:id/split-items', (req: Request, res: Response): void => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    res.status(400).json({ error: 'items (array) is required' });
    return;
  }
  
  const results = splitBillService.splitByItems(items as BillItem[]);
  res.json({ data: results });
});

router.get('/:id/messages', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  try {
    const messages = await groupService.getMessages(id);
    res.json({ data: messages });
  } catch (e: unknown) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/orders', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const creatorId = req.user?.userId;
  if (!creatorId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const order = await groupService.createOrder(id, creatorId);
    res.json({ data: order });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get('/:id/orders/active', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  try {
    const order = await groupService.getActiveOrder(id);
    if (!order) {
      res.json({ data: null });
      return;
    }
    
    // Nếu đang ở trạng thái VOTING, gọi MediumTierRecommender để lấy danh sách gợi ý
    if (order.status === 'VOTING') {
      const { mediumTierRecommender } = require('../group/mediumTier');
      order.recommendations = await mediumTierRecommender.getGroupRecommendations(id, {
        location: { lat: 21.0319, lng: 105.8465 }, time: new Date()
      });
    }
    
    res.json({ data: order });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post('/:id/orders/:orderId/join', async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = req.params.orderId as string;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await groupService.joinOrder(orderId, userId);
  res.json({ success: true });
});

router.post('/:id/orders/:orderId/status', async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.orderId as string;
  const { status, restaurantId } = req.body;
  await groupService.updateOrderStatus(orderId, status, restaurantId);
  res.json({ success: true });
});

router.post('/:id/orders/:orderId/vote', async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = req.params.orderId as string;
  const { restaurantId } = req.body;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await groupService.voteRestaurant(orderId, userId, restaurantId);
  res.json({ success: true });
});

router.post('/:id/orders/:orderId/items', async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = req.params.orderId as string;
  const { dishId, quantity, price } = req.body;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await groupService.addItemToOrder(orderId, userId, dishId, quantity, price);
  res.json({ success: true });
});

export const groupRouter = router;
