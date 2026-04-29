'use client';

import { useState } from 'react';

const DIFFICULTIES = [
  { value: 'facile', label: 'Facile' },
  { value: 'media', label: 'Media' },
  { value: 'difficile', label: 'Difficile' },
];

const TIME_OPTIONS = [
  { value: null, label: 'Qualsiasi' },
  { value: 15, label: '≤15 min' },
  { value: 30, label: '≤30 min' },
  { value: 45, label: '≤45 min' },
  { value: 60, label: '≤60 min' },
  { value: 90, label: '≤90 min' },
];

const COOKING_METHODS = [
  { value: 'fornelli', label: 'Fornelli' },
  { value: 'forno', label: 'Forno' },
  { value: 'no_cottura', label: 'No cottura' },
  { value: 'bimby', label: 'Bimby' },
  { value: 'friggitrice', label: 'Friggitrice' },
  { value: 'misto', label: 'Misto' },
];

const DIET_FLAGS = [
  { value: 'vegetarian', label: 'Vegetariano' },
  { value: 'vegan', label: 'Vegano' },
  { value: 'gluten_free', label: 'Senza glutine' },
  { value: 'lactose_free', label: 'Senza lattosio' },
  { value: 'egg_free', label: 'Senza uova' },
];

export default function FiltersPanel({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  function setFilter(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function toggleArrayFilter(key, value) {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  function reset() {
    onChange({
      difficulty: null,
      maxTime: null,
      cookingMethods: [],
      dietFlags: [],
    });
  }

  const activeCount =
    (filters.difficulty ? 1 : 0) +
    (filters.maxTime ? 1 : 0) +
    (filters.cookingMethods?.length || 0) +
    (filters.dietFlags?.length || 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>🎛️ Filtri {activeCount > 0 && <span className="ml-1 text-[#C65D3B]">({activeCount} attivi)</span>}</span>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-600 mb-1.5">Difficoltà</div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setFilter('difficulty', null)}
                className={`py-1.5 rounded text-xs font-medium ${filters.difficulty === null ? 'bg-[#C65D3B] text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Tutte
              </button>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setFilter('difficulty', d.value)}
                  className={`py-1.5 rounded text-xs font-medium ${filters.difficulty === d.value ? 'bg-[#C65D3B] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs font-medium text-gray-600 mb-1.5">Tempo massimo</div>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setFilter('maxTime', t.value)}
                  className={`py-1.5 rounded text-xs font-medium ${filters.maxTime === t.value ? 'bg-[#C65D3B] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs font-medium text-gray-600 mb-1.5">Cottura</div>
            <div className="flex flex-wrap gap-1.5">
              {COOKING_METHODS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => toggleArrayFilter('cookingMethods', c.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${filters.cookingMethods?.includes(c.value) ? 'bg-[#C65D3B] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs font-medium text-gray-600 mb-1.5">Regime alimentare</div>
            <div className="flex flex-wrap gap-1.5">
              {DIET_FLAGS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => toggleArrayFilter('dietFlags', d.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${filters.dietFlags?.includes(d.value) ? 'bg-[#C65D3B] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {activeCount > 0 && (
            <button
              onClick={reset}
              className="mt-3 w-full py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
            >
              Reimposta filtri
            </button>
          )}
        </div>
      )}
    </div>
  );
}