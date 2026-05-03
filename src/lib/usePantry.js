'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cosa-cucino-pantry';

// Set base di staple — quelli marcati is_staple nelle ricette
export const PANTRY_BASE_SET = [
  'Sale',
  'Pepe',
  'Olio extravergine d\'oliva',
  'Aceto',
  'Acqua',
  'Zucchero',
  'Farina 00',
  'Uova',
  'Burro',
  'Aglio',
];

export function usePantry() {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (e) {
      console.error('Errore lettura dispensa:', e);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Errore salvataggio dispensa:', e);
    }
  }, []);

  const addItem = useCallback(
    (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const exists = items.some((i) => i.toLowerCase() === trimmed.toLowerCase());
      if (exists) return;
      persist([...items, trimmed]);
    },
    [items, persist]
  );

  const removeItem = useCallback(
    (name) => {
      persist(items.filter((i) => i !== name));
    },
    [items, persist]
  );

  const addBaseSet = useCallback(() => {
    const newItems = [...items];
    PANTRY_BASE_SET.forEach((staple) => {
      if (!newItems.some((i) => i.toLowerCase() === staple.toLowerCase())) {
        newItems.push(staple);
      }
    });
    persist(newItems);
  }, [items, persist]);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  return { items, addItem, removeItem, addBaseSet, clear, hydrated };
}