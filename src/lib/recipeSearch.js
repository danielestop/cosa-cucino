function normalize(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'di', 'e', 'a', 'da', 'in', 'su', 'con', 'per', 'tra', 'fra',
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'uno',
  'al', 'allo', 'alla', 'ai', 'agli', 'alle',
  'del', 'dello', 'della', 'dei', 'degli', 'delle',
  'fresco', 'fresca', 'freschi', 'fresche',
  'secco', 'secca', 'secchi', 'secche',
  'extra', 'extravergine',
]);

function getKeywords(text) {
  const normalized = normalize(text);
  if (!normalized) return [];
  return normalized
    .split(' ')
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function tokensMatch(searchToken, ingredientToken) {
  if (searchToken === ingredientToken) return true;
  if (searchToken.length >= 4 && ingredientToken.startsWith(searchToken)) return true;
  if (ingredientToken.length >= 4 && searchToken.startsWith(ingredientToken)) return true;
  if (searchToken.length >= 5 && ingredientToken.length >= 5) {
    const minLen = Math.min(searchToken.length, ingredientToken.length);
    const stem = Math.max(4, minLen - 2);
    if (searchToken.substring(0, stem) === ingredientToken.substring(0, stem)) {
      return true;
    }
  }
  return false;
}

function matchesIngredient(searchTerm, recipeIngredient) {
  const searchTokens = getKeywords(searchTerm);
  if (searchTokens.length === 0) return false;

  const ingText = (recipeIngredient.name || '') + ' ' + (recipeIngredient.name_normalized || recipeIngredient.normalized || '');
  const ingTokens = getKeywords(ingText);

  return searchTokens.every((sToken) =>
    ingTokens.some((iToken) => tokensMatch(sToken, iToken))
  );
}

function isInPantry(recipeIngredient, pantryItems) {
  if (!pantryItems || pantryItems.length === 0) return false;
  for (const pantryName of pantryItems) {
    if (matchesIngredient(pantryName, recipeIngredient)) {
      return true;
    }
  }
  return false;
}

export function searchRecipesByIngredients(recipes, searchIngredients, maxMissing, maxTotalMinutes, mode, ageMonths, getCompatibilityLevel, pantryItems = []) {
  if (!searchIngredients || searchIngredients.length === 0) {
    return [];
  }

  const results = [];

  for (const recipe of recipes) {
    if (maxTotalMinutes && recipe.total_time_min > maxTotalMinutes) continue;

    if (mode === 'baby' && getCompatibilityLevel) {
      const compat = getCompatibilityLevel(recipe, ageMonths);
      if (compat.level === 'red') continue;
    }

    // Ingredienti rilevanti: main e non staple (sale/olio sono sempre dati per scontati)
    // E inoltre, escludiamo quelli in dispensa
    const mainIngredients = (recipe.ingredients || []).filter(
      (ing) => ing.is_main && !ing.is_staple && !isInPantry(ing, pantryItems)
    );

    const matchedSearchTerms = new Set();
    for (const searchIng of searchIngredients) {
      for (const recipeIng of mainIngredients) {
        if (matchesIngredient(searchIng, recipeIng)) {
          matchedSearchTerms.add(searchIng.toLowerCase());
          break;
        }
      }
    }

    if (matchedSearchTerms.size < searchIngredients.length) continue;

    const missingMain = mainIngredients.filter((recipeIng) => {
      for (const searchIng of searchIngredients) {
        if (matchesIngredient(searchIng, recipeIng)) return false;
      }
      return true;
    });

    if (missingMain.length > maxMissing) continue;

    results.push({
      recipe,
      missingIngredients: missingMain.map((i) => i.name),
      missingCount: missingMain.length,
    });
  }

  results.sort((a, b) => a.missingCount - b.missingCount);
  return results;
}