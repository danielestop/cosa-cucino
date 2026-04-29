'use client';

import Link from 'next/link';
import { getCompatibilityLevel } from '@/lib/compatibility';
import { useFavorites } from '@/lib/useFavorites';

export default function RecipeCard({ recipe, mode, ageMonths }) {
  const { isFavorite } = useFavorites();
  const isFav = isFavorite(recipe.id);

  let babyBadge = null;
  if (mode === 'baby') {
    if (recipe.recipe_type === 'weaning' && recipe.weaning_min_age_months) {
      babyBadge = (
        <span className="text-xs bg-[#E6F1FB] text-[#0C447C] px-1.5 py-0.5 rounded">
          👶 da {recipe.weaning_min_age_months}m
        </span>
      );
    } else {
      const compat = getCompatibilityLevel(recipe, ageMonths);
      if (compat.level === 'green') {
        babyBadge = (
          <span className="text-xs bg-[#EAF3DE] text-[#3B5A21] px-1.5 py-0.5 rounded">
            🟢 adatta
          </span>
        );
      } else if (compat.level === 'amber') {
        babyBadge = (
          <span className="text-xs bg-[#FAEEDA] text-[#854F0B] px-1.5 py-0.5 rounded">
            🟡 adattabile
          </span>
        );
      }
    }
  }

  return (
    <Link
      href={`/recipe/${recipe.id}/`}
      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition relative"
    >
      <div className="flex">
        <div
          className="w-[90px] h-[90px] flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: recipe.image_color }}
        >
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-4xl">{recipe.emoji}</span>
          )}
        </div>
        <div className="py-2.5 px-3 flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800 truncate pr-5">
            {recipe.title}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">
            {recipe.source_site}
          </div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
              ⏱ {recipe.total_time_min} min
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
              ● {recipe.difficulty}
            </span>
            {babyBadge}
          </div>
        </div>
      </div>
      {isFav && (
        <span className="absolute top-1.5 right-2 text-yellow-500 text-lg leading-none" aria-hidden="true">
          ★
        </span>
      )}
    </Link>
  );
}