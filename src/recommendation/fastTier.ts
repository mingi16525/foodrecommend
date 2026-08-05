import { recommendationEngine } from './engine';
import { ContextParams } from './routing';

export interface FastTierCandidate {
  id: string;
  name: string;
  vectorScore: number;
  distanceScore: number;
  contextScore: number;
  finalScore: number;
  payload: Record<string, unknown>;
}

export class FastTierRecommender {
  
  /**
   * Tính khoảng cách Haversine (km) giữa 2 điểm GPS
   */
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Tính điểm Context (Thời gian)
   */
  private calculateContextScore(currentTime: Date | undefined, payload: Record<string, unknown>): number {
    if (!currentTime) return 0;
    const hour = currentTime.getHours();
    let currentSession = 'dinner';
    if (hour >= 5 && hour < 11) currentSession = 'breakfast';
    else if (hour >= 11 && hour < 14) currentSession = 'lunch';
    else if (hour >= 14 && hour < 17) currentSession = 'snack';
    else if (hour >= 22 || hour < 5) currentSession = 'latenight';

    // Giả sử payload có mảng suitable_for chứa 'breakfast', 'lunch'...
    const suitableFor = (payload.suitable_for as string[]) || [];
    if (suitableFor.includes(currentSession)) {
      return 1.0;
    }
    return 0.2;
  }

  /**
   * Pipeline chính cho Fast Tier
   */
  public async getRecommendations(userId: string | undefined, contextParams: ContextParams): Promise<FastTierCandidate[]> {
    console.log(`[Fast Tier] Processing request for User: ${userId || 'Guest'}`);

    // 1. Fetch user preferences to generate context vector
    let flavors = ['savory'];
    let allergies: string[] = [];
    
    if (userId) {
      const prefs = await recommendationEngine.getUserPreferences(userId);
      flavors = prefs.flavors;
      allergies = prefs.allergies;
    }

    // 2. Tách bộ lọc dị ứng
    const mustNotConditions = allergies.map(allergy => ({
      key: 'ingredients',
      match: { value: allergy }
    }));
    const filterCondition = mustNotConditions.length > 0 ? { must_not: mustNotConditions } : undefined;

    // 3. Generate Embedding
    const textToEmbed = `Flavor preferences: ${flavors.join(", ")}`;
    const vector = await recommendationEngine.generateEmbedding(textToEmbed);

    // 4. Lấy 50 Candidates từ Qdrant
    const candidates = await recommendationEngine.searchDishes(vector, 50, filterCondition);

    // 5. Decision Optimizer (Re-ranking)
    const userLat = contextParams.location?.lat;
    const userLng = contextParams.location?.lng;
    const currentTime = contextParams.time || new Date();

    const rankedCandidates: FastTierCandidate[] = candidates.map(candidate => {
      const payload = (candidate.payload as Record<string, unknown>) || {};
      const dishLat = payload.lat as number | undefined;
      const dishLng = payload.lng as number | undefined;

      // Calculate Distance Score
      let distanceScore: number;
      if (userLat !== undefined && userLng !== undefined && dishLat !== undefined && dishLng !== undefined) {
        const distanceKm = this.calculateHaversineDistance(userLat, userLng, dishLat, dishLng);
        // Normalize: < 1km = 1.0, > 10km = 0.0
        distanceScore = Math.max(0, 1 - (distanceKm / 10));
      } else {
        distanceScore = 0.5; // Neutral
      }

      // Calculate Context Score
      const contextScore = this.calculateContextScore(currentTime, payload);

      // Vector score from Qdrant
      const vectorScore = candidate.score ?? 0;

      // Final FAISS-like Ranking Score Formula
      const finalScore = (vectorScore * 0.6) + (distanceScore * 0.3) + (contextScore * 0.1);

      return {
        id: candidate.id as string,
        name: (payload.name as string) || 'Unknown',
        vectorScore,
        distanceScore,
        contextScore,
        finalScore,
        payload
      };
    });

    // 6. Sort by Final Score DESC and take top 10
    rankedCandidates.sort((a, b) => b.finalScore - a.finalScore);
    return rankedCandidates.slice(0, 10);
  }
}

export const fastTierRecommender = new FastTierRecommender();
