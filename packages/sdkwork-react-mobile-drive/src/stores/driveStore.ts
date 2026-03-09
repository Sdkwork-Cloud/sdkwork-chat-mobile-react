import { create } from 'zustand';
import type { DriveState, DriveFile, DriveStats } from '../types';
import { fileService } from '../services/FileService';

interface DriveStore extends DriveState {
  loadFiles: (parentId?: string | null) => Promise<void>;
  loadStats: () => Promise<void>;
  setCurrentFolder: (folderId: string | null) => void;
  uploadFile: (file: File) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
}

export const useDriveStore = create<DriveStore>((set, get) => ({
  files: [],
  currentFolder: null,
  stats: null,
  isLoading: false,
  error: null,

  loadFiles: async (parentId = null) => {
    set({ isLoading: true, error: null });
    try {
      const files = await fileService.getFiles(parentId);
      set({ files, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  loadStats: async () => {
    try {
      const stats = await fileService.getStats();
      set({ stats });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setCurrentFolder: (folderId: string | null) => {
    set({ currentFolder: folderId });
    get().loadFiles(folderId);
  },

  uploadFile: async (file: File) => {
    try {
      const { currentFolder } = get();
      await fileService.uploadFile(file, currentFolder);
      await get().loadFiles(currentFolder);
      await get().loadStats();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteFile: async (id: string) => {
    try {
      await fileService.deleteFile(id);
      const { currentFolder } = get();
      await get().loadFiles(currentFolder);
      await get().loadStats();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
