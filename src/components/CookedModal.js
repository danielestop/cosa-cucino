'use client';

import { useState, useEffect } from 'react';

export default function CookedModal({ recipe, initialEntry, onSave, onCancel, onDelete }) {
  const isEdit = !!initialEntry;
  const [date, setDate] = useState(() => {
    if (initialEntry?.date) return initialEntry.date;
    return new Date().toISOString().slice(0, 10);
  });
  const [rating, setRating] = useState(initialEntry?.rating ?? 0);
  const [notes, setNotes] = useState(initialEntry?.notes ?? '');

  function handleSave() {
    if (!date) {
      alert('Seleziona una data');
      return;
    }
    onSave({
      recipe_id: recipe.id,
      recipe_title: recipe.title,
      recipe_image_url: recipe.image_url,
      recipe_image_color: recipe.image_color,
      recipe_emoji: recipe.emoji,
      date,
      rating: rating || null,
      notes: notes.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-medium text-[#C65D3B]">
            {isEdit ? '✏️ Modifica entry diario' : '📝 Segna come cucinata'}
          </h2>
          <p className="text-xs text-gray-500 mt-1 truncate">{recipe.title}</p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quando l'hai cucinata?</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-[#C65D3B]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Com'è venuta?</label>
            <div className="flex gap-1.5 items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(rating === s ? 0 : s)}
                  className="text-3xl leading-none transition hover:scale-110"
                  aria-label={`Rating ${s} stelle`}
                >
                  <span className={s <= rating ? 'text-yellow-500' : 'text-gray-300'}>
                    {s <= rating ? '★' : '☆'}
                  </span>
                </button>
              ))}
              {rating > 0 && (
                <button
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Cancella
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Note (facoltative)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Es. ridurre il sale, aggiungere più aglio..."
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#C65D3B] resize-none"
            />
            <p className="text-xs text-gray-400 mt-0.5">{notes.length}/300</p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Annulla
          </button>
          {isEdit && onDelete && (
            <button
              onClick={() => {
                if (confirm('Eliminare questa entry dal diario?')) {
                  onDelete(initialEntry.id);
                }
              }}
              className="px-3 py-2 bg-white text-red-500 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50"
              aria-label="Elimina"
            >
              🗑
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-[#6B8E4E] text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            {isEdit ? 'Salva' : '✓ Cucinata'}
          </button>
        </div>
      </div>
    </div>
  );
}
