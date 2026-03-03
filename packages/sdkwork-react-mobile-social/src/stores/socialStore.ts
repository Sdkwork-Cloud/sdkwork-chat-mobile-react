import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SocialState, Moment, FavoriteItem } from '../types';
import { momentsService } from '../services/MomentsService';
import { favoritesService } from '../services/FavoritesService';

interface SocialStore extends SocialState {
  // Actions
  loadMoments: (page?: number) => Promise<boolean>;
  publishMoment: (content: string, images?: string[]) => Promise<void>;
  likeMoment: (id: string) => Promise<void>;
  commentMoment: (id: string, text: string) => Promise<void>;
  loadFavorites: (category?: string, keyword?: string) => Promise<void>;
  addFavorite: (item: Partial<FavoriteItem>) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      // Initial state
      moments: [],
      favorites: [],
      isLoading: false,
      error: null,

      // Load moments
      loadMoments: async (page = 1) => {
        set({ isLoading: true, error: null });
        try {
          const { moments, hasMore } = await momentsService.getFeed(page);
          if (page === 1) {
            set({ moments, isLoading: false });
          } else {
            set((state) => ({ moments: [...state.moments, ...moments], isLoading: false }));
          }
          return hasMore;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          return false;
        }
      },

      // Publish moment
      publishMoment: async (content: string, images?: string[]) => {
        try {
          const moment = await momentsService.publish(content, images);
          set((state) => ({ moments: [moment, ...state.moments] }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Like moment
      likeMoment: async (id: string) => {
        try {
          await momentsService.likeMoment(id);
          set((state) => ({
            moments: state.moments.map((m) =>
              m.id === id
                ? { ...m, hasLiked: !m.hasLiked, likes: m.hasLiked ? m.likes - 1 : m.likes + 1 }
                : m
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Comment moment
      commentMoment: async (id: string, text: string) => {
        try {
          await momentsService.commentMoment(id, text);
          set((state) => ({
            moments: state.moments.map((m) =>
              m.id === id
                ? { ...m, comments: [...m.comments, { user: 'AI User', text, createTime: Date.now() }] }
                : m
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Load favorites
      loadFavorites: async (category = 'all', keyword?: string) => {
        set({ isLoading: true, error: null });
        try {
          const favorites = await favoritesService.getFavorites(category, keyword);
          set({ favorites, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      // Add favorite
      addFavorite: async (item: Partial<FavoriteItem>) => {
        try {
          const favorite = await favoritesService.addFavorite(item);
          set((state) => ({ favorites: [favorite, ...state.favorites] }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Remove favorite
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
    }
  )
);
