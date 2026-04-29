'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cosa-cucino-custom-recipes';

export function useCustomRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecipes(parsed);
        }
      }
    } catch (e) {
      console.error('Errore lettura ricette personali:', e);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((newRecipes) => {
    setRecipes(newRecipes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecipes));
    } catch (e) {
      console.error('Errore salvataggio ricette personali:', e);
    }
  }, []);

  const addRecipe = useCallback(
    (recipe) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newRecipe = {
        ...recipe,
        id,
        is_custom: true,
        source_site: recipe.source_site || 'Mia ricetta',
        created_at: new Date().toISOString(),
      };
      persist([...recipes, newRecipe]);
      return id;
    },
    [recipes, persist]
  );

  const updateRecipe = useCallback(
    (id, updates) => {
      persist(
        recipes.map((r) =>
          r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
        )
      );
    },
    [recipes, persist]
  );

  const deleteRecipe = useCallback(
    (id) => {
      persist(recipes.filter((r) => r.id !== id));
    },
    [recipes, persist]
  );

  const getRecipe = useCallback(
    (id) => recipes.find((r) => r.id === id),
    [recipes]
  );

  return { recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe, hydrated };
}