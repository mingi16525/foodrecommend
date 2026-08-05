import { recommendationEngine } from '../recommendation/engine';
import { fastTierRecommender, FastTierCandidate } from '../recommendation/fastTier';
import { groupService } from './service';
import { ContextParams } from '../recommendation/routing';

export interface GroupRecommendationResult {
  id: string;
  name: string;
  bordaScore: number;
  payload: Record<string, unknown>;
}

export class MediumTierRecommender {
  
  /**
   * Tính toán điểm Borda Count cho một tập hợp các kết quả cá nhân
   */
  private applyBordaCount(memberResults: FastTierCandidate[][]): GroupRecommendationResult[] {
    const candidateMap = new Map<string, GroupRecommendationResult>();

    memberResults.forEach(memberList => {
      // Giả sử lấy top 10 mỗi user, món top 1 được 10 điểm, món top 10 được 1 điểm
      const maxScore = memberList.length;
      
      memberList.forEach((candidate, index) => {
        const bordaPoints = maxScore - index;
        
        if (candidateMap.has(candidate.id)) {
          const existing = candidateMap.get(candidate.id)!;
          existing.bordaScore += bordaPoints;
        } else {
          candidateMap.set(candidate.id, {
            id: candidate.id,
            name: candidate.name,
            bordaScore: bordaPoints,
            payload: candidate.payload
          });
        }
      });
    });

    const results = Array.from(candidateMap.values());
    // Sort theo điểm Borda giảm dần
    results.sort((a, b) => b.bordaScore - a.bordaScore);

    return results.slice(0, 10);
  }

  /**
   * Pipeline gợi ý Nhóm
   */
  public async getGroupRecommendations(groupId: string | undefined, contextParams: ContextParams): Promise<GroupRecommendationResult[]> {
    console.log(`[Medium Tier] Processing request for Group: ${groupId || 'Unknown'}`);
    
    let userIds: string[] = [];

    // Nếu có groupId, lấy danh sách thành viên
    if (groupId) {
      const groupDetails = await groupService.getGroupDetails(groupId);
      if (groupDetails && groupDetails.members) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userIds = groupDetails.members.map((m: any) => m.id as string);
      }
    }

    // Nếu không lấy được group hoặc group ít người, fallback
    if (userIds.length === 0) {
      console.warn('Group has no members or not found. Falling back to Guest Fast Tier.');
      const fallbackResults = await fastTierRecommender.getRecommendations(undefined, contextParams);
      return fallbackResults.map(r => ({
        id: r.id,
        name: r.name,
        bordaScore: r.finalScore * 10,
        payload: r.payload
      }));
    }

    // 1. Gộp tập Hợp dị ứng (Strict Union Filter)
    const allAllergies = new Set<string>();
    for (const uId of userIds) {
      const prefs = await recommendationEngine.getUserPreferences(uId);
      prefs.allergies.forEach((a: string) => allAllergies.add(a));
    }
    const strictAllergies = Array.from(allAllergies);

    // 2. Chạy lấy kết quả từng thành viên qua Fast Tier
    // Chúng ta fake tạm bằng cách gọi engine trực tiếp với filter nghiêm ngặt chung
    // Cách tối ưu hơn: Gọi engine 1 lần gộp flavors, hoặc gọi engine N lần cho N thành viên
    
    const memberResults: FastTierCandidate[][] = [];

    for (const uId of userIds) {
      // Fake calling Fast Tier individually with the merged strict allergies context
      const prefs = await recommendationEngine.getUserPreferences(uId);
      const textToEmbed = `Flavor preferences: ${prefs.flavors.join(", ")}`;
      const vector = await recommendationEngine.generateEmbedding(textToEmbed);
      
      const mustNotConditions = strictAllergies.map(allergy => ({
        key: 'ingredients',
        match: { value: allergy }
      }));
      const filterCondition = mustNotConditions.length > 0 ? { must_not: mustNotConditions } : undefined;

      const candidates = await recommendationEngine.searchDishes(vector, 20, filterCondition);
      
      // Map to FastTierCandidate structure (Mocking distance/context scores for group)
      const ranked: FastTierCandidate[] = candidates.map(c => {
        const payload = (c.payload as Record<string, unknown>) || {};
        return {
          id: c.id as string,
          name: (payload.name as string) || 'Unknown',
          vectorScore: c.score ?? 0,
          distanceScore: 0.5,
          contextScore: 0.5,
          finalScore: (c.score ?? 0),
          payload
        };
      });
      
      // Sort
      ranked.sort((a, b) => b.finalScore - a.finalScore);
      memberResults.push(ranked.slice(0, 10)); // Top 10 per member
    }

    // 3. Pareto Aggregation (Borda Count)
    const groupResults = this.applyBordaCount(memberResults);

    return groupResults;
  }
}

export const mediumTierRecommender = new MediumTierRecommender();
