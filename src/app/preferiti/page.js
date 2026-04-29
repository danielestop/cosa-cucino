'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RECIPES } from '@/data/recipes';
import { useFavorites } from '@/lib/useFavorites';
import RecipeCard from '@/components/RecipeCard';

export default function PreferitiPage() {
  const { favorites, hydrated } = useFavorites();
  const [mode, setMode] = useState('adult');
  const [ageMonths, setAgeMonths] = useState(9);

  useEffect(() => {
    const savedMode = localStorage.getItem('cosa-cucino-mode');
    const savedAge = localStorage.getItem('cosa-cucino-age');
    if (savedMode) setMode(savedMode);
    if (savedAge) setAgeMonths(parseInt(savedAge, 10));
  }, []);

  const favRecipes = RECIPES.filter((r) => favorites.includes(r.id));

  return (
    <main className="min-h-screen bg-[#FAF7F2] p-4 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-[#C65D3B] hover:text-white hover:border-[#C65D3B] transition shadow-sm"
            aria-label="Torna alla home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
          <h1 className="text-base font-medium text-[#C65D3B]">⭐ I miei preferiti</h1>
        </div>

        {!hydrated ? (
          <p className="text-gray-500 text-sm">Caricamento...</p>
        ) : favRecipes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-sm text-gray-700 mb-1">Nessun preferito ancora</p>
            <p className="text-xs text-gray-500">
              Quando trovi una ricetta che ti piace, tocca la stella per salvarla qui.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">
              {favRecipes.length === 1
                ? '1 ricetta salvata'
                : `${favRecipes.length} ricette salvate`}
            </p>
            <div className="flex flex-col gap-2.5">
              {favRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  mode={mode}
                  ageMonths={ageMonths}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}