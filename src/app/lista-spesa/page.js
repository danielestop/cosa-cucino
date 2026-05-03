'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlanner } from '@/lib/usePlanner';
import { usePantry } from '@/lib/usePantry';
import { generateShoppingList } from '@/lib/useShoppingList';

const CATEGORY_LABELS = {
  verdure: '🥦 Verdure',
  frutta: '🍎 Frutta',
  carne: '🥩 Carne',
  pesce: '🐟 Pesce',
  uova: '🥚 Uova',
  latticini: '🧀 Latticini',
  cereali: '🌾 Cereali',
  pasta: '🍝 Pasta',
  riso: '🍚 Riso',
  legumi: '🫘 Legumi',
  lievitati: '🍞 Lievitati',
  dolcificanti: '🍯 Dolcificanti',
  frutta_secca: '🥜 Frutta secca',
  spezie: '🌿 Spezie',
  condimenti: '🫙 Condimenti',
  bevande: '🥛 Bevande',
  altro: '📦 Altro',
};

export default function ListaSpesaPage() {
  const { plan, hydrated } = usePlanner();
  const { items: pantryItems } = usePantry();
  const [checked, setChecked] = useState({});

  const shoppingList = generateShoppingList(plan, pantryItems);
  const categories = Object.keys(shoppingList);
  const totalItems = categories.reduce((a, cat) => a + shoppingList[cat].length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  function toggleItem(key) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function exportAsText() {
    const lines = ['🛒 Lista della spesa\n'];
    categories.forEach((cat) => {
      const label = CATEGORY_LABELS[cat] || cat;
      lines.push(`\n${label}`);
      shoppingList[cat].forEach((item) => {
        const tick = checked[`${cat}-${item.name}`] ? '✓' : '•';
        lines.push(`  ${tick} ${item.name}${item.amount !== 'q.b.' ? ` — ${item.amount}` : ''}`);
      });
    });
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert('Lista copiata negli appunti!');
    }).catch(() => {
      alert(text);
    });
  }

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
            href="/pianificatore/"
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-[#C65D3B] hover:text-white hover:border-[#C65D3B] transition shadow-sm"
            aria-label="Torna al pianificatore"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
          <h1 className="text-base font-medium text-[#C65D3B]">🛒 Lista della spesa</h1>
        </div>

        {totalItems === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-4xl mb-2">🛒</div>
            <p className="text-sm text-gray-700 mb-1">Lista vuota</p>
            <p className="text-xs text-gray-500">Aggiungi ricette al pianificatore per generare la lista.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">
                {checkedCount}/{totalItems} ingredienti
                {pantryItems.length > 0 && ` · ${pantryItems.length} in dispensa esclusi`}
              </p>
              <button
                onClick={exportAsText}
                className="text-xs text-[#C65D3B] hover:underline"
              >
                📋 Copia testo
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-600">
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {shoppingList[cat].map((item) => {
                      const key = `${cat}-${item.name}`;
                      const isChecked = !!checked[key];
                      return (
                        <button
                          key={key}
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isChecked ? 'bg-[#6B8E4E] border-[#6B8E4E]' : 'border-gray-300'}`}>
                            {isChecked && <span className="text-white text-xs">✓</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {item.name}
                            </span>
                          </div>
                          {item.amount && item.amount !== 'q.b.' && (
                            <span className={`text-xs flex-shrink-0 ${isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.amount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {checkedCount > 0 && (
              <button
                onClick={() => setChecked({})}
                className="mt-4 w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Deseleziona tutto
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
