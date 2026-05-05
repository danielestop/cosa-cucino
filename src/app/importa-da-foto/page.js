'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomRecipes } from '@/lib/useCustomRecipes';
import { CATEGORIES } from '@/data/categories';

// =============================================================
// CONFIGURAZIONE
// =============================================================
const VISION_API_URL = 'https://cosa-cucino-vision-api.vercel.app/api/extract';
const PASSWORD_STORAGE_KEY = 'cosa-cucino-vision-password';
const MAX_IMAGES = 5;
const MAX_LONG_SIDE = 1600;       // px lato lungo dopo resize
const JPEG_QUALITY = 0.85;
const MAX_FILE_SIZE_BEFORE = 20 * 1024 * 1024; // 20 MB pre-resize cap

// Mappa categorie vision (label GialloZafferano) -> slug app
const CATEGORY_LABEL_TO_SLUG = {
  'antipasti': 'antipasti',
  'primi': 'primi',
  'secondi-piatti': 'secondi-piatti',
  'secondi piatti': 'secondi-piatti',
  'secondi': 'secondi-piatti',
  'contorni': 'contorni',
  'dolci-e-desserts': 'dolci-e-desserts',
  'dolci e desserts': 'dolci-e-desserts',
  'dolci': 'dolci-e-desserts',
  'lievitati': 'lievitati',
  'piatti-unici': 'piatti-unici',
  'piatti unici': 'piatti-unici',
};

function mapCategoryToSlug(label) {
  if (!label) return 'primi';
  const key = String(label).toLowerCase().trim();
  return CATEGORY_LABEL_TO_SLUG[key] || 'primi';
}

// Ricostruisce la stringa "quantity_raw" stile API URL a partire da quantity+unit
function buildQuantityRaw(quantity, unit) {
  if (quantity == null && !unit) return '';
  if (quantity == null) return unit || '';
  if (!unit) return String(quantity);
  // unit "q.b." o simili: niente numero
  if (unit === 'q.b.') return 'q.b.';
  return `${quantity} ${unit}`.trim();
}

