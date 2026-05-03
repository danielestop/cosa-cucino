'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cosa-cucino-planner';

export const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
export const MEALS = ['Pranzo', 'Cena'];

function emptyWeek() {
  const week = {};
  DAYS.forEach((day) => {
    week[day] = {};
    MEALS.forEach((meal) => {
      week[day][meal] = [];
    });
  });
  return week;
}

export function usePlanner() {
  const [plan, setPlan] = useState(() => emptyWeek());
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.plan) setPlan(parsed.plan);
        if (parsed.history) setHistory(parsed.history);
      }
    } catch (e) {
      console.error('Errore lettura pianificatore:', e);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((newPlan, newHistory) => {
    setPlan(newPlan);
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan: newPlan, history: newHistory }));
    } catch (e) {
      console.error('Errore salvataggio pianificatore:', e);
    }
  }, []);

  const addRecipeToSlot = useCallback(
    (day, meal, recipe, servings) => {
      const newPlan = JSON.parse(JSON.stringify(plan));
      newPlan[day][meal].push({
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        recipe_image_url: recipe.image_url || null,
        recipe_image_color: recipe.image_color,
        recipe_emoji: recipe.emoji,
        recipe_category: recipe.category,
        servings: servings || recipe.servings || 4,
        original_servings: recipe.servings || 4,
        ingredients: recipe.ingredients || [],
      });
      persist(newPlan, history);
    },
    [plan, history, persist]
  );

  const removeRecipeFromSlot = useCallback(
    (day, meal, index) => {
      const newPlan = JSON.parse(JSON.stringify(plan));
      newPlan[day][meal].splice(index, 1);
      persist(newPlan, history);
    },
    [plan, history, persist]
  );

  const updateServings = useCallback(
    (day, meal, index, servings) => {
      const newPlan = JSON.parse(JSON.stringify(plan));
      newPlan[day][meal][index].servings = servings;
      persist(newPlan, history);
    },
    [plan, history, persist]
  );

  const archiveAndReset = useCallback(() => {
    const newHistory = [
      { archived_at: new Date().toISOString(), plan: JSON.parse(JSON.stringify(plan)) },
      ...history.slice(0, 11),
    ];
    persist(emptyWeek(), newHistory);
  }, [plan, history, persist]);

  const clearSlot = useCallback(
    (day, meal) => {
      const newPlan = JSON.parse(JSON.stringify(plan));
      newPlan[day][meal] = [];
      persist(newPlan, history);
    },
    [plan, history, persist]
  );

  const totalRecipes = Object.values(plan).reduce(
    (acc, dayPlan) => acc + Object.values(dayPlan).reduce((a, slot) => a + slot.length, 0),
    0
  );

  return {
    plan, history, hydrated,
    addRecipeToSlot, removeRecipeFromSlot, updateServings,
    archiveAndReset, clearSlot, totalRecipes,
  };
}