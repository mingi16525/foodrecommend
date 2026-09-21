export const normalizeToken = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLocaleLowerCase() : '';

export const getIngredientTokens = (ingredients: unknown): string[] => {
  if (!Array.isArray(ingredients)) return [];

  return ingredients.flatMap((ingredient) => {
    if (typeof ingredient === 'string') return [normalizeToken(ingredient)];
    if (ingredient && typeof ingredient === 'object') {
      const value = (ingredient as { name?: unknown; value?: unknown }).name ??
        (ingredient as { value?: unknown }).value;
      return [normalizeToken(value)];
    }
    return [];
  }).filter(Boolean);
};

export const isSafeFromAllergies = (payload: Record<string, unknown>, allergies: string[]): boolean => {
  const ingredients = getIngredientTokens(payload.ingredients);
  if (ingredients.length === 0 || allergies.length === 0) return true;

  return !allergies.some((allergy) => {
    const normalizedAllergy = normalizeToken(allergy);
    return normalizedAllergy.length > 0 && ingredients.some((ingredient) =>
      ingredient === normalizedAllergy || ingredient.includes(normalizedAllergy) || normalizedAllergy.includes(ingredient)
    );
  });
};

export const buildAllergyFilter = (allergies: string[]) => {
  const conditions = allergies
    .map(normalizeToken)
    .filter(Boolean)
    .map((allergy) => ({ key: 'ingredients', match: { value: allergy } }));

  return conditions.length > 0 ? { must_not: conditions } : undefined;
};
