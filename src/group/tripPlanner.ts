import { recommendationEngine } from '../recommendation/engine';
import { groupService } from './service';
import { ContextParams } from '../recommendation/routing';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Data types
export interface MealPlan {
  day: number;
  session: 'breakfast' | 'lunch' | 'dinner';
  reasoning: string;
  recommendedDish: {
    id: string;
    name: string;
    score: number;
    payload: Record<string, unknown>;
  } | null;
}

export interface TripPlan {
  groupId: string;
  tripDays: number;
  plan: MealPlan[];
}

export class DeepTierPlanner {
  
  /**
   * Real LLM call using Google Gemini API
   */
  private async callLLM(prompt: string): Promise<Array<{day: number, session: 'breakfast' | 'lunch' | 'dinner', searchString: string, reasoning: string}>> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[LLM Orchestrator] No GEMINI_API_KEY found, falling back to basic mock response.');
      return [
        { day: 1, session: 'breakfast', searchString: 'healthy breakfast with coffee', reasoning: 'Bữa sáng nhẹ nhàng.' },
        { day: 1, session: 'lunch', searchString: 'local traditional savory dish', reasoning: 'Bữa trưa đặc sản địa phương.' },
        { day: 1, session: 'dinner', searchString: 'fine dining steak or seafood', reasoning: 'Bữa tối sang trọng.' }
      ];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
      Bạn là một chuyên gia ẩm thực và chuyên gia lên lịch trình (Trip Planner). 
      Dựa trên thông tin được cung cấp, hãy tạo ra một lịch trình ăn uống. 
      Lịch trình phải bao gồm 3 bữa (breakfast, lunch, dinner) cho mỗi ngày.
      Bạn BẮT BUỘC trả về dữ liệu thuần định dạng JSON Array chứa các object với cấu trúc chính xác như sau:
      [
        { "day": 1, "session": "breakfast", "searchString": "từ khóa mô tả món ăn bằng tiếng anh", "reasoning": "giải thích tiếng việt" }
      ]
      Tuyệt đối KHÔNG trả về markdown block (như \`\`\`json) hay bất kỳ văn bản nào khác ngoài JSON Array.
    `;

    const fullPrompt = systemPrompt + "\n\n" + prompt;
    
    try {
      console.log('[LLM Orchestrator] Calling Gemini API...');
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text().trim();
      
      // Attempt to clean markdown if LLM still includes it
      let cleanText = text;
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
      if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);

      return JSON.parse(cleanText.trim());
    } catch (e) {
      console.error('[LLM Orchestrator] LLM parsing/API error:', e);
      throw new Error('Failed to generate trip plan using LLM', { cause: e });
    }
  }

  public async generateTripPlan(groupId: string | undefined, contextParams: ContextParams): Promise<TripPlan> {
    console.log(`[Deep Tier] Processing Trip Planner for Group/User: ${groupId || 'Unknown'}`);
    
    // 1. Lấy thông tin Context
    let userIds: string[] = [];
    if (groupId) {
      const groupDetails = await groupService.getGroupDetails(groupId);
      if (groupDetails && groupDetails.members) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userIds = groupDetails.members.map((m: any) => m.id as string);
      }
    }

    // 2. Gộp sở thích và dị ứng
    const allAllergies = new Set<string>();
    const allFlavors = new Set<string>();
    for (const uId of userIds) {
      const prefs = await recommendationEngine.getUserPreferences(uId);
      prefs.allergies.forEach((a: string) => allAllergies.add(a));
      prefs.flavors.forEach((f: string) => allFlavors.add(f));
    }
    const strictAllergies = Array.from(allAllergies);

    // 3. Đóng gói Prompt
    const days = contextParams.multiDay ? 2 : 1;
    const prompt = `
      Hãy lập kế hoạch ăn uống ${days} ngày cho một nhóm.
      Sở thích chung: ${Array.from(allFlavors).join(', ')}.
      Tuyệt đối tránh (dị ứng): ${strictAllergies.join(', ')}.
    `;

    // 4. Gọi LLM Orchestrator
    const llmOutput = await this.callLLM(prompt);

    // 5. Query Qdrant (Grounding) để map từ Text sang Dish thực tế
    const finalPlan: MealPlan[] = [];
    
    // Filter dị ứng nghiêm ngặt
    const mustNotConditions = strictAllergies.map(allergy => ({
      key: 'ingredients',
      match: { value: allergy }
    }));
    const filterCondition = mustNotConditions.length > 0 ? { must_not: mustNotConditions } : undefined;

    for (const meal of llmOutput) {
      const vector = await recommendationEngine.generateEmbedding(meal.searchString);
      // Top 1 cho mỗi bữa
      const candidates = await recommendationEngine.searchDishes(vector, 1, filterCondition);
      
      let recommendedDish = null;
      if (candidates.length > 0) {
        const c = candidates[0];
        const payload = (c.payload as Record<string, unknown>) || {};
        recommendedDish = {
          id: c.id as string,
          name: (payload.name as string) || 'Unknown',
          score: c.score ?? 0,
          payload
        };
      }

      finalPlan.push({
        day: meal.day,
        session: meal.session,
        reasoning: meal.reasoning,
        recommendedDish
      });
    }

    return {
      groupId: groupId || 'guest',
      tripDays: days,
      plan: finalPlan
    };
  }
}

export const deepTierPlanner = new DeepTierPlanner();
