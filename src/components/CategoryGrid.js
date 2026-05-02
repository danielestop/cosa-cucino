'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { RECIPES } from '@/data/recipes';
import { useCustomRecipes } from '@/lib/useCustomRecipes';
import { getCompatibilityLevel } from '@/lib/compatibility';

export default function CategoryGrid({ mode, ageMonths }) {
  const { recipes: customRecipes } = useCustomRecipes();
  const allRecipes = [...customRecipes, ...RECIPES];

  // Filtro categorie in base alla modalità
  const visibleCategories = CATEGORIES.filter((cat) => {
    if (cat.weaning_only) return mode === 'baby';
    return true;
  });

  function countForCategory(slug) {
    return allRecipes.filter((r) => {
      if (r.category !== slug) return false;
      if (mode === 'baby') {
        if (r.recipe_type === 'weaning') {
          if (r.weaning_min_age_months && ageMonths < r.weaning_min_age_months) {
            return false;
          }
          return true;
        }
        const compat = getCompatibilityLevel(r, ageMonths);
        return compat.level !== 'red';
      }
      return true;
    }).length;
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-4">
      {visibleCategories.map((cat) => {
        const count = countForCategory(cat.slug);
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}/`}
            className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition flex items-center gap-2.5"
          >
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 text-2xl"
              style={{ backgroundColor: cat.color }}
            >
              {cat.emoji}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">{cat.name}</div>
              <div className="text-xs text-gray-500">
                {count === 0 ? 'Nessuna ricetta' : count === 1 ? '1 ricetta' : `${count} ricette`}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
