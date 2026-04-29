export function applyFilters(recipe, filters) {
  if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
  if (filters.maxTime && recipe.total_time_min > filters.maxTime) return false;

  if (filters.cookingMethods && filters.cookingMethods.length > 0) {
    if (!filters.cookingMethods.includes(recipe.cooking_method)) return false;
  }

  if (filters.dietFlags && filters.dietFlags.length > 0) {
    const flags = recipe.diet_flags || {};
    for (const required of filters.dietFlags) {
      if (!flags[required]) return false;
    }
  }

  return true;
}

export const EMPTY_FILTERS = {
  difficulty: null,
  maxTime: null,
  cookingMethods: [],
  dietFlags: [],
};