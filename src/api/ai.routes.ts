import express from 'express';
import { ChatbotService } from '../ai/chatbot';

const router = express.Router();
const chatbotService = new ChatbotService();

router.post('/chat', async (req, res) => {
  try {
    const { userId, message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatbotService.processChat(userId, message, context);
    res.status(200).json(response);
  } catch (error: unknown) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
