'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { RECIPES } from '@/data/recipes';
import { useCustomRecipes } from '@/lib/useCustomRecipes';
import { useTimers, parseTimersFromStep, formatTime } from '@/lib/useTimers';
import TimerBar from '@/components/TimerBar';

function CucinaContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { recipes: customRecipes } = useCustomRecipes();
  const allRecipes = [...customRecipes, ...RECIPES];
  const recipe = allRecipes.find((r) => r.id === id);
  const { timers, addTimer, toggleTimer, resetTimer, removeTimer } = useTimers();
  const [currentStep, setCurrentStep] = useState(0);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    async function acquireWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (e) {
        console.warn('Wake Lock non disponibile:', e);
      }
    }
    acquireWakeLock();
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  if (!recipe) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Ricetta non trovata.</p>
          <Link href="/" className="text-[#C65D3B] underline mt-2 block">← Home</Link>
        </div>
      </main>
    );
  }

  const steps = recipe.steps || [];
  const step = steps[currentStep];
  const timerInfo = step ? parseTimersFromStep(step) : [];
  const hasTimers = timers.length > 0;

  return (
    <main className={`min-h-screen bg-gray-900 text-white flex flex-col ${hasTimers ? 'pb-32' : 'pb-8'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <Link
          href={`/recipe/?id=${id}`}
          className="text-gray-400 hover:text-white text-sm"
        >
          ← Ricetta
        </Link>
        <span className="text-sm text-gray-400">
          {currentStep + 1} / {steps.length}
        </span>
        <span className="text-xs text-[#C65D3B]">🍳 Modalità cucina</span>
      </div>

      <div className="px-4 pt-2 pb-1">
        <p className="text-sm text-gray-400 truncate">{recipe.title}</p>
      </div>

      <div className="flex-1 px-4 pt-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
          Passo {currentStep + 1}
        </div>
        <p className="text-2xl leading-relaxed text-white font-light">
          {step}
        </p>

        {timerInfo.length > 0 && (
          <div className="mt-6 space-y-2">
            {timerInfo.map((t, idx) => (
              <button
                key={idx}
                onClick={() => addTimer(t.minutes, t.label, currentStep)}
                className="flex items-center gap-3 bg-[#C65D3B] text-white px-4 py-3 rounded-lg hover:opacity-90 transition"
              >
                <span className="text-xl">⏱</span>
                <span className="text-base font-medium">Avvia timer {t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-6">
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex-1 py-4 bg-gray-700 text-white rounded-xl text-lg font-medium disabled:opacity-30 hover:bg-gray-600 transition"
          >
            ← Indietro
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="flex-1 py-4 bg-[#C65D3B] text-white rounded-xl text-lg font-medium disabled:opacity-30 hover:opacity-90 transition"
          >
            Avanti →
          </button>
        </div>

        <div className="flex gap-1.5 mt-4 justify-center">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'bg-[#C65D3B] w-6' : 'bg-gray-600 w-1.5'
              }`}
              aria-label={`Passo ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <TimerBar
        timers={timers}
        onToggle={toggleTimer}
        onReset={resetTimer}
        onRemove={removeTimer}
      />
    </main>
  );
}

export default function CucinaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Caricamento...</div>
      </main>
    }>
      <CucinaContent />
    </Suspense>
  );
}
