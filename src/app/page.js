'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { RECIPES } from '@/data/recipes';
import { getCompatibilityLevel } from '@/lib/compatibility';
import ModeToggle from '@/components/ModeToggle';
import AgeSlider from '@/components/AgeSlider';
import CategoryGrid from '@/components/CategoryGrid';
import RecipeCard from '@/components/RecipeCard';

function normalize(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function recipeMatchesQuery(recipe, query, mode, ageMonths) {
  if (mode === 'baby') {
    const compat = getCompatibilityLevel(recipe, ageMonths);
    if (compat.level === 'red') return false;
  }
  const q = normalize(query);
  if (!q) return false;

  if (normalize(recipe.title).includes(q)) return true;

  const ingredients = recipe.ingredients || [];
  for (const ing of ingredients) {
    if (normalize(ing.name || '').includes(q)) return true;
    if (normalize(ing.name_normalized || '').includes(q)) return true;
  }
  return false;
}

export default function Home() {
  const [mode, setMode] = useState('adult');
  const [ageMonths, setAgeMonths] = useState(9);
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedMode = localStorage.getItem('cosa-cucino-mode');
    const savedAge = localStorage.getItem('cosa-cucino-age');
    if (savedMode) setMode(savedMode);
    if (savedAge) setAgeMonths(parseInt(savedAge, 10));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('cosa-cucino-mode', mode);
      localStorage.setItem('cosa-cucino-age', String(ageMonths));
    }
  }, [mode, ageMonths, hydrated]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return null;
    return RECIPES.filter((r) => recipeMatchesQuery(r, q, mode, ageMonths));
  }, [searchQuery, mode, ageMonths]);

  return (
    <main className="min-h-screen bg-[#FAF7F2] p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-5 pt-2">
          <div className="text-5xl leading-none">🍲</div>
          <h1 className="text-2xl font-bold text-[#C65D3B] mt-2">Cosa Cucino?</h1>
          <p className="text-sm text-gray-500 mt-1">Il tuo ricettario di famiglia</p>
        </div>

        <ModeToggle mode={mode} onChange={setMode} />

        {mode === 'baby' && (
          <AgeSlider months={ageMonths} onChange={setAgeMonths} />
        )}

        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cerca ricetta o ingrediente..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[#C65D3B]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700"
              aria-label="Pulisci ricerca"
            >
              ×
            </button>
          )}
        </div>

        {searchResults !== null && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {searchResults.length === 0
                ? 'Nessuna ricetta trovata'
                : searchResults.length === 1
                ? '1 ricetta trovata'
                : `${searchResults.length} ricette trovate`}
            </p>
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {searchResults.slice(0, 30).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    mode={mode}
                    ageMonths={ageMonths}
                  />
                ))}
                {searchResults.length > 30 && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Mostrati i primi 30 risultati. Affina la ricerca per vederne altri.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {searchResults === null && (
          <>
            <CategoryGrid mode={mode} ageMonths={ageMonths} />

            <Link
              href="/cosa-cucino-con/"
              className="block w-full mt-4 py-3 bg-[#C65D3B] text-white rounded-lg text-sm font-medium hover:opacity-90 transition text-center"
            >
              🥕 Cosa cucino con...
            </Link>

            <div className="flex gap-2 mt-2">
              <Link
                href="/gira-la-ruota/"
                className="flex-1 py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition text-center"
              >
                🎡 Gira la ruota
              </Link>
              <Link
                href="/preferiti/"
                className="flex-1 py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition text-center"
              >
                ⭐ Preferiti
              </Link>
            </div>

            <Link
              href="/pianificatore/"
              className="block w-full mt-2 py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition text-center"
            >
              📅 Pianificatore settimanale
            </Link>

            <Link
              href="/diario/"
              className="block w-full mt-2 py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition text-center"
            >
              📊 Diario di cucina
            </Link>
            <Link
              href="/dispensa/"
              className="block w-full mt-2 py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition text-center"
            >
              🥫 Dispensa
            </Link>
            <Link
              href="/le-mie-ricette/"
              className="block w-full mt-2 py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition text-center"
            >
              ✏️ Le mie ricette
            </Link>

            <Link
              href="/backup/"
              className="block w-full mt-2 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition text-center"
            >
              💾 Backup dati
            </Link>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-6 pb-4">
          🚧 v0.5 MVP
        </p>
      </div>
    </main>
  );
}