import { RecommendationEngine } from '../src/recommendation/engine';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;

  beforeEach(() => {
    engine = new RecommendationEngine();
    jest.spyOn(engine, 'searchDishes').mockResolvedValue([
      { id: '1', score: 0.99, payload: { name: 'Phở Bò' } },
      { id: '2', score: 0.85, payload: { name: 'Bún Chả' } }
    ]);
    jest.spyOn(engine, 'processSwipeEvent').mockResolvedValue({ success: true });
  });

  it('should return search results from Qdrant', async () => {
    const results = await engine.searchDishes([0.1, 0.2], 50);
    expect(results).toHaveLength(2);
    expect((results[0].payload as any).name).toBe('Phở Bò');
  });

  it('should process swipe events successfully', async () => {
    const result = await engine.processSwipeEvent('user123', 'dish1', 'like');
    expect(result.success).toBe(true);
  });
});
