'use client';

import { useState, useRef } from 'react';
import { INGREDIENTS_CATALOG } from '@/data/ingredients_catalog';

function normalize(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function IngredientChipsInput({ value, onChange }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const inputNormalized = normalize(input.trim());
  const suggestions = inputNormalized.length >= 2
    ? INGREDIENTS_CATALOG
        .filter((ing) => {
          const ingNorm = normalize(ing.name);
          if (value.some((v) => normalize(v) === normalize(ing.name))) return false;
          return ingNorm.includes(inputNormalized);
        })
        .slice(0, 8)
    : [];

  function addIngredient(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (value.some((v) => normalize(v) === normalize(trimmed))) {
      setInput('');
      return;
    }
    onChange([...value, trimmed]);
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeIngredient(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        addIngredient(input.trim());
      }
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      removeIngredient(value.length - 1);
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-gray-200 rounded-lg min-h-[44px]">
        {value.map((ing, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 bg-[#FDF4F0] text-[#C65D3B] px-2 py-1 rounded text-sm border border-[#C65D3B]/20"
          >
            {ing}
            <button
              type="button"
              onClick={() => removeIngredient(idx)}
              className="text-[#C65D3B] hover:text-[#A04A2E] font-bold leading-none"
              aria-label={`Rimuovi ${ing}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? 'es. pomodori, pasta...' : ''}
          className="flex-1 min-w-[120px] outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-transparent"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((ing, idx) => (
            <button
              key={`${ing.normalized}-${idx}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addIngredient(ing.name);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#FDF4F0] text-sm flex justify-between items-center border-b border-gray-100 last:border-b-0"
            >
              <span className="text-gray-800">{ing.name}</span>
              <span className="text-xs text-gray-400">{ing.category}</span>
            </button>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Digita e seleziona dai suggerimenti, oppure premi Invio per aggiungere.
        </p>
      )}
    </div>
  );
}