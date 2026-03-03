import { useEffect, useState } from 'react';
import { discoverService } from '../services/DiscoverService';
import type { DiscoverItem } from '../types';

export function useDiscover() {
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    discoverService.getDiscoverItems().then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, []);

  return { items, isLoading };
}
