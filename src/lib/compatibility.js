export function getCompatibilityLevel(recipe, ageMonths) {
  if (recipe.recipe_type === 'weaning') {
    if (recipe.weaning_min_age_months && ageMonths >= recipe.weaning_min_age_months) {
      return { level: 'green', note: `Ricetta pensata per lo svezzamento, adatta dai ${recipe.weaning_min_age_months} mesi.` };
    }
    return { level: 'red', note: `Questa ricetta è pensata dai ${recipe.weaning_min_age_months} mesi.` };
  }

  if (recipe.recipe_type === 'both' && recipe.baby_compatibility) {
    const c = recipe.baby_compatibility;
    if (ageMonths >= c.min_age_green) return { level: 'green', note: 'Adatta così com\'è.' };
    if (ageMonths >= c.min_age_amber) return { level: 'amber', note: c.amber_note };
    return { level: 'red', note: c.red_note };
  }

  if (recipe.baby_compatibility) {
    const c = recipe.baby_compatibility;
    if (ageMonths >= c.min_age_green) return { level: 'green', note: 'Adatta così com\'è.' };
    if (ageMonths >= c.min_age_amber) return { level: 'amber', note: c.amber_note };
    return { level: 'red', note: c.red_note };
  }

  return { level: 'red', note: 'Informazioni di compatibilità non disponibili per questa ricetta.' };
}

export function countRecipesForCategory(recipes, categorySlug, mode, ageMonths) {
  return recipes.filter((r) => {
    if (r.category !== categorySlug) return false;
    if (mode === 'adult') return true;
    const compat = getCompatibilityLevel(r, ageMonths);
    return compat.level !== 'red';
  }).length;
}