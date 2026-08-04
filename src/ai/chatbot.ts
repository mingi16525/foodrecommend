import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatContext {
  location?: { lat: number; lng: number };
  preferences?: string[];
}

export interface ChatResponse {
  reply: string;
  intent: string;
  actionPayload?: Record<string, unknown>;
}

export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');
  }

  /**
   * Process conversational AI
   */
  async processChat(userId: string | undefined, message: string, context?: ChatContext): Promise<ChatResponse> {
    const isMock = !process.env.GEMINI_API_KEY;

    if (isMock) {
      return this.mockProcessChat(message, context);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an AI Food Assistant. The user's preferences are: ${context?.preferences?.join(', ') || 'Unknown'}.
The user says: "${message}".
Determine the intent of the user (must be one of: "search_restaurant", "add_to_cart", "split_bill", "general_chat").
If the intent is "search_restaurant", provide an "actionPayload" with a "category".
If the intent is "add_to_cart", provide an "actionPayload" with "itemId" and "quantity".
Generate a helpful and natural "reply" in Vietnamese.
Return exactly in this JSON format:
{
  "reply": "string",
  "intent": "string",
  "actionPayload": {}
}
Do not return any markdown wrappers like \`\`\`json, just the raw JSON object.`;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      return {
        reply: parsed.reply || 'Xin lỗi, tôi không hiểu.',
        intent: parsed.intent || 'general_chat',
        actionPayload: parsed.actionPayload
      };
    } catch (e) {
      console.error('LLM Chatbot failed, using fallback.', e);
      return this.mockProcessChat(message, context);
    }
  }

  private mockProcessChat(message: string, context?: ChatContext): ChatResponse {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('tìm quán') || lowerMessage.includes('ăn gì')) {
      return {
        reply: `Dựa trên sở thích của bạn ${context?.preferences ? '(' + context.preferences.join(', ') + ')' : ''}, tôi tìm thấy một vài quán gần đây. Bạn có muốn xem danh sách không?`,
        intent: 'search_restaurant',
        actionPayload: {
          category: context?.preferences?.[0] || 'popular',
        },
      };
    }

    if (lowerMessage.includes('đặt món') || lowerMessage.includes('giỏ hàng')) {
      return {
        reply: 'Tôi đã thêm món ăn này vào giỏ hàng của bạn. Bạn muốn tiếp tục chọn món hay thanh toán?',
        intent: 'add_to_cart',
        actionPayload: {
          itemId: 'item_123',
          quantity: 1,
        },
      };
    }

    if (lowerMessage.includes('chia tiền') || lowerMessage.includes('split bill')) {
      return {
        reply: 'Được rồi, bạn muốn chia đều hóa đơn hay chia theo món?',
        intent: 'split_bill',
      };
    }

    return {
      reply: 'Chào bạn, tôi là AI Food Assistant! Tôi có thể giúp bạn tìm quán ăn, đặt món, hoặc chia tiền. Bạn cần tôi giúp gì nào?',
      intent: 'general_chat',
    };
  }
}
