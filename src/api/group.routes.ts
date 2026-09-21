import { Router, Response } from 'express';
import { groupService } from '../group/service';
import { AuthRequest } from '../auth/authMiddleware';
import { splitBillService, BillItem } from '../group/splitBill';
import { mediumTierRecommender } from '../group/mediumTier';
import { requireOwnership } from '../middleware/authorization';
import { validate } from '../middleware/validate';
import {
  createGroupSchema,
  addMemberSchema,
  splitEquallySchema,
  splitItemsSchema,
  voteSchema,
  addItemSchema,
  updateOrderStatusSchema
} from '../validators/group.validator';

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

router.post('/', validate(createGroupSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  const creatorId = req.user?.userId;
  
  if (!creatorId) {
    res.status(401).json({ error: 'Unauthorized' });
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

router.get('/:id', requireOwnership('group'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const group = await groupService.getGroupDetails(id);
  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }
  res.json({ data: group });
});

router.post('/:id/members', requireOwnership('group'), validate(addMemberSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { userId } = req.body;
  await groupService.addMember(id, userId);
  res.json({ success: true });
});

router.post('/:id/split-equally', requireOwnership('group'), validate(splitEquallySchema), (req: AuthRequest, res: Response): void => {
  const { totalAmount, userIds } = req.body;

  try {
    const results = splitBillService.splitEqually(totalAmount, userIds);
    res.json({ data: results });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/:id/split-items', requireOwnership('group'), validate(splitItemsSchema), (req: AuthRequest, res: Response): void => {
  const { items } = req.body;
  
  try {
    const mappedItems: BillItem[] = items.map((i: { name: string; price: number; userId: string; quantity?: number }, index: number) => ({
      id: index.toString(),
      name: i.name,
      amount: i.price * (i.quantity || 1),
      assigned_users: [i.userId]
    }));
    const results = splitBillService.splitByItems(mappedItems);
    res.json({ data: results });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/:id/messages', requireOwnership('group'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  try {
    const messages = await groupService.getMessages(id);
    res.json({ data: messages });
  } catch (e: unknown) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/orders', requireOwnership('group'), async (req: AuthRequest, res: Response): Promise<void> => {
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

router.get('/:id/orders/active', requireOwnership('group'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  try {
    const order = await groupService.getActiveOrder(id);
    if (!order) {
      res.json({ data: null });
      return;
    }
    
    // Nếu đang ở trạng thái VOTING, gọi MediumTierRecommender để lấy danh sách gợi ý
    if (order.status === 'VOTING') {
      order.recommendations = await mediumTierRecommender.getGroupRecommendations(id, {
        location: { lat: 21.0319, lng: 105.8465 }, time: new Date()
      });
    }
    
    res.json({ data: order });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post('/:id/orders/:orderId/join', requireOwnership('group'), async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = req.params.orderId as string;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await groupService.joinOrder(orderId, userId);
  res.json({ success: true });
});

router.post('/:id/orders/:orderId/status', requireOwnership('group'), validate(updateOrderStatusSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = req.params.orderId as string;
  const { status, restaurantId } = req.body;
  await groupService.updateOrderStatus(orderId, status, restaurantId);
  res.json({ success: true });
});

router.post('/:id/orders/:orderId/vote', requireOwnership('group'), validate(voteSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = req.params.orderId as string;
  const { restaurantId } = req.body;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await groupService.voteRestaurant(orderId, userId, restaurantId);
  res.json({ success: true });
});

router.post('/:id/orders/:orderId/items', requireOwnership('group'), validate(addItemSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = req.params.orderId as string;
  const { dishId, quantity, price } = req.body;
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  await groupService.addItemToOrder(orderId, userId, dishId, quantity, price);
  res.json({ success: true });
});

export const groupRouter = router;
