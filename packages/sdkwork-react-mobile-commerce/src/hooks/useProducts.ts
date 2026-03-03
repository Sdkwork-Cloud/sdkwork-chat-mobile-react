import { useCallback, useEffect, useRef } from 'react';
import { useCommerceStore } from '../stores/commerceStore';
import { productService } from '../services/ProductService';
import type { Product } from '../types';

export function useProducts() {
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);
  const currentProduct = useCommerceStore((state) => state.currentProduct);
  const favorites = useCommerceStore((state) => state.favorites);
  const isLoading = useCommerceStore((state) => state.isLoadingProducts);
  const setProducts = useCommerceStore((state) => state.setProducts);
  const setCategories = useCommerceStore((state) => state.setCategories);
  const setCurrentProduct = useCommerceStore((state) => state.setCurrentProduct);
  const setFavorites = useCommerceStore((state) => state.setFavorites);
  const setIsLoadingProducts = useCommerceStore((state) => state.setIsLoadingProducts);
  const loadStateRef = useRef<{
    key: string;
    task: Promise<{ products: Product[]; total: number }> | null;
  }>({ key: '', task: null });

  const loadProducts = useCallback(
    async (params?: Parameters<typeof productService.getProducts>[0]) => {
      const requestKey = JSON.stringify(params || {});
      if (loadStateRef.current.task && loadStateRef.current.key === requestKey) {
        return loadStateRef.current.task;
      }

      const task = (async () => {
        setIsLoadingProducts(true);
        try {
          const { products: nextProducts, total } = await productService.getProducts(params);
          setProducts(nextProducts);
          return { products: nextProducts, total };
        } finally {
          setIsLoadingProducts(false);
        }
      })();

      loadStateRef.current = { key: requestKey, task };
      task.finally(() => {
        if (loadStateRef.current.task === task) {
          loadStateRef.current.task = null;
        }
      });
      return task;
    },
    [setIsLoadingProducts, setProducts]
  );

  const loadCategories = useCallback(async () => {
    const nextCategories = await productService.getCategories();
    setCategories(nextCategories);
    return nextCategories;
  }, [setCategories]);

  const loadProduct = useCallback(
    async (id: string) => {
      setIsLoadingProducts(true);
      try {
        const product = await productService.getProductById(id);
        setCurrentProduct(product);
        return product;
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [setCurrentProduct, setIsLoadingProducts]
  );

  const loadFavorites = useCallback(async () => {
    const nextFavorites = await productService.getFavorites();
    setFavorites(nextFavorites);
    return nextFavorites;
  }, [setFavorites]);

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const isFavorite = await productService.toggleFavorite(productId);

      const target = products.find((product) => product.id === productId);
      if (target) {
        setProducts(
          products.map((product) =>
            product.id === productId ? { ...product, isFavorite } : product
          )
        );
      }

      if (currentProduct?.id === productId) {
        setCurrentProduct({ ...currentProduct, isFavorite });
      }

      await loadFavorites();
      return isFavorite;
    },
    [currentProduct, loadFavorites, products, setCurrentProduct, setProducts]
  );

  const initialize = useCallback(async () => {
    await productService.initialize();
    if (categories.length > 0) {
      return;
    }
    await loadCategories();
  }, [categories.length, loadCategories]);

  useEffect(() => {
    if (categories.length > 0) return;
    void initialize();
  }, [categories.length, initialize]);

  return {
    products,
    categories,
    currentProduct,
    favorites,
    isLoading,
    loadProducts,
    loadCategories,
    loadProduct,
    loadFavorites,
    toggleFavorite,
    initialize,
  };
}
