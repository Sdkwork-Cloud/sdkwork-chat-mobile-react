import { useCallback, useEffect, useRef } from 'react';
import { useCreationStore } from '../stores/creationStore';
import { creationService } from '../services/CreationService';
import type { Creation, CreationType, CreationParams, CreationFilter } from '../types';

export function useCreations() {
  const creations = useCreationStore((state) => state.creations);
  const currentCreation = useCreationStore((state) => state.currentCreation);
  const favorites = useCreationStore((state) => state.favorites);
  const isLoading = useCreationStore((state) => state.isLoadingCreations);
  const filter = useCreationStore((state) => state.filter);
  const processingIds = useCreationStore((state) => state.processingIds);

  const setCreations = useCreationStore((state) => state.setCreations);
  const setCurrentCreation = useCreationStore((state) => state.setCurrentCreation);
  const setFavorites = useCreationStore((state) => state.setFavorites);
  const setIsLoadingCreations = useCreationStore((state) => state.setIsLoadingCreations);
  const setFilterState = useCreationStore((state) => state.setFilter);
  const addProcessingId = useCreationStore((state) => state.addProcessingId);
  const removeProcessingId = useCreationStore((state) => state.removeProcessingId);

  const initializedRef = useRef(false);

  const loadCreations = useCallback(async (filter?: CreationFilter) => {
    setIsLoadingCreations(true);
    try {
      const nextCreations = await creationService.getCreations(filter);
      setCreations(nextCreations);
      return nextCreations;
    } finally {
      setIsLoadingCreations(false);
    }
  }, [setCreations, setIsLoadingCreations]);

  const loadCreation = useCallback(async (id: string) => {
    setIsLoadingCreations(true);
    try {
      const creation = await creationService.getCreationById(id);
      setCurrentCreation(creation);
      return creation;
    } finally {
      setIsLoadingCreations(false);
    }
  }, [setCurrentCreation, setIsLoadingCreations]);

  const createCreation = useCallback(async (params: {
    type: CreationType;
    title: string;
    prompt: string;
    description?: string;
    negativePrompt?: string;
    params?: CreationParams;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    const creation = await creationService.createCreation(params);
    const state = useCreationStore.getState();
    setCreations([creation, ...state.creations]);
    setCurrentCreation(creation);
    addProcessingId(creation.id);
    return creation;
  }, [addProcessingId, setCreations, setCurrentCreation]);

  const deleteCreation = useCallback(async (id: string) => {
    await creationService.deleteCreation(id);
    const state = useCreationStore.getState();
    setCreations(state.creations.filter((c) => c.id !== id));
    if (state.currentCreation?.id === id) {
      setCurrentCreation(null);
    }
  }, [setCreations, setCurrentCreation]);

  const toggleFavorite = useCallback(async (id: string) => {
    const isFavorite = await creationService.toggleFavorite(id);
    // Update local state
    const state = useCreationStore.getState();
    const updatedCreations = state.creations.map((c) => 
      c.id === id ? { ...c, isFavorite } : c
    );
    setCreations(updatedCreations);
    if (state.currentCreation?.id === id) {
      setCurrentCreation({ ...state.currentCreation, isFavorite });
    }
    // Refresh favorites
    const nextFavorites = await creationService.getFavorites();
    setFavorites(nextFavorites);
    return isFavorite;
  }, [setCreations, setCurrentCreation, setFavorites]);

  const loadFavorites = useCallback(async () => {
    const nextFavorites = await creationService.getFavorites();
    setFavorites(nextFavorites);
    return nextFavorites;
  }, [setFavorites]);

  const setFilter = useCallback((nextFilter: CreationFilter) => {
    setFilterState(nextFilter);
    // Reload with new filter
    const state = useCreationStore.getState();
    loadCreations({ ...state.filter, ...nextFilter });
  }, [loadCreations, setFilterState]);

  const initialize = useCallback(async () => {
    await creationService.initialize();
    await loadCreations();
  }, [loadCreations]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    void initialize();
  }, [initialize]);

  // Listen for creation events
  useEffect(() => {
    const unsubscribers: (() => void)[] = [
      creationService.onCreationUpdated((creation: Creation) => {
        const state = useCreationStore.getState();
        const updatedCreations = state.creations.map((c: Creation) =>
          c.id === creation.id ? creation : c
        );
        setCreations(updatedCreations);
        if (state.currentCreation?.id === creation.id) {
          setCurrentCreation(creation);
        }
        if (creation.status === 'completed' || creation.status === 'failed') {
          removeProcessingId(creation.id);
        }
      }),
      creationService.onCreationDeleted((id: string) => {
        const state = useCreationStore.getState();
        setCreations(state.creations.filter((c: Creation) => c.id !== id));
        if (state.currentCreation?.id === id) {
          setCurrentCreation(null);
        }
      }),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [removeProcessingId, setCreations, setCurrentCreation]);

  return {
    // State
    creations,
    currentCreation,
    favorites,
    isLoading,
    filter,
    processingIds,
    hasProcessing: processingIds.length > 0,
    
    // Actions
    loadCreations,
    loadCreation,
    createCreation,
    deleteCreation,
    toggleFavorite,
    loadFavorites,
    setFilter,
    initialize,
  };
}
