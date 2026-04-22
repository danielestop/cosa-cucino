const WHOLE_ITEMS = new Set([
  'pz',
  'spicchi',
  'cucchiai',
  'cucchiaini',
  'bicchieri',
]);

export function scaleIngredient(ingredient, originalServings, newServings) {
  if (ingredient.quantity === null || ingredient.quantity === undefined) {
    return { ...ingredient, scaled_quantity: null };
  }

  const factor = newServings / originalServings;
  const raw = ingredient.quantity * factor;

  let displayValue;
  if (WHOLE_ITEMS.has(ingredient.unit)) {
    displayValue = Math.max(1, Math.ceil(raw));
  } else if (raw < 10) {
    displayValue = Math.round(raw * 10) / 10;
  } else {
    displayValue = Math.round(raw);
  }

  return { ...ingredient, scaled_quantity: displayValue };
}

export function formatIngredient(ingredient) {
  const qty = ingredient.scaled_quantity ?? ingredient.quantity;
  const unit = ingredient.unit;

  if (qty === null || qty === undefined) {
    return `${unit === 'q.b.' ? 'q.b.' : ''} ${ingredient.name}`.trim();
  }

  if (unit === 'pz') {
    return `${qty} ${ingredient.name}`;
  }

  return `${qty} ${unit} di ${ingredient.name}`;
}