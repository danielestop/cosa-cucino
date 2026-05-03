'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cosa-cucino-diary';

export function useDiary() {
  const [entries, setEntries] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch (e) {
      console.error('Errore lettura diario:', e);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((newEntries) => {
    setEntries(newEntries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    } catch (e) {
      console.error('Errore salvataggio diario:', e);
    }
  }, []);

  const addEntry = useCallback(
    ({ recipe_id, recipe_title, recipe_image_url, recipe_image_color, recipe_emoji, date, rating, notes }) => {
      const id = `diary-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newEntry = {
        id,
        recipe_id,
        recipe_title,
        recipe_image_url: recipe_image_url || null,
        recipe_image_color: recipe_image_color || '#F5C4B3',
        recipe_emoji: recipe_emoji || '🍽️',
        date,
        rating: rating || null,
        notes: notes || '',
        created_at: new Date().toISOString(),
      };
      persist([newEntry, ...entries]);
      return id;
    },
    [entries, persist]
  );

  const updateEntry = useCallback(
    (id, updates) => {
      persist(
        entries.map((e) =>
          e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
        )
      );
    },
    [entries, persist]
  );

  const deleteEntry = useCallback(
    (id) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist]
  );

  const getEntriesForRecipe = useCallback(
    (recipe_id) => entries.filter((e) => e.recipe_id === recipe_id),
    [entries]
  );

  return { entries, addEntry, updateEntry, deleteEntry, getEntriesForRecipe, hydrated };
}