// =============================================================
// RESIZE CLIENT-SIDE (Canvas API nativa)
// =============================================================
async function resizeImageToBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE_BEFORE) {
      reject(new Error('File troppo grande (>20 MB). Usa una foto più piccola.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lettura file fallita.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Immagine non leggibile.'));
      img.onload = () => {
        try {
          let { width, height } = img;
          const longSide = Math.max(width, height);
          if (longSide > MAX_LONG_SIDE) {
            const scale = MAX_LONG_SIDE / longSide;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          // dataUrl: "data:image/jpeg;base64,...."
          const base64 = dataUrl.split(',')[1];
          resolve({ image_base64: base64, media_type: 'image/jpeg', preview_url: dataUrl });
        } catch (e) {
          reject(e);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// =============================================================
// COMPONENTE PRINCIPALE
// =============================================================
export default function ImportaDaFotoPage() {
  const router = useRouter();
  const { addRecipe } = useCustomRecipes();
  const fileInputRef = useRef(null);

  const [hydrated, setHydrated] = useState(false);
  const [password, setPassword] = useState('');
  const [hasStoredPassword, setHasStoredPassword] = useState(false);

  const [images, setImages] = useState([]); // [{image_base64, media_type, preview_url, name}]
  const [processing, setProcessing] = useState(false); // resize in corso
  const [loading, setLoading] = useState(false);       // chiamata API
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Radio recipe_type
  const [recipeType, setRecipeType] = useState('adult');
  const [weaningMonths, setWeaningMonths] = useState(6);

  // Carica password salvata al mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PASSWORD_STORAGE_KEY);
      if (saved) {
        setPassword(saved);
        setHasStoredPassword(true);
      }
    } catch (e) {}
    setHydrated(true);
  }, []);

  function savePassword(pw) {
    try {
      localStorage.setItem(PASSWORD_STORAGE_KEY, pw);
      setHasStoredPassword(true);
    } catch (e) {}
  }

  function forgetPassword() {
    try {
      localStorage.removeItem(PASSWORD_STORAGE_KEY);
    } catch (e) {}
    setPassword('');
    setHasStoredPassword(false);
  }

  // ---------------- File handling ----------------
  async function handleFiles(fileList) {
    setError(null);
    const files = Array.from(fileList);
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Massimo ${MAX_IMAGES} foto. Ne hai già ${images.length}, vuoi aggiungerne ${files.length}.`);
      return;
    }
    setProcessing(true);
    const newImages = [];
    for (const f of files) {
      try {
        const resized = await resizeImageToBase64(f);
        newImages.push({ ...resized, name: f.name });
      } catch (e) {
        setError(`Errore su "${f.name}": ${e.message}`);
        setProcessing(false);
        return;
      }
    }
    setImages([...images, ...newImages]);
    setProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index) {
    setImages(images.filter((_, i) => i !== index));
  }

  function moveImage(index, direction) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= images.length) return;
    const arr = [...images];
    [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
    setImages(arr);
  }

  // ---------------- API call ----------------
  async function handleExtract() {
    setError(null);
    setPreview(null);
    if (images.length === 0) {
      setError('Aggiungi almeno una foto.');
      return;
    }
    if (!password.trim()) {
      setError('Inserisci la password di sblocco.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        images: images.map((img) => ({
          image_base64: img.image_base64,
          media_type: img.media_type,
        })),
      };
      const response = await fetch(VISION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Unlock-Password': password.trim(),
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.status === 401) {
        setError('Password errata. Controlla e riprova.');
        forgetPassword();
        setLoading(false);
        return;
      }
      if (response.status === 429) {
        setError(data.message || 'Limite giornaliero raggiunto. Riprova domani.');
        setLoading(false);
        return;
      }
      if (response.status === 422) {
        const msg =
          data.error === 'image_unreadable'
            ? 'Foto non leggibili. Prova con scatti più nitidi e diritti.'
            : data.error === 'no_recipe_detected'
            ? 'Non ho trovato una ricetta nelle foto.'
            : data.error === 'multiple_recipes_detected'
            ? 'Ho rilevato più ricette diverse. Carica le pagine di una sola ricetta.'
            : data.message || 'Estrazione non riuscita.';
        setError(msg);
        setLoading(false);
        return;
      }
      if (!response.ok) {
        setError(data.message || data.error || 'Errore durante l\'estrazione.');
        setLoading(false);
        return;
      }

      // Ok: salva password se ha funzionato
      if (!hasStoredPassword) savePassword(password.trim());
      setPreview(data);
    } catch (err) {
      setError('Impossibile contattare il servizio. Controlla la connessione e riprova.');
    } finally {
      setLoading(false);
    }
  }

  // ---------------- Salvataggio ----------------
  function handleImport() {
    if (!preview?.recipe) return;
    const r = preview.recipe;

    const slug = mapCategoryToSlug(r.category);
    const cat = CATEGORIES.find((c) => c.slug === slug);

    const prep = typeof r.prep_time_minutes === 'number' ? r.prep_time_minutes : 0;
    const cook = typeof r.cook_time_minutes === 'number' ? r.cook_time_minutes : 0;
    const total = prep + cook;

    const recipe = {
      title: r.title || 'Ricetta senza titolo',
      category: slug,
      emoji: cat?.emoji || '🍽️',
      image_color: cat?.color || '#F5C4B3',
      description: '',
      source_url: '',
      source_site: 'Foto',
      image_url: '',
      prep_time_min: prep,
      cook_time_min: cook,
      total_time_min: total || 30,
      servings:
        typeof r.servings === 'number' && r.servings > 0
          ? r.servings
          : (recipeType === 'weaning' ? 1 : 4),
      difficulty: (r.difficulty || 'media').toLowerCase(),
      cooking_method: 'fornelli',
      ingredients: (r.ingredients || []).map((ing) => ({
        name: ing.name || '',
        quantity: typeof ing.quantity === 'number' ? ing.quantity : null,
        unit: ing.unit || '',
        is_main: true,
        is_staple: false,
        quantity_raw: buildQuantityRaw(ing.quantity, ing.unit),
      })),
      steps: Array.isArray(r.steps) ? r.steps : [],
      diet_flags: {},
      recipe_type: recipeType,
      weaning_min_age_months: recipeType === 'weaning' ? Number(weaningMonths) : null,
      baby_compatibility: null,
    };

    const id = addRecipe(recipe);
    router.push(`/recipe/?id=${id}`);
  }

  function resetAll() {
    setImages([]);
    setPreview(null);
    setError(null);
  }

  // =============================================================
  // RENDER
  // =============================================================
  return (
    <main className="min-h-screen bg-[#FAF7F2] p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
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
          <h1 className="text-base font-medium text-[#C65D3B]">📷 Importa da foto</h1>
        </div>

        {/* PASSWORD */}
        {hydrated && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password di sblocco
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci la password"
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#C65D3B]"
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-gray-500">
                {hasStoredPassword ? '✓ Salvata su questo dispositivo' : 'Verrà salvata dopo il primo uso riuscito'}
              </p>
              {hasStoredPassword && (
                <button
                  onClick={forgetPassword}
                  className="text-xs text-[#C65D3B] hover:underline"
                >
                  Dimentica
                </button>
              )}
            </div>
          </div>
        )}

        {/* TIPO RICETTA */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo ricetta
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="recipe_type"
                value="adult"
                checked={recipeType === 'adult'}
                onChange={() => setRecipeType('adult')}
                className="accent-[#C65D3B]"
              />
              Adulto
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="recipe_type"
                value="weaning"
                checked={recipeType === 'weaning'}
                onChange={() => setRecipeType('weaning')}
                className="accent-[#C65D3B]"
              />
              Svezzamento
            </label>
          </div>
          {recipeType === 'weaning' && (
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs text-gray-600">Età minima:</label>
              <input
                type="number"
                min="4"
                max="36"
                value={weaningMonths}
                onChange={(e) => setWeaningMonths(e.target.value)}
                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-[#C65D3B]"
              />
              <span className="text-xs text-gray-600">mesi</span>
            </div>
          )}
        </div>

        {/* UPLOAD */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto della ricetta ({images.length}/{MAX_IMAGES})
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={processing || images.length >= MAX_IMAGES}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#FDF4F0] file:text-[#C65D3B] file:text-sm file:font-medium hover:file:bg-[#FAE6DD] disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Le foto vengono ridimensionate (max 1600px) prima dell'invio.
          </p>

          {processing && (
            <p className="text-xs text-[#C65D3B] mt-2">⏳ Elaboro le foto...</p>
          )}

          {/* Preview thumbnails */}
          {images.length > 0 && (
            <div className="mt-3 space-y-2">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded p-1.5">
                  <img
                    src={img.preview_url}
                    alt={`Foto ${idx + 1}`}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-700 truncate">
                      Pagina {idx + 1}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{img.name}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveImage(idx, -1)}
                      disabled={idx === 0}
                      className="text-xs px-1.5 py-0.5 text-gray-600 hover:text-[#C65D3B] disabled:opacity-30"
                      aria-label="Sposta su"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveImage(idx, 1)}
                      disabled={idx === images.length - 1}
                      className="text-xs px-1.5 py-0.5 text-gray-600 hover:text-[#C65D3B] disabled:opacity-30"
                      aria-label="Sposta giù"
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    onClick={() => removeImage(idx)}
                    className="text-xs text-red-500 hover:text-red-700 px-1.5"
                    aria-label="Rimuovi"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTONE ESTRAI */}
        {!preview && (
          <button
            onClick={handleExtract}
            disabled={loading || processing || images.length === 0 || !password.trim()}
            className="w-full py-2.5 bg-[#C65D3B] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
          >
            {loading ? '⏳ Estraggo (può richiedere 10-30s)...' : '🔍 Estrai ricetta dalle foto'}
          </button>
        )}

        {/* ERRORE */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-red-700 mb-2">⚠️ {error}</p>
            {!loading && images.length > 0 && (
              <button
                onClick={handleExtract}
                className="text-xs text-[#C65D3B] hover:underline"
              >
                🔄 Riprova
              </button>
            )}
          </div>
        )}

        {/* PREVIEW RICETTA */}
        {preview?.recipe && (
          <div className="bg-white border-2 border-[#6B8E4E] rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900">{preview.recipe.title || 'Ricetta senza titolo'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {preview.images_processed} {preview.images_processed === 1 ? 'foto elaborata' : 'foto elaborate'}
                {preview.recipe.extraction_confidence && ` · Affidabilità: ${preview.recipe.extraction_confidence}`}
              </p>

              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <div>📋 {(preview.recipe.ingredients || []).length} ingredienti</div>
                <div>📝 {(preview.recipe.steps || []).length} passaggi</div>
                {preview.recipe.prep_time_minutes != null && <div>⏱ Preparazione: {preview.recipe.prep_time_minutes} min</div>}
                {preview.recipe.cook_time_minutes != null && <div>🔥 Cottura: {preview.recipe.cook_time_minutes} min</div>}
                {preview.recipe.servings != null && <div>👥 Porzioni: {preview.recipe.servings}</div>}
                {preview.recipe.difficulty && <div>● Difficoltà: {preview.recipe.difficulty}</div>}
                {preview.recipe.category && <div>🏷️ Categoria: {preview.recipe.category}</div>}
                <div>🍽️ Tipo: {recipeType === 'weaning' ? `Svezzamento (${weaningMonths}+ mesi)` : 'Adulto'}</div>
              </div>

              {preview.recipe.extraction_warnings && preview.recipe.extraction_warnings.length > 0 && (
                <div className="mt-3 bg-[#FFF8E7] border border-[#E5C870] rounded p-2">
                  <p className="text-xs font-medium text-[#854F0B] mb-1">⚠️ Avvisi:</p>
                  <ul className="text-xs text-[#854F0B] space-y-0.5">
                    {preview.recipe.extraction_warnings.map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 bg-[#F0F7E8] border border-[#6B8E4E] rounded p-2">
                <p className="text-xs text-[#3F5A2E]">
                  💡 La ricetta verrà salvata tra le tue ricette personali. Potrai modificarla dopo dalla scheda ricetta.
                </p>
              </div>

              {preview.remaining_today != null && (
                <p className="text-xs text-gray-500 mt-2">
                  Foto rimanenti oggi: {preview.remaining_today}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={resetAll}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  ✕ Annulla
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 py-2.5 bg-[#6B8E4E] text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                  ✓ Salva ricetta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
