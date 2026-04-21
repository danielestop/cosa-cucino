'use client';

import { useState, useEffect } from 'react';
import ModeToggle from '@/components/ModeToggle';
import AgeSlider from '@/components/AgeSlider';
import CategoryGrid from '@/components/CategoryGrid';

export default function Home() {
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

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('cosa-cucino-mode', mode);
      localStorage.setItem('cosa-cucino-age', String(ageMonths));
    }
  }, [mode, ageMonths, hydrated]);

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

        <input
          type="text"
          placeholder="🔍 Cerca ricetta o ingrediente..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm mb-4 focus:outline-none focus:border-[#C65D3B]"
        />

        <CategoryGrid mode={mode} ageMonths={ageMonths} />

        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2.5 bg-[#C65D3B] text-white rounded-lg text-sm font-medium hover:opacity-90 transition">
            🎡 Gira la ruota
          </button>
          <button className="flex-1 py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition">
            ⭐ Preferiti
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 pb-4">
          🚧 v0.2 MVP — vertical slice in sviluppo
        </p>
      </div>
    </main>
  );
}