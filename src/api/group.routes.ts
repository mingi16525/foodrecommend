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
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal server error' });
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
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal server error' });
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

export const groupRouter = router;
