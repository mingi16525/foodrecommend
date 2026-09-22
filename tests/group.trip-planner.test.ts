import { DeepTierPlanner } from '../src/group/tripPlanner';
import { groupService } from '../src/group/service';
import { recommendationEngine } from '../src/recommendation/engine';

describe('DeepTierPlanner', () => {
  afterEach(() => jest.restoreAllMocks());

  it('validates LLM output and grounds each meal in Qdrant', async () => {
    const planner = new DeepTierPlanner();
    jest.spyOn(groupService, 'getGroupDetails').mockResolvedValue({
      id: 'g1', name: 'Trip', creator_id: 'u1', members: [{ id: 'u1' }]
    } as never);
    jest.spyOn(recommendationEngine, 'getUserPreferences').mockResolvedValue({ flavors: ['savory'], allergies: ['peanut'] });
    jest.spyOn(recommendationEngine, 'generateEmbedding').mockResolvedValue([0.1]);
    jest.spyOn(recommendationEngine, 'searchDishes').mockResolvedValue([
      { id: 'dish-1', score: 0.9, payload: { name: 'Safe dish', ingredients: ['rice'] } }
    ]);
    jest.spyOn(planner as never, 'callLLM' as never).mockResolvedValue([
      { day: 1, session: 'lunch', searchString: 'rice dish', reasoning: 'Safe choice' }
    ] as never);

    const result = await planner.generateTripPlan('g1', {});

    expect(result.tripDays).toBe(1);
    expect(result.plan[0].recommendedDish?.id).toBe('dish-1');
  });

  it('falls back to default plan when LLM returns malformed schema', async () => {
    const planner = new DeepTierPlanner();
    jest.spyOn(planner as never, 'callLLM' as never).mockResolvedValue([
      { day: 3, session: 'lunch', searchString: 'x', reasoning: 'x' }
    ] as never);
    jest.spyOn(recommendationEngine, 'searchDishes').mockResolvedValue([]);

    const result = await planner.generateTripPlan(undefined, {});
    expect(result.tripDays).toBe(1);
    expect(result.plan.length).toBe(3);
    expect(result.plan[0].session).toBe('breakfast');
  });
});
