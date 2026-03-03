import { useCallback, useEffect } from 'react';
import { useSocialStore } from '../stores/socialStore';
import type { FavoriteItem } from '../types';

export function useSocial() {
  const moments = useSocialStore((state) => state.moments);
  const favorites = useSocialStore((state) => state.favorites);
  const isLoading = useSocialStore((state) => state.isLoading);
  const error = useSocialStore((state) => state.error);

  const loadMoments = useSocialStore((state) => state.loadMoments);
  const publishMoment = useSocialStore((state) => state.publishMoment);
  const likeMoment = useSocialStore((state) => state.likeMoment);
  const commentMoment = useSocialStore((state) => state.commentMoment);
  const loadFavorites = useSocialStore((state) => state.loadFavorites);
  const addFavorite = useSocialStore((state) => state.addFavorite);
  const removeFavorite = useSocialStore((state) => state.removeFavorite);

  const handlePublish = useCallback(
    async (content: string, images?: string[]) => {
      await publishMoment(content, images);
    },
    [publishMoment]
  );

  const handleLike = useCallback(
    async (id: string) => {
      await likeMoment(id);
    },
    [likeMoment]
  );

  const handleComment = useCallback(
    async (id: string, text: string) => {
      await commentMoment(id, text);
    },
    [commentMoment]
  );

  const handleAddFavorite = useCallback(
    async (item: Partial<FavoriteItem>) => {
      await addFavorite(item);
    },
    [addFavorite]
  );

  const handleRemoveFavorite = useCallback(
    async (id: string) => {
      await removeFavorite(id);
    },
    [removeFavorite]
  );

  return {
    moments,
    favorites,
    isLoading,
    error,
    loadMoments,
    publishMoment: handlePublish,
    likeMoment: handleLike,
    commentMoment: handleComment,
    loadFavorites,
    addFavorite: handleAddFavorite,
    removeFavorite: handleRemoveFavorite,
  };
}

export function useMoments() {
  const moments = useSocialStore((state) => state.moments);
  const isLoading = useSocialStore((state) => state.isLoading);
  const loadMoments = useSocialStore((state) => state.loadMoments);

  useEffect(() => {
    void loadMoments(1);
  }, [loadMoments]);

  return {
    moments,
    isLoading,
    loadMore: () => loadMoments(Math.ceil(moments.length / 10) + 1),
  };
}

export function useFavorites(category = 'all', keyword?: string) {
  const favorites = useSocialStore((state) => state.favorites);
  const isLoading = useSocialStore((state) => state.isLoading);
  const loadFavorites = useSocialStore((state) => state.loadFavorites);

  useEffect(() => {
    void loadFavorites(category, keyword);
  }, [category, keyword, loadFavorites]);

  return { favorites, isLoading, refresh: () => loadFavorites(category, keyword) };
}
