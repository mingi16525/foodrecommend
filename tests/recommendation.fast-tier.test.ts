import { fastTierRecommender } from '../src/recommendation/fastTier';
import { recommendationEngine } from '../src/recommendation/engine';

describe('Fast Tier recommendation', () => {
  it('removes allergy matches after the Qdrant query as a second safety check', async () => {
    jest.spyOn(recommendationEngine, 'getUserPreferences').mockResolvedValue({
      flavors: ['savory'],
      allergies: ['peanut']
    });
    jest.spyOn(recommendationEngine, 'generateEmbedding').mockResolvedValue([0.1, 0.2]);
    const search = jest.spyOn(recommendationEngine, 'searchDishes').mockResolvedValue([
      { id: 'unsafe', score: 0.99, payload: { name: 'Peanut dish', ingredients: ['Peanuts'] } },
      { id: 'safe', score: 0.8, payload: { name: 'Rice dish', ingredients: ['rice'] } }
    ]);

    const results = await fastTierRecommender.getRecommendations('user-1', {});

    expect(search).toHaveBeenCalledWith(
      [0.1, 0.2],
      50,
      { must_not: [{ key: 'ingredients', match: { value: 'peanut' } }] }
    );
    expect(results.map((result) => result.id)).toEqual(['safe']);
  });
});
