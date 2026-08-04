export interface UserItemScore {
  userId: string;
  itemId: string;
  score: number; // For Borda Count, this could be the rank or a normalized score [0..1]
}

export interface GroupScoreResult {
  itemId: string;
  groupScore: number;
}

/**
 * AI Group Decision Engine
 * Implements Pareto Aggregation & Borda Count logic
 */
export class GroupDecisionEngine {
  
  /**
   * Calculates the group score for each item using the formula:
   * Score(G, i) = SUM(w_j * Score(u_j, i)) - lambda * Variance(Scores)
   * 
   * @param userScores An array of score objects. Expected to have normalized scores (0 to 1)
   * @param lambda Penalty for variance. Higher means it avoids polarizing items.
   * @returns Array of items sorted by their group score descending.
   */
  public calculateGroupScores(
    userScores: UserItemScore[],
    lambda: number = 0.5
  ): GroupScoreResult[] {
    // Group scores by Item
    const itemMap = new Map<string, number[]>();
    for (const us of userScores) {
      if (!itemMap.has(us.itemId)) {
        itemMap.set(us.itemId, []);
      }
      itemMap.get(us.itemId)!.push(us.score);
    }

    const results: GroupScoreResult[] = [];

    itemMap.forEach((scores, itemId) => {
      const n = scores.length;
      if (n === 0) return;

      // Assume equal weight for all users w_j = 1/n
      const sum = scores.reduce((a, b) => a + b, 0);
      const mean = sum / n;

      // Calculate variance
      let variance = 0;
      if (n > 1) {
        let sqSum = 0;
        for (const s of scores) {
          sqSum += Math.pow(s - mean, 2);
        }
        variance = sqSum / n; // population variance
      }

      // Formula: Average Score - lambda * Variance
      // Using average instead of sum so it's scale invariant to group size
      const groupScore = mean - (lambda * variance);

      results.push({
        itemId,
        groupScore
      });
    });

    // Sort descending
    return results.sort((a, b) => b.groupScore - a.groupScore);
  }
}

export const groupDecisionEngine = new GroupDecisionEngine();
