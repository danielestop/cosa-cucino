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
  bustina: 'pz', bustine: 'pz',
};

const NUMBER_WORDS = {
  un: 1, uno: 1, una: 1, "un'": 1,
  due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6,
  sette: 7, otto: 8, nove: 9, dieci: 10,
  mezzo: 0.5, mezza: 0.5,
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

/**
 * Estrae quantità + unità + nome da una stringa "tutto-in-uno" tipo:
 *   "150 g di yogurt greco" → {quantity: 150, unit: "g", name: "yogurt greco"}
 *   "un uovo" → {quantity: 1, unit: "pz", name: "uovo"}
 *   "due cucchiai di olio di girasole" → {quantity: 2, unit: "cucchiai", name: "olio di girasole"}
 *   "limone" → {quantity: null, unit: "q.b.", name: "limone"}
 */
export function parseIngredientLine(line) {
  if (!line || typeof line !== 'string') {
    return { quantity: null, unit: 'q.b.', name: '' };
  }

  let text = line.trim();
  const lower = text.toLowerCase();

  // 1. Cerca numero (digit) all'inizio: "150 g di yogurt"
  const numMatch = lower.match(/^(\d+(?:[.,]\d+)?)\s*([a-zà]+)?\s*(?:di\s+|d['’]\s*)?(.+)?$/i);
  if (numMatch) {
    const quantity = parseFloat(numMatch[1].replace(',', '.'));
    const unitCandidate = (numMatch[2] || '').toLowerCase();
    const rest = (numMatch[3] || '').trim();

    if (UNIT_MAP[unitCandidate]) {
      return {
        quantity,
        unit: UNIT_MAP[unitCandidate],
        name: cleanName(rest || ''),
      };
    }
    // numero ma niente unità riconoscibile → "2 mele" → quantità + nome (senza unità)
    return {
      quantity,
      unit: 'pz',
      name: cleanName(unitCandidate ? `${unitCandidate} ${rest}` : rest),
    };
  }

  // 2. Cerca numero scritto a parole all'inizio: "un uovo", "due mele", "una bustina di lievito"
  const wordMatch = lower.match(/^(un['’]?|uno|una|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|mezzo|mezza)\s+(.+)$/i);
  if (wordMatch) {
    const numWord = wordMatch[1].toLowerCase().replace(/['’]/g, '');
    const quantity = NUMBER_WORDS[numWord] || 1;
    const rest = wordMatch[2].trim();

    // verifica se la prima parola del resto è un'unità
    const restWords = rest.split(/\s+/);
    const firstWord = restWords[0].toLowerCase().replace(/[^\w]/g, '');
    if (UNIT_MAP[firstWord]) {
      const afterUnit = restWords.slice(1).join(' ').replace(/^(di\s+|d['’]\s*)/i, '');
      return {
        quantity,
        unit: UNIT_MAP[firstWord],
        name: cleanName(afterUnit),
      };
    }
    // "un uovo" → quantità=1, unit=pz, name=uovo
    return {
      quantity,
      unit: 'pz',
      name: cleanName(rest),
    };
  }

  // 3. Niente numero → "limone", "zucchero" → q.b.
  return {
    quantity: null,
    unit: 'q.b.',
    name: cleanName(text),
  };
}

function cleanName(text) {
  if (!text) return '';
  let cleaned = text
    .replace(/^(di\s+|d['’]\s*)/i, '')
    .trim();
  // capitalizza prima lettera
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}