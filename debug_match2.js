import { RECIPES } from './src/data/recipes.js';

// Trova la prima ricetta che ha cipolla + pomodor (qualsiasi forma)
const target = RECIPES.find(r => {
  const ings = (r.ingredients || []).filter(i => i.is_main && !i.is_staple);
  const hasCipolla = ings.some(i => i.name.toLowerCase().includes('cipoll'));
  const hasPomodor = ings.some(i => i.name.toLowerCase().includes('pomodor'));
  return hasCipolla && hasPomodor;
});

if (!target) {
  console.log("Nessuna ricetta trovata");
  process.exit(0);
}

console.log(`=== Ricetta target: ${target.title} ===`);
console.log(`Tempo: ${target.total_time_min} min`);
console.log(`\nIngredienti main non-staple:`);
target.ingredients
  .filter(i => i.is_main && !i.is_staple)
  .forEach(i => {
    console.log(`  - "${i.name}" | normalized="${i.name_normalized || '???'}"`);
  });

console.log(`\n=== Verifica matching ===`);

// Importo la funzione direttamente
const { searchRecipesByIngredients } = await import('./src/lib/recipeSearch.js');

// Test isolato sulla SOLA ricetta target
const singleResult = searchRecipesByIngredients(
  [target],
  ['cipolla', 'pomodoro'],
  10,  // max missing alto
  null  // tempo qualsiasi
);

console.log(`Cerco "cipolla, pomodoro" su questa ricetta:`);
console.log(`Risultato: ${singleResult.length > 0 ? 'MATCHA ✅' : 'NON matcha ❌'}`);
if (singleResult.length > 0) {
  console.log(`Mancanti: ${singleResult[0].missingIngredients.join(', ')}`);
}