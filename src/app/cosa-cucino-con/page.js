'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RECIPES } from '@/data/recipes';
import { getCompatibilityLevel } from '@/lib/compatibility';
import { searchRecipesByIngredients } from '@/lib/recipeSearch';
import IngredientChipsInput from '@/components/IngredientChipsInput';
import RecipeCard from '@/components/RecipeCard';

const TIME_OPTIONS = [
  { value: null, label: 'Qualsiasi' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
];

const MISSING_OPTIONS = [
  { value: 0, label: 'Nessuno' },
  { value: 2, label: 'Max 2' },
  { value: 5, label: 'Max 5' },
  { value: 10, label: 'Max 10' },
];

export default function CosaCucinoConPage() {
  const [mode, setMode] = useState('adult');
  const [ageMonths, setAgeMonths] = useState(9);
  const [hydrated, setHydrated] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [maxTime, setMaxTime] = useState(null);
  const [maxMissing, setMaxMissing] = useState(2);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('cosa-cucino-mode');
    const savedAge = localStorage.getItem('cosa-cucino-age');
    if (savedMode) setMode(savedMode);
    if (savedAge) setAgeMonths(parseInt(savedAge, 10));
    setHydrated(true);
  }, []);

function handleSearch(overrideTime, overrideMissing) {
    if (ingredients.length === 0) {
      setResults([]);
      return;
    }
    const useTime = overrideTime !== undefined ? overrideTime : maxTime;
    const useMissing = overrideMissing !== undefined ? overrideMissing : maxMissing;
    const found = searchRecipesByIngredients(
      RECIPES,
      ingredients,
      useMissing,
      useTime,
      mode,
      ageMonths,
      getCompatibilityLevel
    );
    setResults(found);
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
          <h1 className="text-base font-medium text-[#C65D3B]">🥕 Cosa cucino con...</h1>
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

        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredienti che hai
          </label>
          <IngredientChipsInput value={ingredients} onChange={setIngredients} />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tempo a disposizione
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setMaxTime(opt.value)}
                className={`py-2 rounded text-xs font-medium transition ${
                  maxTime === opt.value
                    ? 'bg-[#C65D3B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredienti mancanti accettabili
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {MISSING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMaxMissing(opt.value)}
                className={`py-2 rounded text-xs font-medium transition ${
                  maxMissing === opt.value
                    ? 'bg-[#C65D3B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Sale, olio, spezie sono sempre considerati disponibili.
          </p>
        </div>

        <button
          onClick={handleSearch}
          disabled={ingredients.length === 0}
          className="w-full py-3 bg-[#C65D3B] text-white rounded-lg font-medium hover:opacity-90 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          🔍 Cerca ricette
        </button>

        {results !== null && (
          <div className="mt-5">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {results.length === 0
                ? 'Nessuna ricetta trovata'
                : results.length === 1
                ? '1 ricetta trovata'
                : `${results.length} ricette trovate`}
            </p>

            {results.length === 0 && (
              <NoResultsHelper
                ingredients={ingredients}
                maxTime={maxTime}
                maxMissing={maxMissing}
                mode={mode}
                ageMonths={ageMonths}
                onApplyTime={(t) => { setMaxTime(t); handleSearch(t, undefined); }}
                onApplyMissing={(m) => { setMaxMissing(m); handleSearch(undefined, m); }}
              />
            )}

            <div className="flex flex-col gap-2.5">
              {results.map(({ recipe, missingIngredients, missingCount }) => (
                <div key={recipe.id}>
                  <RecipeCard recipe={recipe} mode={mode} ageMonths={ageMonths} />
                  {missingCount > 0 && (
                    <div className="text-xs text-gray-600 mt-1 px-1">
                      ⚠️ Ti mancano: <span className="font-medium">{missingIngredients.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );

  function NoResultsHelper({ ingredients, maxTime, maxMissing, mode, ageMonths, onApplyTime, onApplyMissing }) {
  const suggestions = [];

  if (maxTime !== null) {
    const widerTimes = [maxTime + 15, maxTime + 30, null];
    for (const t of widerTimes) {
      const r = searchRecipesByIngredients(RECIPES, ingredients, maxMissing, t, mode, ageMonths, getCompatibilityLevel);
      if (r.length > 0) {
        const label = t === null ? 'qualsiasi tempo' : `entro ${t} min`;
        suggestions.push({
          text: `${r.length} ${r.length === 1 ? 'ricetta' : 'ricette'} con ${label}`,
          action: () => onApplyTime(t),
        });
        break;
      }
    }
  }

  const widerMissingValues = [maxMissing + 3, maxMissing + 5, 99];
  for (const m of widerMissingValues) {
    if (m <= maxMissing) continue;
    const r = searchRecipesByIngredients(RECIPES, ingredients, m, maxTime, mode, ageMonths, getCompatibilityLevel);
    if (r.length > 0) {
      suggestions.push({
        text: `${r.length} ${r.length === 1 ? 'ricetta' : 'ricette'} con max ${m === 99 ? 'tanti' : m} ingredienti mancanti`,
        action: () => onApplyMissing(m === 99 ? 99 : m),
      });
      break;
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-center mb-3">
        <div className="text-3xl mb-1">😕</div>
        <p className="text-sm text-gray-700">Nessuna ricetta trovata con questi criteri.</p>
      </div>

      {suggestions.length > 0 && (
        <>
          <p className="text-xs text-gray-500 mb-2 text-center">Allarga i criteri:</p>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={s.action}
                className="w-full py-2 px-3 bg-[#FDF4F0] text-[#C65D3B] border border-[#C65D3B] rounded-md text-sm font-medium hover:bg-[#F8E8E0] transition text-left"
              >
                → {s.text}
              </button>
            ))}
          </div>
        </>
      )}

      {suggestions.length === 0 && (
        <p className="text-xs text-gray-500 text-center">
          Prova con ingredienti diversi o più generici.
        </p>
      )}
    </div>
  );
}
}