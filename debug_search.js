import { RECIPES } from './src/data/recipes.js';
import { searchRecipesByIngredients } from './src/lib/recipeSearch.js';

const search = ['cipolla', 'pomodoro'];

console.log('=== TEST 1: Tempo qualsiasi, max 5 ===');
let r = searchRecipesByIngredients(RECIPES, search, 5, null);
console.log(`Trovate: ${r.length}`);
r.slice(0, 5).forEach(({ recipe, missingCount, missingIngredients }) => {
  console.log(`  - ${recipe.title} (${recipe.total_time_min} min, mancano ${missingCount}: ${missingIngredients.slice(0, 3).join(', ')})`);
});

console.log('\n=== TEST 2: Tempo 60 min, max 5 ===');
r = searchRecipesByIngredients(RECIPES, search, 5, 60);
console.log(`Trovate: ${r.length}`);
r.slice(0, 5).forEach(({ recipe, missingCount }) => {
  console.log(`  - ${recipe.title} (${recipe.total_time_min} min, mancano ${missingCount})`);
});

console.log('\n=== TEST 3: Tempo 30 min, max 5 ===');
r = searchRecipesByIngredients(RECIPES, search, 5, 30);
console.log(`Trovate: ${r.length}`);
r.slice(0, 5).forEach(({ recipe, missingCount }) => {
  console.log(`  - ${recipe.title} (${recipe.total_time_min} min, mancano ${missingCount})`);
});

console.log('\n=== Distribuzione tempi nelle ricette con cipolla+passata ===');
const allWithBoth = searchRecipesByIngredients(RECIPES, search, 99, null);
const times = allWithBoth.map(r => r.recipe.total_time_min).sort((a, b) => a - b);
console.log(`Totale ricette con entrambi gli ingredienti: ${allWithBoth.length}`);
console.log(`Tempi: min=${times[0]}, max=${times[times.length-1]}, mediana=${times[Math.floor(times.length/2)]}`);
console.log(`Sotto 30 min: ${times.filter(t => t <= 30).length}`);
console.log(`Sotto 60 min: ${times.filter(t => t <= 60).length}`);
console.log(`Sotto 90 min: ${times.filter(t => t <= 90).length}`);