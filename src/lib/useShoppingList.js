import { usePantry } from '@/lib/usePantry';

function normalize(text) {
  if (!text) return '';
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function isSameIngredient(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (na.length > 4 && nb.startsWith(na.substring(0, Math.min(na.length, 5)))) return true;
  if (nb.length > 4 && na.startsWith(nb.substring(0, Math.min(nb.length, 5)))) return true;
  return false;
}

const UNIT_COMPATIBLE = {
  g: ['g', 'kg'],
  kg: ['g', 'kg'],
  ml: ['ml', 'l'],
  l: ['ml', 'l'],
};

function toBaseUnit(quantity, unit) {
  if (unit === 'kg') return { quantity: quantity * 1000, unit: 'g' };
  if (unit === 'l') return { quantity: quantity * 1000, unit: 'ml' };
  return { quantity, unit };
}

function formatAmount(quantity, unit) {
  if (quantity === null || quantity === undefined) return 'q.b.';
  if (unit === 'g' && quantity >= 1000) return `${(quantity / 1000).toFixed(1).replace('.0', '')} kg`;
  if (unit === 'ml' && quantity >= 1000) return `${(quantity / 1000).toFixed(1).replace('.0', '')} l`;
  return `${quantity % 1 === 0 ? quantity : quantity.toFixed(1)} ${unit || ''}`.trim();
}

export function generateShoppingList(plan, pantryItems = []) {
  const items = {};

  Object.entries(plan).forEach(([day, dayPlan]) => {
    Object.entries(dayPlan).forEach(([meal, slots]) => {
      slots.forEach((slot) => {
        const scale = slot.servings / (slot.original_servings || slot.servings || 1);
        const ings = slot.ingredients || [];

        ings.forEach((ing) => {
          if (ing.is_staple) return;

          // Verifica se è in dispensa
          if (pantryItems.some((p) => isSameIngredient(p, ing.name))) return;

          const scaledQty = ing.quantity != null ? ing.quantity * scale : null;
          const category = ing.category || 'altro';
          const key = normalize(ing.name);

          if (!items[key]) {
            items[key] = {
              name: ing.name,
              category,
              entries: [],
            };
          }

          items[key].entries.push({
            quantity: scaledQty,
            unit: ing.unit || 'q.b.',
            recipe: slot.recipe_title,
            day,
            meal,
          });
        });
      });
    });
  });

  // Somma quantità per stesso ingrediente+unità compatibili
  const result = {};
  Object.values(items).forEach((item) => {
    const byUnit = {};
    const qbEntries = [];

    item.entries.forEach((entry) => {
      if (entry.quantity === null || entry.unit === 'q.b.') {
        qbEntries.push(entry);
        return;
      }
      const base = toBaseUnit(entry.quantity, entry.unit);
      if (!byUnit[base.unit]) byUnit[base.unit] = { quantity: 0, unit: base.unit };
      byUnit[base.unit].quantity += base.quantity;
    });

    const amounts = [];
    Object.values(byUnit).forEach(({ quantity, unit }) => {
      amounts.push(formatAmount(quantity, unit));
    });
    if (qbEntries.length > 0 && amounts.length === 0) {
      amounts.push('q.b.');
    }

    const cat = item.category;
    if (!result[cat]) result[cat] = [];
    result[cat].push({
      name: item.name,
      amount: amounts.join(' + '),
      checked: false,
    });
  });

  // Ordina categorie e ingredienti per nome
  const CATEGORY_ORDER = ['verdure', 'frutta', 'carne', 'pesce', 'uova', 'latticini', 'cereali', 'pasta', 'riso', 'legumi', 'lievitati', 'dolcificanti', 'frutta_secca', 'spezie', 'condimenti', 'bevande', 'altro'];

  const sorted = {};
  CATEGORY_ORDER.forEach((cat) => {
    if (result[cat]) {
      sorted[cat] = result[cat].sort((a, b) => a.name.localeCompare(b.name));
    }
  });
  Object.keys(result).forEach((cat) => {
    if (!sorted[cat]) sorted[cat] = result[cat].sort((a, b) => a.name.localeCompare(b.name));
  });

  return sorted;
}