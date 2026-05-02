'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomRecipes } from '@/lib/useCustomRecipes';
import { parseQuantityRaw } from '@/lib/parseQuantity';

const API_URL = 'https://cosa-cucino-api.vercel.app/api/extract';

const SUPPORTED_SITES = [
  { name: 'Giallo Zafferano', host: 'ricette.giallozafferano.it' },
  { name: 'Uppa', host: 'www.uppa.it' },
];

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const hMatch = timeStr.match(/(\d+)\s*h/);
  const mMatch = timeStr.match(/(\d+)\s*min/);
  let m = 0;
  if (hMatch) m += parseInt(hMatch[1]) * 60;
  if (mMatch) m += parseInt(mMatch[1]);
  return m;
}

function parseServings(s) {
  if (!s) return 4;
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1]) : 4;
}

export default function ImportaRicettaPage() {
  const router = useRouter();
  const { addRecipe } = useCustomRecipes();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  async function handleFetch() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setError(null);
    setPreview(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?url=${encodeURIComponent(trimmed)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || 'Errore durante l\'estrazione');
        setLoading(false);
        return;
      }

      setPreview(data);
    } catch (err) {
      setError('Impossibile contattare il servizio. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }

  function handleImport() {
    if (!preview) return;

    const prep = timeToMinutes(preview.info?.preparazione);
    const cook = timeToMinutes(preview.info?.cottura);
    const total = prep + cook;

    const recipe = {
      title: preview.title,
      category: 'primi',
      emoji: '🍽️',
      image_color: '#F5C4B3',
      description: '',
      source_url: preview.source_url,
      source_site: preview.source_site,
      image_url: preview.image_url,
      prep_time_min: prep,
      cook_time_min: cook,
      total_time_min: total || 30,
      servings: parseServings(preview.info?.['dosi per']),
      difficulty: (preview.info?.difficoltà || 'media').toLowerCase(),
      cooking_method: 'fornelli',
      ingredients: preview.ingredients.map((ing) => {
        const parsed = parseQuantityRaw(ing.quantity_raw);
        return {
          name: ing.name,
          quantity: parsed.quantity,
          unit: parsed.unit,
          is_main: true,
          is_staple: false,
          quantity_raw: ing.quantity_raw,
        };
      }),
      steps: preview.steps,
      diet_flags: {},
      recipe_type: 'adult',
      weaning_min_age_months: null,
      baby_compatibility: null,
    };

    const id = addRecipe(recipe);
    router.push(`/recipe/?id=${id}`);
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] p-4 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/le-mie-ricette/"
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-[#C65D3B] hover:text-white hover:border-[#C65D3B] transition shadow-sm"
            aria-label="Indietro"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
          <h1 className="text-base font-medium text-[#C65D3B]">🔗 Importa da URL</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incolla il link della ricetta
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ricette.giallozafferano.it/..."
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#C65D3B]"
          />
          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="mt-2 w-full py-2.5 bg-[#C65D3B] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Estraggo...' : '🔍 Estrai ricetta'}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-gray-600 mb-1.5">Siti supportati:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {SUPPORTED_SITES.map((s) => (
              <li key={s.host}>✓ {s.name} <span className="text-gray-400">({s.host})</span></li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-red-700">⚠️ {error}</p>
          </div>
        )}

        {preview && (
          <div className="bg-white border-2 border-[#6B8E4E] rounded-lg overflow-hidden">
            <div
              className="h-32 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: '#F5C4B3' }}
            >
              {preview.image_url ? (
                <img src={preview.image_url} alt={preview.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">🍽️</span>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900">{preview.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">da {preview.source_site}</p>

              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <div>📋 {preview.ingredients.length} ingredienti</div>
                <div>📝 {preview.steps.length} passaggi</div>
                {preview.info?.preparazione && <div>⏱ Preparazione: {preview.info.preparazione}</div>}
                {preview.info?.cottura && <div>🔥 Cottura: {preview.info.cottura}</div>}
                {preview.info?.['dosi per'] && <div>👥 Dosi: {preview.info['dosi per']}</div>}
                {preview.info?.difficoltà && <div>● Difficoltà: {preview.info.difficoltà}</div>}
              </div>

              <div className="mt-4 bg-[#FFF8E7] border border-[#E5C870] rounded p-2">
                <p className="text-xs text-[#854F0B]">
                  💡 La ricetta verrà salvata tra le tue ricette personali. Potrai modificarla dopo.
                </p>
              </div>

              <button
                onClick={handleImport}
                className="mt-3 w-full py-2.5 bg-[#6B8E4E] text-white rounded-lg text-sm font-medium hover:opacity-90"
              >
                ✓ Importa nella mia raccolta
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}