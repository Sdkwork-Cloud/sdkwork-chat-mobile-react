import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FavoriteItem, FavoritesState } from '../types';
import { favoritesService } from '../services/FavoritesService';

interface SocialStore extends FavoritesState {
  loadFavorites: (category?: string, keyword?: string) => Promise<void>;
  addFavorite: (item: Partial<FavoriteItem>) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set) => ({
      favorites: [] as FavoriteItem[],
      isLoading: false,
      error: null,

      loadFavorites: async (category = 'all', keyword?: string) => {
        set({ isLoading: true, error: null });
        try {
          const favorites = await favoritesService.getFavorites(category, keyword);
          set({ favorites, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      addFavorite: async (item: Partial<FavoriteItem>) => {
        try {
          const favorite = await favoritesService.addFavorite(item);
          set((state) => ({ favorites: [favorite, ...state.favorites] }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      removeFavorite: async (id: string) => {
        try {
          await favoritesService.removeFavorite(id);
          set((state) => ({
            favorites: state.favorites.filter((f) => f.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
    }),
    {
      name: 'social-storage',
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    },
  ),
);
