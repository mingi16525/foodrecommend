import { Router, Request, Response } from 'express';
import { groupService } from '../group/service';

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

export const groupRouter = router;
