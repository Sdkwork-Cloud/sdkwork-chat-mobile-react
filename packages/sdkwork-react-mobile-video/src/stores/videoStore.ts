import { create } from 'zustand';
import type { VideoState, Video, VideoType } from '../types';
import { videoService } from '../services/VideoService';

interface VideoStore extends VideoState {
  loadVideos: (type?: VideoType) => Promise<void>;
  likeVideo: (id: string) => Promise<void>;
}

export const useVideoStore = create<VideoStore>((set) => ({
  videos: [],
  isLoading: false,
  error: null,

  loadVideos: async (type?: VideoType) => {
    set({ isLoading: true, error: null });
    try {
      const videos = await videoService.getVideos(type);
      set({ videos, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  likeVideo: async (id: string) => {
    try {
      await videoService.likeVideo(id);
      set((state) => ({
        videos: state.videos.map((v) => (v.id === id ? { ...v, likes: v.likes + 1 } : v)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
