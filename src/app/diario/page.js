'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDiary } from '@/lib/useDiary';
import { RECIPES } from '@/data/recipes';
import { useCustomRecipes } from '@/lib/useCustomRecipes';
import CookedModal from '@/components/CookedModal';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'oggi';
  if (diffDays === 1) return 'ieri';
  if (diffDays < 7) return `${diffDays} giorni fa`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi fa`;
  return `${Math.floor(diffDays / 365)} anni fa`;
}

export default function DiarioPage() {
  const { entries, updateEntry, deleteEntry, hydrated } = useDiary();
  const { recipes: customRecipes } = useCustomRecipes();
  const allRecipes = [...customRecipes, ...RECIPES];
  const [editingEntry, setEditingEntry] = useState(null);

  const stats = useMemo(() => {
    if (entries.length === 0) return null;

    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = entries.filter((e) => new Date(e.date) >= oneWeekAgo).length;
    const thisMonth = entries.filter((e) => new Date(e.date) >= oneMonthAgo).length;

    const ratingsArr = entries.filter((e) => e.rating).map((e) => e.rating);
    const avgRating = ratingsArr.length > 0
      ? (ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length).toFixed(1)
      : null;

    const recipeCounts = {};
    entries.forEach((e) => {
      recipeCounts[e.recipe_id] = (recipeCounts[e.recipe_id] || 0) + 1;
    });
    const top = Object.entries(recipeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([recipe_id, count]) => {
        const lastEntry = entries.find((e) => e.recipe_id === recipe_id);
        return {
          recipe_id,
          count,
          title: lastEntry?.recipe_title || 'Ricetta cancellata',
          image_url: lastEntry?.recipe_image_url,
          image_color: lastEntry?.recipe_image_color || '#F5C4B3',
          emoji: lastEntry?.recipe_emoji || '🍽️',
          recipe_exists: allRecipes.some((r) => r.id === recipe_id),
        };
      });

    return {
      total: entries.length,
      thisWeek,
      thisMonth,
      avgRating,
      top,
    };
  }, [entries, allRecipes]);

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
          <h1 className="text-base font-medium text-[#C65D3B]">📊 Diario di cucina</h1>
        </div>

        {!hydrated ? (
          <p className="text-gray-500 text-sm">Caricamento...</p>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-2">📖</div>
            <p className="text-sm text-gray-700 mb-1">Diario vuoto</p>
            <p className="text-xs text-gray-500">Quando cucini una ricetta, segnala con il bottone "✓ Cucinata oggi" sulla pagina dettaglio.</p>
          </div>
        ) : (
          <>
            {stats && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                <h2 className="text-sm font-medium text-gray-700 mb-2">📊 Statistiche</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-[#FAF7F2] p-2 rounded">
                    <div className="text-xs text-gray-500">Totale cucinate</div>
                    <div className="text-base font-semibold text-gray-800">{stats.total}</div>
                  </div>
                  <div className="bg-[#FAF7F2] p-2 rounded">
                    <div className="text-xs text-gray-500">Questa settimana</div>
                    <div className="text-base font-semibold text-gray-800">{stats.thisWeek}</div>
                  </div>
                  <div className="bg-[#FAF7F2] p-2 rounded">
                    <div className="text-xs text-gray-500">Questo mese</div>
                    <div className="text-base font-semibold text-gray-800">{stats.thisMonth}</div>
                  </div>
                  <div className="bg-[#FAF7F2] p-2 rounded">
                    <div className="text-xs text-gray-500">Media voto</div>
                    <div className="text-base font-semibold text-gray-800">
                      {stats.avgRating ? `${stats.avgRating} ★` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stats?.top && stats.top.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                <h2 className="text-sm font-medium text-gray-700 mb-2">🏆 Le tue più cucinate</h2>
                <div className="space-y-2">
                  {stats.top.map((item, idx) => {
                    const content = (
                      <div className="flex items-center gap-2.5 py-1.5">
                        <span className="text-xs font-medium text-gray-400 w-5">{idx + 1}.</span>
                        <div
                          className="w-10 h-10 flex items-center justify-center flex-shrink-0 overflow-hidden rounded"
                          style={{ backgroundColor: item.image_color }}
                        >
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{item.emoji}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-800 truncate">{item.title}</div>
                          <div className="text-xs text-gray-500">
                            {item.count}× cucinata
                          </div>
                        </div>
                      </div>
                    );
                    return item.recipe_exists ? (
                      <Link key={item.recipe_id} href={`/recipe/?id=${item.recipe_id}`} className="block hover:bg-gray-50 rounded">
                        {content}
                      </Link>
                    ) : (
                      <div key={item.recipe_id} className="opacity-60">{content}</div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h2 className="text-sm font-medium text-gray-700 mb-2">📅 Cronologia</h2>
              <div className="space-y-2">
                {entries.map((entry) => {
                  const recipeExists = allRecipes.some((r) => r.id === entry.recipe_id);
                  return (
                    <div key={entry.id} className="bg-gray-50 rounded p-2.5">
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden rounded"
                          style={{ backgroundColor: entry.recipe_image_color }}
                        >
                          {entry.recipe_image_url ? (
                            <img src={entry.recipe_image_url} alt={entry.recipe_title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{entry.recipe_emoji}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {recipeExists ? (
                            <Link href={`/recipe/?id=${entry.recipe_id}`} className="text-sm font-medium text-gray-800 hover:text-[#C65D3B] truncate block">
                              {entry.recipe_title}
                            </Link>
                          ) : (
                            <div className="text-sm font-medium text-gray-500 truncate">{entry.recipe_title} (cancellata)</div>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">{relativeTime(entry.date)}</span>
                          </div>
                          {entry.rating > 0 && (
                            <div className="text-sm text-yellow-500 mt-0.5">
                              {'★'.repeat(entry.rating)}<span className="text-gray-300">{'★'.repeat(5 - entry.rating)}</span>
                            </div>
                          )}
                          {entry.notes && (
                            <p className="text-xs text-gray-600 mt-1 italic">{entry.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="text-xs text-gray-400 hover:text-[#C65D3B]"
                          aria-label="Modifica"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {editingEntry && (
          <CookedModal
            recipe={{
              id: editingEntry.recipe_id,
              title: editingEntry.recipe_title,
              image_url: editingEntry.recipe_image_url,
              image_color: editingEntry.recipe_image_color,
              emoji: editingEntry.recipe_emoji,
            }}
            initialEntry={editingEntry}
            onSave={(updates) => {
              updateEntry(editingEntry.id, updates);
              setEditingEntry(null);
            }}
            onCancel={() => setEditingEntry(null)}
            onDelete={(id) => {
              deleteEntry(id);
              setEditingEntry(null);
            }}
          />
        )}
      </div>
    </main>
  );
}
