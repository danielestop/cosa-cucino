'use client';

import Link from 'next/link';
import { usePantry, PANTRY_BASE_SET } from '@/lib/usePantry';
import IngredientChipsInput from '@/components/IngredientChipsInput';

export default function DispensaPage() {
  const { items, addItem, removeItem, addBaseSet, clear, hydrated } = usePantry();

  function handleChange(newItems) {
    // Trova differenza tra newItems e items per add/remove
    const added = newItems.filter((n) => !items.includes(n));
    const removed = items.filter((i) => !newItems.includes(i));
    added.forEach(addItem);
    removed.forEach(removeItem);
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
          <h1 className="text-base font-medium text-[#C65D3B]">🥫 Dispensa</h1>
        </div>

        <div className="bg-[#FFF8E7] border border-[#E5C870] rounded-lg p-3 mb-3 text-xs text-[#854F0B]">
          💡 La dispensa contiene gli ingredienti che hai sempre in casa.
          Quando cerchi ricette con "Cosa cucino con...", questi ingredienti vengono dati per scontati e non compaiono come "ti mancano".
        </div>

        {!hydrated ? (
          <p className="text-gray-500 text-sm">Caricamento...</p>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I miei ingredienti ({items.length})
              </label>
              <IngredientChipsInput value={items} onChange={handleChange} />
            </div>

            {items.length === 0 && (
              <button
                onClick={addBaseSet}
                className="w-full py-3 bg-[#6B8E4E] text-white rounded-lg font-medium mb-3 hover:opacity-90"
              >
                + Aggiungi staple di base ({PANTRY_BASE_SET.length} ingredienti)
              </button>
            )}

            {items.length > 0 && (
              <>
                <button
                  onClick={addBaseSet}
                  className="w-full py-2 bg-white text-[#6B8E4E] border border-[#6B8E4E] rounded-lg text-sm font-medium hover:bg-[#EDF4E7] mb-2"
                >
                  + Aggiungi staple di base mancanti
                </button>
                <button
                  onClick={() => {
                    if (confirm('Svuotare completamente la dispensa?')) clear();
                  }}
                  className="w-full py-2 bg-white text-red-500 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50"
                >
                  🗑 Svuota dispensa
                </button>
              </>
            )}

            <details className="mt-4 bg-white border border-gray-200 rounded-lg p-3">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                ❓ Come funziona la dispensa
              </summary>
              <div className="text-xs text-gray-600 mt-2 space-y-2">
                <p>
                  La dispensa contiene gli ingredienti che <strong>hai sempre in casa</strong>: sale, olio, farina, uova, ecc.
                </p>
                <p>
                  Quando usi <strong>"Cosa cucino con..."</strong> e cerchi ricette, gli ingredienti in dispensa vengono dati per scontati: non vengono contati come "mancanti".
                </p>
                <p>
                  Esempio: se hai in dispensa olio e farina, e cerchi una ricetta che richiede "pasta + pomodorini", l'app non ti dirà "ti manca: olio, farina" — perché ce li hai già.
                </p>
                <p>
                  In futuro la dispensa sarà usata anche per la lista della spesa: gli ingredienti in dispensa non verranno aggiunti.
                </p>
              </div>
            </details>
          </>
        )}
      </div>
    </main>
  );
}
