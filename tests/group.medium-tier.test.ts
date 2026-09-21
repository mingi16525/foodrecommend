import { mediumTierRecommender } from '../src/group/mediumTier';
import { groupService } from '../src/group/service';
import { recommendationEngine } from '../src/recommendation/engine';

describe('Medium Tier recommender', () => {
  afterEach(() => jest.restoreAllMocks());

  it('aggregates member rankings using Borda scores', async () => {
    jest.spyOn(groupService, 'getGroupDetails').mockResolvedValue({
      id: 'group-1',
      name: 'Lunch',
      creator_id: 'u1',
      members: [{ id: 'u1' }, { id: 'u2' }]
    } as never);
    jest.spyOn(recommendationEngine, 'getUserPreferences').mockResolvedValue({ flavors: ['savory'], allergies: [] });
    jest.spyOn(recommendationEngine, 'generateEmbedding').mockResolvedValue([0.1]);
    const search = jest.spyOn(recommendationEngine, 'searchDishes');
    search.mockResolvedValueOnce([
      { id: 'dish-a', score: 0.9, payload: { name: 'A', ingredients: ['rice'] } },
      { id: 'dish-b', score: 0.8, payload: { name: 'B', ingredients: ['rice'] } }
    ]);
    search.mockResolvedValueOnce([
      { id: 'dish-b', score: 0.9, payload: { name: 'B', ingredients: ['rice'] } },
      { id: 'dish-a', score: 0.8, payload: { name: 'A', ingredients: ['rice'] } }
    ]);

    const result = await mediumTierRecommender.getGroupRecommendations('group-1', {});

    expect(result).toHaveLength(2);
    expect(result[0].bordaScore).toBe(3);
    expect(result[1].bordaScore).toBe(3);
    expect(search).toHaveBeenCalledTimes(2);
  });
});
