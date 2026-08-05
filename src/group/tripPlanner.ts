import { recommendationEngine } from '../recommendation/engine';
import { groupService } from './service';
import { ContextParams } from '../recommendation/routing';

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
   * Mock LLM call. Nhận prompt và sinh ra các yêu cầu tìm kiếm món ăn.
   */
  private async callMockLLM(prompt: string): Promise<Array<{day: number, session: 'breakfast' | 'lunch' | 'dinner', searchString: string, reasoning: string}>> {
    console.log(`[LLM Orchestrator] Generating plan for prompt length: ${prompt.length}`);
    
    // Giả lập LLM cần 500ms để "suy nghĩ"
    await new Promise(resolve => setTimeout(resolve, 500));

    // Giả lập output của LLM dựa trên logic
    // Vì đây là mock, ta trả về 1 ngày 3 bữa cố định.
    return [
      {
        day: 1,
        session: 'breakfast',
        searchString: 'healthy breakfast with coffee',
        reasoning: 'Bắt đầu ngày mới với một bữa sáng nhẹ nhàng và cà phê để tỉnh táo.'
      },
      {
        day: 1,
        session: 'lunch',
        searchString: 'local traditional savory dish',
        reasoning: 'Thưởng thức hương vị địa phương đặc sắc cho bữa trưa đầy năng lượng.'
      },
      {
        day: 1,
        session: 'dinner',
        searchString: 'fine dining steak or seafood',
        reasoning: 'Bữa tối sang trọng để thư giãn và tận hưởng buổi tối.'
      }
    ];
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
    const llmOutput = await this.callMockLLM(prompt);

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
