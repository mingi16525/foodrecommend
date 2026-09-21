import { FeatureStore } from '../src/recommendation/featureStore';

describe('FeatureStore memory fallback', () => {
  it('creates default features and learns a liked flavor', async () => {
    const store = new FeatureStore();

    await store.updateUserFeatures('user-feature-test', 'dish-1', 'like');

    await expect(store.getUserFeatures('user-feature-test')).resolves.toEqual({
      flavors: ['savory', 'spicy'],
      allergies: []
    });
  });

  it('does not add a flavor for a skipped dish', async () => {
    const store = new FeatureStore();

    await store.updateUserFeatures('user-skip-test', 'dish-1', 'skip');

    await expect(store.getUserFeatures('user-skip-test')).resolves.toEqual({
      flavors: ['savory'],
      allergies: []
    });
  });
});
