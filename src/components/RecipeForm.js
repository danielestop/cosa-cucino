'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/data/categories';

const DIFFICULTIES = ['facile', 'media', 'difficile'];
const COOKING_METHODS = [
  { value: 'fornelli', label: 'Fornelli' },
  { value: 'forno', label: 'Forno' },
  { value: 'no_cottura', label: 'No cottura' },
  { value: 'bimby', label: 'Bimby' },
  { value: 'friggitrice', label: 'Friggitrice' },
  { value: 'misto', label: 'Misto' },
];
const UNITS = ['g', 'kg', 'ml', 'l', 'pz', 'cucchiai', 'cucchiaini', 'spicchi', 'bicchieri', 'q.b.'];

export default function RecipeForm({ initialRecipe, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: initialRecipe?.title || '',
    category: initialRecipe?.category || 'primi',
    description: initialRecipe?.description || '',
    source_url: initialRecipe?.source_url || '',
    source_site: initialRecipe?.source_site || 'Mia ricetta',
    image_url: initialRecipe?.image_url || '',
    prep_time_min: initialRecipe?.prep_time_min ?? 0,
    cook_time_min: initialRecipe?.cook_time_min ?? 0,
    servings: initialRecipe?.servings ?? 4,
    difficulty: initialRecipe?.difficulty || 'facile',
    cooking_method: initialRecipe?.cooking_method || 'fornelli',
    ingredients: initialRecipe?.ingredients?.length ? initialRecipe.ingredients : [{ name: '', quantity: null, unit: 'g', is_main: true, is_staple: false }],
    steps: initialRecipe?.steps?.length ? initialRecipe.steps : [''],
  }));

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setIngredient(idx, key, value) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => (i === idx ? { ...ing, [key]: value } : ing)),
    }));
  }

  function addIngredient() {
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { name: '', quantity: null, unit: 'g', is_main: true, is_staple: false }],
    }));
  }

  function removeIngredient(idx) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== idx),
    }));
  }

  function setStep(idx, value) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => (i === idx ? value : s)),
    }));
  }

  function addStep() {
    setForm((f) => ({ ...f, steps: [...f.steps, ''] }));
  }

  function removeStep(idx) {
    setForm((f) => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== idx),
    }));
  }

  function handleSave() {
    if (!form.title.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }
    const validIngredients = form.ingredients.filter((i) => i.name.trim());
    const validSteps = form.steps.filter((s) => s.trim());
    if (validIngredients.length === 0) {
      alert('Aggiungi almeno un ingrediente');
      return;
    }
    if (validSteps.length === 0) {
      alert('Aggiungi almeno un passaggio');
      return;
    }

    const cat = CATEGORIES.find((c) => c.slug === form.category);
    const totalTime = (parseInt(form.prep_time_min) || 0) + (parseInt(form.cook_time_min) || 0);

    const recipe = {
      title: form.title.trim(),
      category: form.category,
      emoji: cat?.emoji || '🍽️',
      image_color: cat?.color || '#F5C4B3',
      description: form.description.trim(),
      source_url: form.source_url.trim() || null,
      source_site: form.source_site.trim() || 'Mia ricetta',
      image_url: form.image_url.trim() || null,
      prep_time_min: parseInt(form.prep_time_min) || 0,
      cook_time_min: parseInt(form.cook_time_min) || 0,
      total_time_min: totalTime,
      servings: parseInt(form.servings) || 4,
      difficulty: form.difficulty,
      cooking_method: form.cooking_method,
      ingredients: validIngredients,
      steps: validSteps,
      diet_flags: {},
      recipe_type: 'adult',
      weaning_min_age_months: null,
      baby_compatibility: null,
    };

    onSave(recipe);
  }

  const inputStyle = "w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-[#C65D3B]";

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Titolo *</label>
        <input value={form.title} onChange={(e) => setField('title', e.target.value)} className={inputStyle} placeholder="Es. Pasta della nonna" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
        <select value={form.category} onChange={(e) => setField('category', e.target.value)} className={inputStyle}>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Descrizione (opzionale)</label>
        <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} className={inputStyle} rows={2} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Prep (min)</label>
          <input type="number" min="0" value={form.prep_time_min} onChange={(e) => setField('prep_time_min', e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cottura (min)</label>
          <input type="number" min="0" value={form.cook_time_min} onChange={(e) => setField('cook_time_min', e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Porzioni</label>
          <input type="number" min="1" value={form.servings} onChange={(e) => setField('servings', e.target.value)} className={inputStyle} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Difficoltà</label>
          <select value={form.difficulty} onChange={(e) => setField('difficulty', e.target.value)} className={inputStyle}>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cottura</label>
          <select value={form.cooking_method} onChange={(e) => setField('cooking_method', e.target.value)} className={inputStyle}>
            {COOKING_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Link fonte (opzionale)</label>
        <input value={form.source_url} onChange={(e) => setField('source_url', e.target.value)} className={inputStyle} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Immagine URL (opzionale)</label>
        <input value={form.image_url} onChange={(e) => setField('image_url', e.target.value)} className={inputStyle} placeholder="https://..." />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Ingredienti *</label>
        <div className="space-y-3">
          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded">
              <div className="flex gap-1.5 items-center">
                <input
                  value={ing.name}
                  onChange={(e) => setIngredient(idx, 'name', e.target.value)}
                  className={`${inputStyle} flex-1`}
                  placeholder="Nome ingrediente"
                />
                <button
                  onClick={() => removeIngredient(idx)}
                  disabled={form.ingredients.length === 1}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-30 px-2 text-lg"
                  aria-label="Rimuovi ingrediente"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-1.5 items-center">
                <input
                  type="number"
                  step="0.1"
                  value={ing.quantity ?? ''}
                  onChange={(e) => setIngredient(idx, 'quantity', e.target.value === '' ? null : parseFloat(e.target.value))}
                  className={`${inputStyle} w-24`}
                  placeholder="Quantità"
                />
                <select
                  value={ing.unit}
                  onChange={(e) => setIngredient(idx, 'unit', e.target.value)}
                  className={`${inputStyle} w-28`}
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addIngredient} className="mt-1.5 text-xs text-[#C65D3B] hover:underline">+ Aggiungi ingrediente</button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Passaggi *</label>
        <div className="space-y-1.5">
          {form.steps.map((step, idx) => (
            <div key={idx} className="flex gap-1.5 items-start">
              <span className="text-sm text-[#C65D3B] font-medium pt-1.5">{idx + 1}.</span>
              <textarea value={step} onChange={(e) => setStep(idx, e.target.value)} className={`${inputStyle} flex-1`} rows={2} placeholder="Descrivi il passaggio..." />
              <button onClick={() => removeStep(idx)} disabled={form.steps.length === 1} className="text-gray-400 hover:text-red-500 disabled:opacity-30 px-1 pt-1.5">×</button>
            </div>
          ))}
        </div>
        <button onClick={addStep} className="mt-1.5 text-xs text-[#C65D3B] hover:underline">+ Aggiungi passaggio</button>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
          Annulla
        </button>
        <button onClick={handleSave} className="flex-1 py-2 bg-[#6B8E4E] text-white rounded-lg text-sm font-medium hover:opacity-90">
          Salva
        </button>
      </div>
    </div>
  );
}
