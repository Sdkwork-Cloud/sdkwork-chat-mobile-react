import { useCallback, useEffect, useRef } from 'react';
import { useCreationStore } from '../stores/creationStore';
import { creationService } from '../services/CreationService';
import type { CreationType } from '../types';

export function useStyles() {
  const styles = useCreationStore((state) => state.styles);
  const isLoading = useCreationStore((state) => state.isLoadingStyles);
  const setStyles = useCreationStore((state) => state.setStyles);
  const setIsLoadingStyles = useCreationStore((state) => state.setIsLoadingStyles);
  const initializedRef = useRef(false);

  const loadStyles = useCallback(async (type?: CreationType) => {
    setIsLoadingStyles(true);
    try {
      const nextStyles = await creationService.getStyles(type);
      setStyles(nextStyles);
      return nextStyles;
    } finally {
      setIsLoadingStyles(false);
    }
  }, [setIsLoadingStyles, setStyles]);

  const getPopularStyles = useCallback(() => {
    return styles.filter((s) => s.isPopular);
  }, [styles]);

  const getNewStyles = useCallback(() => {
    return styles.filter((s) => s.isNew);
  }, [styles]);

  const getStylesByType = useCallback((type: CreationType) => {
    return styles.filter((s) => s.type === type);
  }, [styles]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    void loadStyles();
  }, [loadStyles]);

  return {
    // State
    styles,
    isLoading,
    
    // Actions
    loadStyles,
    getPopularStyles,
    getNewStyles,
    getStylesByType,
  };
}
