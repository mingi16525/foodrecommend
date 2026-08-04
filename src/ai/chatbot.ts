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
  /**
   * Simulate conversational AI processing
   * In a real system, this would call OpenAI/Gemini APIs with system prompts.
   */
  async processChat(userId: string | undefined, message: string, context?: ChatContext): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase();

    // Mock Intent matching
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

    // Default conversational response
    return {
      reply: 'Chào bạn, tôi là AI Food Assistant! Tôi có thể giúp bạn tìm quán ăn, đặt món, hoặc chia tiền. Bạn cần tôi giúp gì nào?',
      intent: 'general_chat',
    };
  }
}
