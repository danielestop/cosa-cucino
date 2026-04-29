'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { RECIPES } from '@/data/recipes';
import { getCompatibilityLevel } from '@/lib/compatibility';
import { scaleIngredient, formatIngredient } from '@/lib/scaling';
import CompatibilityBadge from '@/components/CompatibilityBadge';
import { useFavorites } from '@/lib/useFavorites';

export default function RecipePage() {
  const params = useParams();
  const id = params.id;

  const [mode, setMode] = useState('adult');
  const [ageMonths, setAgeMonths] = useState(9);
  const [hydrated, setHydrated] = useState(false);

  const recipe = RECIPES.find((r) => r.id === id);
  const [servings, setServings] = useState(recipe?.servings ?? 4);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(id);

  useEffect(() => {
    const savedMode = localStorage.getItem('cosa-cucino-mode');
    const savedAge = localStorage.getItem('cosa-cucino-age');
    if (savedMode) setMode(savedMode);
    if (savedAge) setAgeMonths(parseInt(savedAge, 10));
    setHydrated(true);
  }, []);

  if (!recipe) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] p-4">
        <div className="max-w-md mx-auto">
          <p className="text-gray-700">Ricetta non trovata.</p>
          <Link href="/" className="text-[#C65D3B] underline">
            ← Torna alla home
          </Link>
        </div>
      </main>
    );
  }

  const compat = mode === 'baby' ? getCompatibilityLevel(recipe, ageMonths) : null;
  const scaledIngredients = recipe.ingredients.map((ing) =>
    scaleIngredient(ing, recipe.servings, servings)
  );

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-8">
      <div className="max-w-md mx-auto">
        <div
          className="h-48 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: recipe.image_color }}
        >
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">{recipe.emoji}</span>
          )}
          <Link
            href={`/category/${recipe.category}/`}
            className="absolute left-3 top-3 w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-800 hover:bg-[#C65D3B] hover:text-white transition shadow-md z-10"
            aria-label="Torna alla lista ricette"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-medium text-gray-900">{recipe.title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                da {recipe.source_site}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(id)}
              className={`text-2xl leading-none transition ${
                isFav ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
              }`}
              aria-label={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            >
              {isFav ? '★' : '☆'}
            </button>
          </div>

          {recipe.description && (
            <p className="text-sm text-gray-600 mt-2">{recipe.description}</p>
          )}

          {hydrated && compat && (
            <CompatibilityBadge level={compat.level} note={compat.note} />
          )}

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-white p-2 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500">Tempo totale</div>
              <div className="text-sm font-medium text-gray-800">⏱ {recipe.total_time_min} min</div>
            </div>
            <div className="bg-white p-2 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500">Difficoltà</div>
              <div className="text-sm font-medium text-gray-800">● {recipe.difficulty}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 mt-3 bg-white px-3 py-2 rounded-md border border-gray-200">
            <span className="text-sm text-gray-600">Porzioni:</span>
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-7 h-7 border border-gray-300 bg-[#FAF7F2] rounded-md text-gray-700 hover:bg-gray-100 transition"
              aria-label="Riduci porzioni"
            >
              −
            </button>
            <span className="text-base font-medium min-w-[20px] text-center text-gray-900">
              {servings}
            </span>
            <button
              onClick={() => setServings(Math.min(20, servings + 1))}
              className="w-7 h-7 border border-gray-300 bg-[#FAF7F2] rounded-md text-gray-700 hover:bg-gray-100 transition"
              aria-label="Aumenta porzioni"
            >
              +
            </button>
            {servings !== recipe.servings && (
              <span className="text-xs text-gray-500 ml-auto">
                (orig. {recipe.servings})
              </span>
            )}
          </div>

          <h2 className="text-sm font-medium text-gray-600 mt-4 mb-2">Ingredienti</h2>
          <ul className="bg-white rounded-md border border-gray-200 p-3 text-sm text-gray-800 space-y-1.5">
            {scaledIngredients.map((ing, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#C65D3B] mt-0.5">•</span>
                <span>{formatIngredient(ing)}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-sm font-medium text-gray-600 mt-4 mb-2">Procedimento</h2>
          <ol className="bg-white rounded-md border border-gray-200 p-3 text-sm text-gray-800 space-y-3">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="font-medium text-[#C65D3B] flex-shrink-0">
                  {idx + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {recipe.source_url ? (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full block py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition text-center"
            >
              🔗 Vedi ricetta originale su {recipe.source_site}
            </a>
          ) : null}

          <button className="mt-2 w-full py-2.5 bg-[#6B8E4E] text-white rounded-lg text-sm font-medium hover:opacity-90 transition">
            ✓ Segna come cucinata
          </button>
        </div>
      </div>
    </main>
  );
}