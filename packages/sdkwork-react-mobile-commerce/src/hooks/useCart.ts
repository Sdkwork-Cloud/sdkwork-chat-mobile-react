import { useCallback, useEffect, useRef } from 'react';
import { useCommerceStore } from '../stores/commerceStore';
import { cartService } from '../services/CartService';
import type { CartItem, CartShopGroup } from '../types';

type CartPayload = {
  items: CartItem[];
  totalCount: number;
  selectedCount: number;
  totalAmount: number;
  selectedAmount: number;
  shopGroups: CartShopGroup[];
};

export function useCart() {
  const cart = useCommerceStore((state) => state.cart);
  const isLoading = useCommerceStore((state) => state.isLoadingCart);
  const setCart = useCommerceStore((state) => state.setCart);
  const setIsLoadingCart = useCommerceStore((state) => state.setIsLoadingCart);
  const loadTaskRef = useRef<Promise<CartPayload> | null>(null);

  const loadCart = useCallback(async () => {
    if (loadTaskRef.current) {
      return loadTaskRef.current;
    }
    const task = (async () => {
      setIsLoadingCart(true);
      try {
        const nextCart = await cartService.getCart();
        setCart(nextCart);
        return nextCart;
      } finally {
        setIsLoadingCart(false);
      }
    })();
    loadTaskRef.current = task;
    task.finally(() => {
      if (loadTaskRef.current === task) {
        loadTaskRef.current = null;
      }
    });
    return task;
  }, [setCart, setIsLoadingCart]);

  const addToCart = useCallback(
    async (item: Omit<CartItem, 'id' | 'addedAt'>) => {
      const nextCart = await cartService.addToCart(item);
      setCart(nextCart);
      return nextCart;
    },
    [setCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const nextCart = await cartService.updateQuantity(itemId, quantity);
      setCart(nextCart);
      return nextCart;
    },
    [setCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const nextCart = await cartService.removeItem(itemId);
      setCart(nextCart);
      return nextCart;
    },
    [setCart]
  );

  const selectItem = useCallback(
    async (itemId: string, isSelected: boolean) => {
      const nextCart = await cartService.selectItem(itemId, isSelected);
      setCart(nextCart);
      return nextCart;
    },
    [setCart]
  );

  const selectShop = useCallback(
    async (shopId: string, isSelected: boolean) => {
      const nextCart = await cartService.selectShop(shopId, isSelected);
      setCart(nextCart);
      return nextCart;
    },
    [setCart]
  );

  const selectAll = useCallback(
    async (isSelected: boolean) => {
      const nextCart = await cartService.selectAll(isSelected);
      setCart(nextCart);
      return nextCart;
    },
    [setCart]
  );

  const clearCart = useCallback(async () => {
    await cartService.clearCart();
    setCart({
      items: [],
      totalCount: 0,
      selectedCount: 0,
      totalAmount: 0,
      selectedAmount: 0,
      shopGroups: [],
    });
  }, [setCart]);

  const clearSelected = useCallback(async () => {
    const nextCart = await cartService.clearSelected();
    setCart(nextCart);
    return nextCart;
  }, [setCart]);

  const getSelectedItems = useCallback(async () => {
    return cartService.getSelectedItems();
  }, []);

  useEffect(() => {
    const unsubscribe = cartService.onCartUpdated((nextCart: CartPayload) => {
      setCart(nextCart);
    });
    return unsubscribe;
  }, [setCart]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  return {
    cart,
    isLoading,
    itemCount: cart?.totalCount || 0,
    selectedCount: cart?.selectedCount || 0,
    selectedAmount: cart?.selectedAmount || 0,
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    selectItem,
    selectShop,
    selectAll,
    clearCart,
    clearSelected,
    getSelectedItems,
  };
}
