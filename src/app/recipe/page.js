'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { RECIPES } from '@/data/recipes';
import { useCustomRecipes } from '@/lib/useCustomRecipes';
import { useFavorites } from '@/lib/useFavorites';
import { getCompatibilityLevel } from '@/lib/compatibility';
import { scaleIngredient, formatIngredient } from '@/lib/scaling';
import CompatibilityBadge from '@/components/CompatibilityBadge';
import RecipeForm from '@/components/RecipeForm';
import { useDiary } from '@/lib/useDiary';
import CookedModal from '@/components/CookedModal';


function RecipePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [mode, setMode] = useState('adult');
  const [ageMonths, setAgeMonths] = useState(9);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState(false);
  const { addEntry, getEntriesForRecipe } = useDiary();
  const [showCookedModal, setShowCookedModal] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { recipes: customRecipes, updateRecipe, deleteRecipe, hydrated: customHydrated } = useCustomRecipes();
  const isFav = id ? isFavorite(id) : false;

  const customRecipe = customRecipes.find((r) => r.id === id);
  const staticRecipe = RECIPES.find((r) => r.id === id);
  const recipe = customRecipe || staticRecipe;

  const [servings, setServings] = useState(recipe?.servings ?? 4);

  useEffect(() => {
    const savedMode = localStorage.getItem('cosa-cucino-mode');
    const savedAge = localStorage.getItem('cosa-cucino-age');
    if (savedMode) setMode(savedMode);
    if (savedAge) setAgeMonths(parseInt(savedAge, 10));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (recipe) setServings(recipe.servings);
  }, [recipe?.id]);

  function handleSaveEdit(updated) {
    updateRecipe(id, updated);
    setEditing(false);
  }

  function handleDelete() {
    if (confirm(`Eliminare la ricetta "${recipe.title}"? Non si può annullare.`)) {
      deleteRecipe(id);
      router.push('/le-mie-ricette/');
    }
  }

  if (!id) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] p-4">
        <div className="max-w-md mx-auto">
          <p className="text-gray-700">Nessuna ricetta selezionata.</p>
          <Link href="/" className="text-[#C65D3B] underline">← Torna alla home</Link>
        </div>
      </main>
    );
  }

  if (!recipe && customHydrated) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] p-4">
        <div className="max-w-md mx-auto">
          <p className="text-gray-700">Ricetta non trovata.</p>
          <Link href="/" className="text-[#C65D3B] underline">← Torna alla home</Link>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] p-4">
        <div className="max-w-md mx-auto">
          <div className="text-gray-500 text-sm">Caricamento...</div>
        </div>
      </main>
    );
  }

  if (editing) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] p-4 pb-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-base font-medium text-[#C65D3B] mb-3">Modifica ricetta</h1>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <RecipeForm initialRecipe={recipe} onSave={handleSaveEdit} onCancel={() => setEditing(false)} />
          </div>
        </div>
      </main>
    );
  }

  const compat = mode === 'baby' && !recipe.is_custom ? getCompatibilityLevel(recipe, ageMonths) : null;
  const scaledIngredients = recipe.ingredients.map((ing) =>
    scaleIngredient(ing, recipe.servings, servings)
  );

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-8">
      <div className="max-w-md mx-auto">
        <div
          className="h-48 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: recipe.image_color }}
        >
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">{recipe.emoji}</span>
          )}
          <Link
            href={recipe.is_custom ? '/le-mie-ricette/' : `/category/${recipe.category}/`}
            className="absolute left-3 top-3 w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-800 hover:bg-[#C65D3B] hover:text-white transition shadow-md z-10"
            aria-label="Torna indietro"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-medium text-gray-900">{recipe.title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {recipe.is_custom ? '✏️ Mia ricetta' : `da ${recipe.source_site}`}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(id)}
              className={`text-2xl leading-none transition ${isFav ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
              aria-label={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            >
              {isFav ? '★' : '☆'}
            </button>
          </div>

          {recipe.description && <p className="text-sm text-gray-600 mt-2">{recipe.description}</p>}

          {hydrated && compat && <CompatibilityBadge level={compat.level} note={compat.note} />}

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-white p-2 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500">Tempo totale</div>
              <div className="text-sm font-medium text-gray-800">⏱ {recipe.total_time_min} min</div>
            </div>
            <div className="bg-white p-2 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500">Difficoltà</div>
              <div className="text-sm font-medium text-gray-800">● {recipe.difficulty}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 mt-3 bg-white px-3 py-2 rounded-md border border-gray-200">
            <span className="text-sm text-gray-600">Porzioni:</span>
            <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-7 h-7 border border-gray-300 bg-[#FAF7F2] rounded-md text-gray-700 hover:bg-gray-100">−</button>
            <span className="text-base font-medium min-w-[20px] text-center text-gray-900">{servings}</span>
            <button onClick={() => setServings(Math.min(20, servings + 1))} className="w-7 h-7 border border-gray-300 bg-[#FAF7F2] rounded-md text-gray-700 hover:bg-gray-100">+</button>
            {servings !== recipe.servings && (
              <span className="text-xs text-gray-500 ml-auto">(orig. {recipe.servings})</span>
            )}
          </div>

          <h2 className="text-sm font-medium text-gray-600 mt-4 mb-2">Ingredienti</h2>
          <ul className="bg-white rounded-md border border-gray-200 p-3 text-sm text-gray-800 space-y-1.5">
            {scaledIngredients.map((ing, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#C65D3B] mt-0.5">•</span>
                <span>{formatIngredient(ing)}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-sm font-medium text-gray-600 mt-4 mb-2">Procedimento</h2>
          <ol className="bg-white rounded-md border border-gray-200 p-3 text-sm text-gray-800 space-y-3">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="font-medium text-[#C65D3B] flex-shrink-0">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {recipe.source_url ? (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full block py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0] transition text-center"
            >
              🔗 Vedi ricetta originale {recipe.source_site && !recipe.is_custom ? `su ${recipe.source_site}` : ''}
            </a>
          ) : null}

          {recipe.is_custom && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 py-2.5 bg-white text-[#C65D3B] border border-[#C65D3B] rounded-lg text-sm font-medium hover:bg-[#FDF4F0]"
              >
                ✏️ Modifica
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-white text-red-500 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                🗑 Elimina
              </button>
            </div>
          )}

          <button
            onClick={() => setShowCookedModal(true)}
            className="mt-2 w-full py-2.5 bg-[#6B8E4E] text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            ✓ Cucinata oggi
          </button>

          {(() => {
            const cookedTimes = getEntriesForRecipe(id).length;
            if (cookedTimes > 0) {
              return (
                <Link
                  href="/diario/"
                  className="block mt-2 text-center text-xs text-[#6B8E4E] hover:underline"
                >
                  ✓ Hai cucinato questa ricetta {cookedTimes} {cookedTimes === 1 ? 'volta' : 'volte'} →
                </Link>
              );
            }
            return null;
          })()}
          {showCookedModal && (
          <CookedModal
            recipe={recipe}
            onSave={(entry) => {
              addEntry(entry);
              setShowCookedModal(false);
            }}
            onCancel={() => setShowCookedModal(false)}
          />
        )}
        </div>
      </div>
    </main>
  );
}

export default function RecipePageWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FAF7F2] p-4">
        <div className="max-w-md mx-auto">
          <div className="text-gray-500 text-sm">Caricamento...</div>
        </div>
      </main>
    }>
      <RecipePage />
    </Suspense>
  );
}