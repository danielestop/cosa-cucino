'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlanner, DAYS, MEALS } from '@/lib/usePlanner';
import { RECIPES } from '@/data/recipes';
import { useCustomRecipes } from '@/lib/useCustomRecipes';
import { generateShoppingList } from '@/lib/useShoppingList';
import { usePantry } from '@/lib/usePantry';

function RecipePickerModal({ onSelect, onCancel, allRecipes }) {
  const [query, setQuery] = useState('');
  const [servings, setServings] = useState(4);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  function normalize(text) {
    if (!text) return '';
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  const filtered = query.length >= 2
    ? allRecipes.filter((r) => normalize(r.title).includes(normalize(query))).slice(0, 20)
    : allRecipes.slice(0, 20);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={onCancel}>
      <div
        className="bg-white rounded-t-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca ricetta..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#C65D3B]"
            autoFocus
          />
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 px-2">✕</button>
        </div>

        {selectedRecipe ? (
          <div className="p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">{selectedRecipe.title}</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Porzioni:</span>
              <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-7 h-7 border border-gray-300 rounded text-gray-700">−</button>
              <span className="text-sm font-medium w-6 text-center">{servings}</span>
              <button onClick={() => setServings(Math.min(20, servings + 1))} className="w-7 h-7 border border-gray-300 rounded text-gray-700">+</button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedRecipe(null)} className="flex-1 py-2 border border-gray-300 rounded text-sm">Indietro</button>
              <button onClick={() => onSelect(selectedRecipe, servings)} className="flex-1 py-2 bg-[#C65D3B] text-white rounded text-sm font-medium">Aggiungi</button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedRecipe(r); setServings(r.servings || 4); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 text-left"
              >
                <div
                  className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: r.image_color }}
                >
                  {r.image_url
                    ? <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                    : <span className="text-lg">{r.emoji}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.total_time_min} min · {r.difficulty}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PianificatorePage() {
  const {
    plan, history, hydrated,
    addRecipeToSlot, removeRecipeFromSlot, updateServings,
    archiveAndReset, clearSlot, totalRecipes,
  } = usePlanner();

  const { recipes: customRecipes } = useCustomRecipes();
  const { items: pantryItems } = usePantry();
  const allRecipes = [...customRecipes, ...RECIPES];

  const [pickerState, setPickerState] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const shoppingList = generateShoppingList(plan, pantryItems);
  const shoppingCount = Object.values(shoppingList).reduce((a, items) => a + items.length, 0);

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] p-4">
        <div className="max-w-md mx-auto text-gray-500 text-sm">Caricamento...</div>
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
          <h1 className="text-base font-medium text-[#C65D3B]">📅 Pianificatore</h1>
        </div>

        <div className="flex gap-2 mb-4">
          {shoppingCount > 0 && (
            <Link
              href="/lista-spesa/"
              className="flex-1 py-2.5 bg-[#6B8E4E] text-white rounded-lg text-sm font-medium text-center hover:opacity-90"
            >
              🛒 Lista spesa ({shoppingCount})
            </Link>
          )}
          {totalRecipes > 0 && (
            <button
              onClick={() => {
                if (confirm('Archiviare questa settimana e ricominciare da capo?')) {
                  archiveAndReset();
                }
              }}
              className="flex-1 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              🗄 Nuova settimana
            </button>
          )}
        </div>

        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">{day}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {MEALS.map((meal) => {
                  const slots = plan[day][meal];
                  return (
                    <div key={meal} className="px-3 py-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-500">{meal}</span>
                        <button
                          onClick={() => setPickerState({ day, meal })}
                          className="text-xs text-[#C65D3B] hover:underline"
                        >
                          + Aggiungi
                        </button>
                      </div>
                      {slots.length === 0 ? (
                        <div className="text-xs text-gray-400 py-1">Nessuna ricetta</div>
                      ) : (
                        <div className="space-y-1.5">
                          {slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded p-1.5">
                              <div
                                className="w-8 h-8 flex items-center justify-center flex-shrink-0 overflow-hidden rounded"
                                style={{ backgroundColor: slot.recipe_image_color }}
                              >
                                {slot.recipe_image_url
                                  ? <img src={slot.recipe_image_url} alt={slot.recipe_title} className="w-full h-full object-cover" />
                                  : <span className="text-sm">{slot.recipe_emoji}</span>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/recipe/?id=${slot.recipe_id}`}
                                  className="text-xs font-medium text-gray-800 truncate block hover:text-[#C65D3B]"
                                >
                                  {slot.recipe_title}
                                </Link>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <button onClick={() => updateServings(day, meal, idx, Math.max(1, slot.servings - 1))} className="w-4 h-4 text-xs text-gray-500 hover:text-gray-700">−</button>
                                  <span className="text-xs text-gray-600">{slot.servings} pers.</span>
                                  <button onClick={() => updateServings(day, meal, idx, Math.min(20, slot.servings + 1))} className="w-4 h-4 text-xs text-gray-500 hover:text-gray-700">+</button>
                                </div>
                              </div>
                              <button
                                onClick={() => removeRecipeFromSlot(day, meal, idx)}
                                className="text-gray-400 hover:text-red-500 text-xs px-1"
                                aria-label="Rimuovi"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {showHistory ? 'Nascondi storico' : `Vedi settimane archiviate (${history.length})`}
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2">
                {history.map((item, idx) => {
                  const total = Object.values(item.plan).reduce(
                    (acc, day) => acc + Object.values(day).reduce((a, slot) => a + slot.length, 0), 0
                  );
                  const date = new Date(item.archived_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
                  return (
                    <div key={idx} className="bg-white border border-gray-200 rounded p-2.5 text-xs text-gray-600">
                      📅 Settimana archiviata il {date} · {total} ricette
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {pickerState && (
        <RecipePickerModal
          allRecipes={allRecipes}
          onSelect={(recipe, servings) => {
            addRecipeToSlot(pickerState.day, pickerState.meal, recipe, servings);
            setPickerState(null);
          }}
          onCancel={() => setPickerState(null)}
        />
      )}
    </main>
  );
}
