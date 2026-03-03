import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getPersistStorage } from '@sdkwork/react-mobile-core';
import type { Creation, CreationStyle, CreationPrompt, CreationFilter } from '../types';

interface CreationState {
  // Creations
  creations: Creation[];
  currentCreation: Creation | null;
  favorites: Creation[];
  isLoadingCreations: boolean;
  
  // Styles & Prompts
  styles: CreationStyle[];
  prompts: CreationPrompt[];
  isLoadingStyles: boolean;
  isLoadingPrompts: boolean;
  
  // Filter
  filter: CreationFilter;
  
  // Processing
  processingIds: string[];
  
  // Actions
  setCreations: (creations: Creation[]) => void;
  setCurrentCreation: (creation: Creation | null) => void;
  setFavorites: (favorites: Creation[]) => void;
  setIsLoadingCreations: (loading: boolean) => void;
  
  setStyles: (styles: CreationStyle[]) => void;
  setPrompts: (prompts: CreationPrompt[]) => void;
  setIsLoadingStyles: (loading: boolean) => void;
  setIsLoadingPrompts: (loading: boolean) => void;
  
  setFilter: (filter: CreationFilter) => void;
  
  addProcessingId: (id: string) => void;
  removeProcessingId: (id: string) => void;
  updateCreationProgress: (id: string, progress: number) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  creations: [],
  currentCreation: null,
  favorites: [],
  isLoadingCreations: false,
  
  styles: [],
  prompts: [],
  isLoadingStyles: false,
  isLoadingPrompts: false,
  
  filter: {},
  
  processingIds: [],
};

export const useCreationStore = create<CreationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCreations: (creations) => set({ creations }),
      setCurrentCreation: (currentCreation) => set({ currentCreation }),
      setFavorites: (favorites) => set({ favorites }),
      setIsLoadingCreations: (isLoadingCreations) => set({ isLoadingCreations }),
      
      setStyles: (styles) => set({ styles }),
      setPrompts: (prompts) => set({ prompts }),
      setIsLoadingStyles: (isLoadingStyles) => set({ isLoadingStyles }),
      setIsLoadingPrompts: (isLoadingPrompts) => set({ isLoadingPrompts }),
      
      setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),
      
      addProcessingId: (id) => set({ processingIds: [...get().processingIds, id] }),
      removeProcessingId: (id) => set({ processingIds: get().processingIds.filter(pid => pid !== id) }),
      
      updateCreationProgress: (id, progress) => {
        const { creations } = get();
        const updatedCreations = creations.map(c => 
          c.id === id ? { ...c, progress } : c
        );
        set({ creations: updatedCreations });
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'creation-storage',
      storage: createJSONStorage(getPersistStorage),
      partialize: (state) => ({
        filter: state.filter,
      }),
    }
  )
);
