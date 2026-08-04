import { cosineSimilarity, generateEmbedding, maximalMarginalRelevance } from '../src/ai/utils';
import { GroupDecisionEngine } from '../src/ai/groupDecision';

describe('AI Utilities', () => {
  describe('Cosine Similarity', () => {
    it('should return 1 for identical vectors', () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2, 3];
      expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vecA = [1, 0];
      const vecB = [0, 1];
      expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0.0);
    });

    it('should return -1 for opposite vectors', () => {
      const vecA = [1, 2];
      const vecB = [-1, -2];
      expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(-1.0);
    });
  });

  describe('Generate Embedding', () => {
    it('should generate a 5-d vector for a string', () => {
      const vec = generateEmbedding('test string');
      expect(vec.length).toBe(5);
      vec.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
    });

    it('should be deterministic', () => {
      const vec1 = generateEmbedding('apple');
      const vec2 = generateEmbedding('apple');
      expect(vec1).toEqual(vec2);
    });
  });

  describe('Maximal Marginal Relevance (MMR)', () => {
    it('should select the most relevant item first', () => {
      const query = [1, 0, 0];
      const items = [
        { id: 'item1', score: 0, embedding: [1, 0, 0] }, // Exact match
        { id: 'item2', score: 0, embedding: [0, 1, 0] }
      ];

      const results = maximalMarginalRelevance(items, query, 0.5, 2);
      expect(results[0].id).toBe('item1');
    });

    it('should diversify the second item', () => {
      // Query wants something close to [1, 1]
      const query = [1, 1];
      
      const items = [
        { id: 'itemA', score: 0, embedding: [1, 1] }, // Very relevant (sim = 1.0)
        { id: 'itemB', score: 0, embedding: [0.8, 1] }, // Highly relevant (sim < 1.0), but similar to itemA
        { id: 'itemC', score: 0, embedding: [-1, 1] } // Less relevant, but highly diverse from itemA
      ];

      // If lambda = 1 (pure relevance), B should be second.
      const relResults = maximalMarginalRelevance(items, query, 1.0, 2);
      expect(relResults[1].id).toBe('itemB');

      // If lambda = 0 (pure diversity), C should be second because it's far from A.
      const divResults = maximalMarginalRelevance(items, query, 0.0, 2);
      expect(divResults[1].id).toBe('itemC');
    });
  });
});

describe('Group Decision Engine', () => {
  let engine: GroupDecisionEngine;

  beforeEach(() => {
    engine = new GroupDecisionEngine();
  });

  it('should rank items based on pareto aggregation and penalize variance', () => {
    // 3 users
    const userScores = [
      // Item 1: Everyone likes it (Score: 0.8) -> Variance: 0
      { userId: 'u1', itemId: 'item1', score: 0.8 },
      { userId: 'u2', itemId: 'item1', score: 0.8 },
      { userId: 'u3', itemId: 'item1', score: 0.8 },

      // Item 2: Polarizing (Scores: 1.0, 1.0, 0.1) -> Mean: 0.7, Variance: high
      { userId: 'u1', itemId: 'item2', score: 1.0 },
      { userId: 'u2', itemId: 'item2', score: 1.0 },
      { userId: 'u3', itemId: 'item2', score: 0.1 },
    ];

    // lambda = 1.0 to heavily penalize variance
    const results = engine.calculateGroupScores(userScores, 1.0);
    
    // item1 should win because it has 0 variance, even though item2 has a mean of 0.7
    // item1 mean = 0.8. groupScore = 0.8 - 0 = 0.8
    // item2 mean = 0.7. variance = ((0.3)^2 + (0.3)^2 + (-0.6)^2)/3 = (0.09+0.09+0.36)/3 = 0.18. groupScore = 0.7 - 1.0*0.18 = 0.52
    expect(results[0].itemId).toBe('item1');
    expect(results[1].itemId).toBe('item2');
    
    expect(results[0].groupScore).toBeCloseTo(0.8);
    expect(results[1].groupScore).toBeCloseTo(0.52);
  });
});
