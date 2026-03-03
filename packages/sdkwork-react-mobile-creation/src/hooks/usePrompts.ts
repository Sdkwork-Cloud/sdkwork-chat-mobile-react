import { useCallback, useEffect, useRef } from 'react';
import { useCreationStore } from '../stores/creationStore';
import { creationService } from '../services/CreationService';
import type { CreationType } from '../types';

export function usePrompts() {
  const prompts = useCreationStore((state) => state.prompts);
  const isLoading = useCreationStore((state) => state.isLoadingPrompts);
  const setPrompts = useCreationStore((state) => state.setPrompts);
  const setIsLoadingPrompts = useCreationStore((state) => state.setIsLoadingPrompts);
  const initializedRef = useRef(false);

  const loadPrompts = useCallback(async (type?: CreationType) => {
    setIsLoadingPrompts(true);
    try {
      const nextPrompts = await creationService.getPrompts(type);
      setPrompts(nextPrompts);
      return nextPrompts;
    } finally {
      setIsLoadingPrompts(false);
    }
  }, [setIsLoadingPrompts, setPrompts]);

  const usePrompt = useCallback(async (promptId: string, variables?: Record<string, string>) => {
    await creationService.usePrompt(promptId);
    
    const prompt = prompts.find((p) => p.id === promptId);
    if (!prompt) return null;

    let content = prompt.content;
    
    // Replace variables
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }

    // Update usage count locally
    const updatedPrompts = prompts.map((p) => 
      p.id === promptId ? { ...p, usageCount: p.usageCount + 1 } : p
    );
    setPrompts(updatedPrompts);

    return {
      ...prompt,
      content,
    };
  }, [prompts, setPrompts]);

  const getPromptsByCategory = useCallback((category: string) => {
    return prompts.filter((p) => p.category === category);
  }, [prompts]);

  const getCategories = useCallback(() => {
    const categories = new Set(prompts.map((p) => p.category));
    return Array.from(categories);
  }, [prompts]);

  const getFavoritePrompts = useCallback(() => {
    return prompts.filter((p) => p.isFavorite);
  }, [prompts]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    void loadPrompts();
  }, [loadPrompts]);

  return {
    // State
    prompts,
    isLoading,
    
    // Actions
    loadPrompts,
    usePrompt,
    getPromptsByCategory,
    getCategories,
    getFavoritePrompts,
  };
}
