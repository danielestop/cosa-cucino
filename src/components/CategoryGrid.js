'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { RECIPES } from '@/data/recipes';
import { countRecipesForCategory } from '@/lib/compatibility';

export default function CategoryGrid({ mode, ageMonths }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">Categorie</p>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((cat) => {
          const count = countRecipesForCategory(RECIPES, cat.slug, mode, ageMonths);
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}/`}
              className="p-3 bg-white border border-gray-200 rounded-lg text-left hover:shadow-sm transition block"
            >
              <div className="text-2xl leading-none">{cat.emoji}</div>
              <div className="text-sm font-medium mt-1 text-gray-800">{cat.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {count === 0 ? 'Nessuna ricetta' : count === 1 ? '1 ricetta' : `${count} ricette`}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}