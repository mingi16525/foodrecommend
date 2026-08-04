import { RecommendationEngine } from '../src/recommendation/engine';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;

  beforeEach(() => {
    engine = new RecommendationEngine();
  });

  it('should return mock recommendations', async () => {
    const results = await engine.getRecommendations('user123');
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('should process swipe events successfully', async () => {
    const result = await engine.processSwipeEvent('user123', 'dish1', 'like');
    expect(result.success).toBe(true);
  });
});
