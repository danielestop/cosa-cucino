'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCustomRecipes } from '@/lib/useCustomRecipes';
import RecipeForm from '@/components/RecipeForm';

export default function LeMieRicettePage() {
  const { recipes, addRecipe, deleteRecipe, hydrated } = useCustomRecipes();
  const [showForm, setShowForm] = useState(false);

  function handleSave(recipe) {
    addRecipe(recipe);
    setShowForm(false);
  }

  function handleDelete(id, title) {
    if (confirm(`Eliminare la ricetta "${title}"? Non si può annullare.`)) {
      deleteRecipe(id);
    }
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
          <h1 className="text-base font-medium text-[#C65D3B]">✏️ Le mie ricette</h1>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 bg-[#C65D3B] text-white rounded-lg font-medium mb-4 hover:opacity-90"
          >
            + Aggiungi nuova ricetta
          </button>
        )}

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Nuova ricetta</h2>
            <RecipeForm onSave={handleSave} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {!hydrated ? (
          <p className="text-gray-500 text-sm">Caricamento...</p>
        ) : recipes.length === 0 && !showForm ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-2">✏️</div>
            <p className="text-sm text-gray-700 mb-1">Nessuna ricetta personale</p>
            <p className="text-xs text-gray-500">Aggiungi la prima per vederla qui.</p>
          </div>
        ) : recipes.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {recipes.length === 1 ? '1 ricetta personale' : `${recipes.length} ricette personali`}
            </p>
            <div className="flex flex-col gap-2.5">
              {recipes.map((r) => (
                <div key={r.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Link href={`/recipe/${r.id}/`} className="block hover:bg-gray-50">
                    <div className="flex">
                      <div
                        className="w-[90px] h-[90px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: r.image_color }}
                      >
                        {r.image_url ? (
                          <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">{r.emoji}</span>
                        )}
                      </div>
                      <div className="py-2.5 px-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{r.title}</div>
                        <div className="text-xs text-[#C65D3B] mt-0.5">✏️ Mia ricetta</div>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">⏱ {r.total_time_min} min</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">● {r.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="border-t border-gray-100 px-3 py-1.5 flex justify-end">
                    <button
                      onClick={() => handleDelete(r.id, r.title)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      🗑 Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
