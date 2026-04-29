'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RECIPES } from '@/data/recipes';
import { getCompatibilityLevel } from '@/lib/compatibility';

const TIME_OPTIONS = [
  { value: null, label: 'Qualsiasi' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
];

const CATEGORY_OPTIONS = [
  { value: null, label: 'Qualsiasi' },
  { value: 'antipasti', label: 'Antipasti' },
  { value: 'primi', label: 'Primi' },
  { value: 'secondi', label: 'Secondi' },
  { value: 'contorni', label: 'Contorni' },
  { value: 'lievitati', label: 'Lievitati' },
  { value: 'dessert', label: 'Dessert' },
];

export default function GiraLaRuotaPage() {
  const [mode, setMode] = useState('adult');
  const [ageMonths, setAgeMonths] = useState(9);
  const [hydrated, setHydrated] = useState(false);

  const [maxTime, setMaxTime] = useState(null);
  const [category, setCategory] = useState(null);

  const [spinning, setSpinning] = useState(false);
  const [pickedRecipe, setPickedRecipe] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('cosa-cucino-mode');
    const savedAge = localStorage.getItem('cosa-cucino-age');
    if (savedMode) setMode(savedMode);
    if (savedAge) setAgeMonths(parseInt(savedAge, 10));
    setHydrated(true);
  }, []);

  function getCandidates() {
    return RECIPES.filter((r) => {
      if (category && r.category !== category) return false;
      if (maxTime && r.total_time_min > maxTime) return false;
      if (mode === 'baby') {
        const compat = getCompatibilityLevel(r, ageMonths);
        if (compat.level === 'red') return false;
      }
      return true;
    });
  }

  function spin() {
    if (spinning) return;
    const candidates = getCandidates();
    if (candidates.length === 0) {
      setNoResults(true);
      setPickedRecipe(null);
      return;
    }
    setNoResults(false);
    setPickedRecipe(null);
    setSpinning(true);

    // Animazione: ciclo titoli random per ~2.5 secondi
    const ANIMATION_MS = 2500;
    const INTERVAL_MS = 80;
    const steps = Math.floor(ANIMATION_MS / INTERVAL_MS);

    let count = 0;
    const id = setInterval(() => {
      const random = candidates[Math.floor(Math.random() * candidates.length)];
      setPreviewTitle(random.title);
      count++;
      if (count >= steps) {
        clearInterval(id);
        const final = candidates[Math.floor(Math.random() * candidates.length)];
        setPreviewTitle(final.title);
        setPickedRecipe(final);
        setSpinning(false);
      }
    }, INTERVAL_MS);
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

  const candidatesCount = getCandidates().length;

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
          <h1 className="text-base font-medium text-[#C65D3B]">🎡 Gira la ruota</h1>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setCategory(opt.value)}
                disabled={spinning}
                className={`py-2 rounded text-xs font-medium transition ${
                  category === opt.value
                    ? 'bg-[#C65D3B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tempo massimo</label>
          <div className="grid grid-cols-3 gap-1.5">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setMaxTime(opt.value)}
                disabled={spinning}
                className={`py-2 rounded text-xs font-medium transition ${
                  maxTime === opt.value
                    ? 'bg-[#C65D3B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-gray-500 mb-3">
          {candidatesCount === 0
            ? '⚠️ Nessuna ricetta corrisponde a questi criteri'
            : candidatesCount === 1
            ? '1 ricetta disponibile'
            : `${candidatesCount} ricette disponibili`}
        </p>

        <button
          onClick={spin}
          disabled={spinning || candidatesCount === 0}
          className="w-full py-4 bg-[#C65D3B] text-white rounded-lg font-medium text-base hover:opacity-90 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {spinning ? '🎡 Sto girando...' : '🎡 Gira!'}
        </button>

        {(spinning || pickedRecipe) && (
          <div className="mt-5 bg-white border-2 border-[#C65D3B] rounded-lg p-4 text-center min-h-[120px] flex flex-col items-center justify-center">
            <div className="text-xs text-gray-500 mb-2">
              {spinning ? 'La ruota sta girando...' : '🎉 Ecco la tua ricetta!'}
            </div>
            <div
              className={`text-lg font-medium text-gray-900 transition-all duration-100 ${
                spinning ? 'opacity-70 blur-[1px]' : 'opacity-100'
              }`}
            >
              {previewTitle}
            </div>
            {pickedRecipe && !spinning && (
              <div className="mt-3 flex flex-col gap-2 w-full">
                <Link
                  href={`/recipe/${pickedRecipe.id}/`}
                  className="block w-full py-2.5 bg-[#6B8E4E] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                  Vai alla ricetta →
                </Link>
                <button
                  onClick={spin}
                  className="w-full py-2 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition"
                >
                  🎡 Gira ancora
                </button>
              </div>
            )}
          </div>
        )}

        {noResults && !spinning && (
          <div className="mt-5 bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-3xl mb-2">😕</div>
            <p className="text-sm text-gray-700">
              Nessuna ricetta con questi criteri. Allarga il tempo o cambia categoria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}