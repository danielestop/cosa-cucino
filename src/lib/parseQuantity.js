const UNIT_MAP = {
  g: 'g', gr: 'g', grammi: 'g', grammo: 'g',
  kg: 'kg', kilogrammo: 'kg', kilogrammi: 'kg', chilogrammo: 'kg', chilogrammi: 'kg',
  ml: 'ml', millilitri: 'ml', millilitro: 'ml',
  l: 'l', litri: 'l', litro: 'l',
  pz: 'pz', pezzi: 'pz', pezzo: 'pz',
  spicchio: 'spicchi', spicchi: 'spicchi',
  cucchiaio: 'cucchiai', cucchiai: 'cucchiai',
  cucchiaino: 'cucchiaini', cucchiaini: 'cucchiaini',
  bicchiere: 'bicchieri', bicchieri: 'bicchieri',
  tazza: 'tazze', tazze: 'tazze',
  pizzico: 'pizzichi', pizzichi: 'pizzichi',
  foglie: 'pz', foglia: 'pz',
  rametti: 'pz', rametto: 'pz',
  mazzetto: 'pz', mazzetti: 'pz',
};

export function parseQuantityRaw(quantityRaw) {
  if (!quantityRaw || typeof quantityRaw !== 'string') {
    return { quantity: null, unit: 'q.b.' };
  }

  const text = quantityRaw.trim().toLowerCase();

  if (!text || text === 'q.b.' || text.endsWith('q.b.') || text.endsWith('qb')) {
    return { quantity: null, unit: 'q.b.' };
  }

  const numMatch = text.match(/(\d+(?:[.,]\d+)?)/);
  if (!numMatch) {
    return { quantity: null, unit: 'q.b.' };
  }
  const quantity = parseFloat(numMatch[1].replace(',', '.'));

  const afterNumber = text.slice(numMatch.index + numMatch[1].length).trim();
  const beforeNumber = text.slice(0, numMatch.index).trim();

  const candidates = [
    afterNumber.split(/\s+/)[0] || '',
    beforeNumber.split(/\s+/).pop() || '',
  ];

  for (const candidate of candidates) {
    const cleaned = candidate.replace(/[^\w]/g, '');
    if (UNIT_MAP[cleaned]) {
      return { quantity, unit: UNIT_MAP[cleaned] };
    }
  }

  if (afterNumber === '' || afterNumber === '.') {
    return { quantity, unit: 'pz' };
  }

  return { quantity, unit: 'pz' };
}