'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cosa-cucino-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (e) {
      console.error('Errore lettura preferiti:', e);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((newFavorites) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Errore salvataggio preferiti:', e);
    }
  }, []);

  const isFavorite = useCallback(
    (recipeId) => favorites.includes(recipeId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (recipeId) => {
      const newFavorites = favorites.includes(recipeId)
        ? favorites.filter((id) => id !== recipeId)
        : [...favorites, recipeId];
      persist(newFavorites);
    },
    [favorites, persist]
  );

  return { favorites, isFavorite, toggleFavorite, hydrated };
}