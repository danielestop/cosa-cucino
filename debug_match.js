import { RECIPES } from './src/data/recipes.js';

console.log('=== Tutte le ricette che hanno "cipolla" come main ===');
let cipollaCount = 0;
RECIPES.forEach(r => {
  const hasCipolla = (r.ingredients || []).some(ing =>
    ing.is_main && !ing.is_staple &&
    (ing.name.toLowerCase().includes('cipoll') || (ing.name_normalized || '').includes('cipoll'))
  );
  if (hasCipolla) cipollaCount++;
});
console.log(`Trovate: ${cipollaCount}`);

console.log('\n=== Tutte le ricette con "pomodor" (qualsiasi forma) ===');
let pomodorCount = 0;
const pomodorVariants = new Set();
RECIPES.forEach(r => {
  (r.ingredients || []).forEach(ing => {
    if (ing.is_main && !ing.is_staple && ing.name.toLowerCase().includes('pomodor')) {
      pomodorVariants.add(ing.name);
    }
  });
  const has = (r.ingredients || []).some(ing =>
    ing.is_main && !ing.is_staple && ing.name.toLowerCase().includes('pomodor')
  );
  if (has) pomodorCount++;
});
console.log(`Ricette con almeno un ingrediente "pomodor*": ${pomodorCount}`);
console.log('Varianti uniche di pomodoro:');
[...pomodorVariants].sort().forEach(v => console.log(`  - ${v}`));

console.log('\n=== Ricette con sia cipolla che pomodor (qualsiasi forma) ===');
let both = 0;
const examples = [];
RECIPES.forEach(r => {
  const ings = (r.ingredients || []).filter(i => i.is_main && !i.is_staple);
  const hasCipolla = ings.some(i => i.name.toLowerCase().includes('cipoll'));
  const hasPomodor = ings.some(i => i.name.toLowerCase().includes('pomodor'));
  if (hasCipolla && hasPomodor) {
    both++;
    if (examples.length < 10) examples.push(r.title);
  }
});
console.log(`Trovate: ${both}`);
console.log('Prime 10:');
examples.forEach(e => console.log(`  - ${e}`));