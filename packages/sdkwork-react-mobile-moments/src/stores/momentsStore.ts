import { create } from 'zustand';
import type { MomentsState } from '../types';
import { momentsService } from '../services/MomentsService';

interface MomentsStore extends MomentsState {
  loadMoments: (page?: number) => Promise<boolean>;
  publishMoment: (content: string, images?: string[]) => Promise<void>;
  likeMoment: (id: string) => Promise<void>;
  commentMoment: (id: string, text: string) => Promise<void>;
}

export const useMomentsStore = create<MomentsStore>()((set) => ({
  moments: [],
  isLoading: false,
  error: null,

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

  publishMoment: async (content: string, images?: string[]) => {
    try {
      const moment = await momentsService.publish(content, images);
      set((state) => ({ moments: [moment, ...state.moments] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  likeMoment: async (id: string) => {
    try {
      await momentsService.likeMoment(id);
      set((state) => ({
        moments: state.moments.map((m) =>
          m.id === id
            ? { ...m, hasLiked: !m.hasLiked, likes: m.hasLiked ? m.likes - 1 : m.likes + 1 }
            : m,
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  commentMoment: async (id: string, text: string) => {
    try {
      await momentsService.commentMoment(id, text);
      set((state) => ({
        moments: state.moments.map((m) =>
          m.id === id
            ? { ...m, comments: [...m.comments, { user: 'AI User', text, createTime: Date.now() }] }
            : m,
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
