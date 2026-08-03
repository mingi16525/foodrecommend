import { Router, Request, Response } from 'express';
import { groupService } from '../group/service';
import { splitBillService, BillItem } from '../group/splitBill';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, creatorId } = req.body;
  if (!name || !creatorId) {
    res.status(400).json({ error: 'Name and creatorId are required' });
    return;
  }
  const newGroup = await groupService.createGroup(name, creatorId);
  res.json({ data: newGroup });
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const groups = await groupService.getAllGroups();
  res.json({ data: groups });
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
