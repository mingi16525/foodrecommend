import { buildAllergyFilter, isSafeFromAllergies } from '../src/recommendation/filters';

describe('Recommendation allergy filters', () => {
  it('builds a Qdrant exclusion filter from normalized allergies', () => {
    expect(buildAllergyFilter([' Peanuts ', ''])).toEqual({
      must_not: [{ key: 'ingredients', match: { value: 'peanuts' } }]
    });
  });

  it('rejects case and substring ingredient matches', () => {
    expect(isSafeFromAllergies({ ingredients: ['Peanut butter', 'salt'] }, ['PEANUT'])).toBe(false);
    expect(isSafeFromAllergies({ ingredients: [{ name: 'milk' }] }, ['egg'])).toBe(true);
  });
});
