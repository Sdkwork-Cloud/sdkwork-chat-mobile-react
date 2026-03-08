import { useCallback, useEffect } from 'react';
import { useSocialStore } from '../stores/socialStore';
import type { FavoriteItem } from '../types';

export function useSocial() {
  const favorites = useSocialStore((state) => state.favorites);
  const isLoading = useSocialStore((state) => state.isLoading);
  const error = useSocialStore((state) => state.error);

  const loadFavorites = useSocialStore((state) => state.loadFavorites);
  const addFavorite = useSocialStore((state) => state.addFavorite);
  const removeFavorite = useSocialStore((state) => state.removeFavorite);

  const handleAddFavorite = useCallback(
    async (item: Partial<FavoriteItem>) => {
      await addFavorite(item);
    },
    [addFavorite],
  );

  const handleRemoveFavorite = useCallback(
    async (id: string) => {
      await removeFavorite(id);
    },
    [removeFavorite],
  );

  return {
    favorites,
    isLoading,
    error,
    loadFavorites,
    addFavorite: handleAddFavorite,
    removeFavorite: handleRemoveFavorite,
  };
}

export function useFavorites(category = 'all', keyword?: string) {
  const favorites = useSocialStore((state) => state.favorites);
  const isLoading = useSocialStore((state) => state.isLoading);
  const loadFavorites = useSocialStore((state) => state.loadFavorites);

  useEffect(() => {
    void loadFavorites(category, keyword);
  }, [category, keyword, loadFavorites]);

  return {
    favorites,
    isLoading,
    refresh: () => loadFavorites(category, keyword),
  };
}
