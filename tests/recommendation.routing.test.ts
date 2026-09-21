import { AiTier, DecisionComplexityEstimator, IntentType } from '../src/recommendation/routing';

describe('AI tier routing', () => {
  const estimator = new DecisionComplexityEstimator();

  it('routes multi-day plans to Deep Tier', () => {
    expect(estimator.estimateAndRoute({
      intentType: IntentType.TRIP_PLANNER,
      contextParams: { multiDay: true }
    }).tier).toBe(AiTier.DEEP);
  });

  it('routes group orders and strict constraints to Medium Tier', () => {
    expect(estimator.estimateAndRoute({
      intentType: IntentType.GROUP_ORDER,
      contextParams: { membersCount: 3 }
    }).tier).toBe(AiTier.MEDIUM);
  });

  it('routes a normal swipe to Fast Tier', () => {
    expect(estimator.estimateAndRoute({
      intentType: IntentType.SWIPE,
      contextParams: {}
    }).tier).toBe(AiTier.FAST);
  });
});
