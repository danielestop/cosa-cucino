'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import { RECIPES } from '@/data/recipes';
import { getCompatibilityLevel } from '@/lib/compatibility';
import RecipeCard from '@/components/RecipeCard';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;

  const [mode, setMode] = useState('adult');
  const [ageMonths, setAgeMonths] = useState(9);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('cosa-cucino-mode');
    const savedAge = localStorage.getItem('cosa-cucino-age');
    if (savedMode) setMode(savedMode);
    if (savedAge) setAgeMonths(parseInt(savedAge, 10));
    setHydrated(true);
  }, []);

  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] p-4">
        <div className="max-w-md mx-auto">
          <p className="text-gray-700">Categoria non trovata.</p>
          <Link href="/" className="text-[#C65D3B] underline">
            ← Torna alla home
          </Link>
        </div>
      </main>
    );
  }

  let recipes = RECIPES.filter((r) => r.category === slug);

  if (mode === 'baby') {
    recipes = recipes.filter((r) => {
      const compat = getCompatibilityLevel(r, ageMonths);
      return compat.level !== 'red';
    });
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] p-4">
        <div className="max-w-md mx-auto">
          <div className="text-gray-500 text-sm">Caricamento...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] p-4">
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
          <h1 className="text-base font-medium text-[#C65D3B]">
            {category.emoji} {category.name}
          </h1>
        </div>

        {mode === 'adult' ? (
          <div className="bg-[#EDF4E7] border-l-[3px] border-[#6B8E4E] px-2.5 py-2 rounded mb-3 text-xs text-[#3B5A21]">
            👨 Modalità Adulti
          </div>
        ) : (
          <div className="bg-[#E8F2F8] border-l-[3px] border-[#378ADD] px-2.5 py-2 rounded mb-3 text-xs text-[#0C447C]">
            👶 Modalità Bambino · {ageMonths} mesi
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-3xl mb-2">😕</div>
            <p className="text-sm text-gray-700 mb-1">Nessuna ricetta disponibile</p>
            <p className="text-xs text-gray-500">
              {mode === 'baby'
                ? `Prova a cambiare l'età o torna alla modalità Adulti.`
                : `Al momento non ci sono ricette in questa categoria.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                mode={mode}
                ageMonths={ageMonths}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}