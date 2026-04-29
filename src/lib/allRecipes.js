'use client';

import { useMemo } from 'react';
import { RECIPES as STATIC_RECIPES } from '@/data/recipes';
import { useCustomRecipes } from '@/lib/useCustomRecipes';

export function useAllRecipes() {
  const { recipes: customRecipes, hydrated } = useCustomRecipes();

  const allRecipes = useMemo(() => {
    return [...customRecipes, ...STATIC_RECIPES];
  }, [customRecipes]);

  return { allRecipes, customRecipes, hydrated };
}