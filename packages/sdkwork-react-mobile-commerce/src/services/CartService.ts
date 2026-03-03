import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { CartItem, Cart, CartShopGroup, ICartService } from '../types';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import { createCommerceSdkService } from './CommerceSdkService';
import type { ICommerceSdkService } from './CommerceSdkService';

const TAG = 'CartService';

const STORAGE_KEY = 'sys_commerce_cart_v2';

const CART_EVENTS = {
  UPDATED: 'cart:updated',
} as const;

class CartServiceImpl implements ICartService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: ICommerceSdkService;

  constructor(deps?: ServiceFactoryDeps, sdkService?: ICommerceSdkService) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = sdkService || createCommerceSdkService(deps);
  }

  private async getItemsFromStorage(): Promise<CartItem[]> {
    const value = await Promise.resolve(this.deps.storage.get<CartItem[]>(STORAGE_KEY));
    return value || [];
  }

  private async saveItemsToStorage(items: CartItem[]): Promise<void> {
    await Promise.resolve(this.deps.storage.set(STORAGE_KEY, items));
  }

  private nowIso(): string {
    return new Date(this.deps.clock.now()).toISOString();
  }

  private sdkErrorMessage(defaultMessage: string): string {
    const sdkError = this.sdkService.getLastError();
    return sdkError?.message || defaultMessage;
  }

  private emitUpdated(cart: Cart): void {
    this.deps.eventBus.emit(CART_EVENTS.UPDATED, cart);
  }

  async getCart(): Promise<Cart> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteCart = await this.sdkService.getCart();
      if (!remoteCart) {
        const message = this.sdkErrorMessage('Failed to load cart');
        this.deps.logger.warn(TAG, 'SDK getCart failed', { message });
        throw new Error(message);
      }
      return remoteCart;
    }

    const items = await this.getItemsFromStorage();
    return this.calculateCart(items);
  }

  async addToCart(item: Omit<CartItem, 'id' | 'addedAt'>): Promise<Cart> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteCart = await this.sdkService.addCartItem(item);
      if (!remoteCart) {
        const message = this.sdkErrorMessage('Failed to add item to cart');
        this.deps.logger.warn(TAG, 'SDK addToCart failed', { message, productId: item.productId });
        throw new Error(message);
      }
      this.emitUpdated(remoteCart);
      return remoteCart;
    }

    const items = await this.getItemsFromStorage();

    // Check if same product with same variants exists
    const existingIndex = items.findIndex(i => 
      i.productId === item.productId && 
      JSON.stringify(i.selectedVariants) === JSON.stringify(item.selectedVariants)
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity;
      if (item.isSelected) {
        items[existingIndex].isSelected = true;
      }
    } else {
      items.push({
        ...item,
        id: this.deps.idGenerator.next('cart'),
        addedAt: this.nowIso(),
      });
    }

    await this.saveItemsToStorage(items);
    const cart = this.calculateCart(items);
    
    this.emitUpdated(cart);
    return cart;
  }

  async updateQuantity(itemId: string, quantity: number): Promise<Cart> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteCart = await this.sdkService.updateCartItemQuantity(itemId, quantity);
      if (!remoteCart) {
        const message = this.sdkErrorMessage('Failed to update cart quantity');
        this.deps.logger.warn(TAG, 'SDK updateQuantity failed', { message, itemId, quantity });
        throw new Error(message);
      }
      this.emitUpdated(remoteCart);
      return remoteCart;
    }

    const items = await this.getItemsFromStorage();
    
    const index = items.findIndex(i => i.id === itemId);
    if (index >= 0) {
      if (quantity <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantity = quantity;
      }
    }

    await this.saveItemsToStorage(items);
    const cart = this.calculateCart(items);
    
    this.emitUpdated(cart);
    return cart;
  }

  async removeItem(itemId: string): Promise<Cart> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteCart = await this.sdkService.removeCartItem(itemId);
      if (!remoteCart) {
        const message = this.sdkErrorMessage('Failed to remove cart item');
        this.deps.logger.warn(TAG, 'SDK removeItem failed', { message, itemId });
        throw new Error(message);
      }
      this.emitUpdated(remoteCart);
      return remoteCart;
    }

    const items = await this.getItemsFromStorage();
    
    const filtered = items.filter(i => i.id !== itemId);
    await this.saveItemsToStorage(filtered);
    
    const cart = this.calculateCart(filtered);
    this.emitUpdated(cart);
    return cart;
  }

  async selectItem(itemId: string, isSelected: boolean): Promise<Cart> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteCart = await this.sdkService.updateCartItemSelection(itemId, isSelected);
      if (!remoteCart) {
        const message = this.sdkErrorMessage('Failed to update cart item selection');
        this.deps.logger.warn(TAG, 'SDK selectItem failed', { message, itemId, isSelected });
        throw new Error(message);
      }
      this.emitUpdated(remoteCart);
      return remoteCart;
    }

    const items = await this.getItemsFromStorage();
    
    const item = items.find(i => i.id === itemId);
    if (item) {
      item.isSelected = isSelected;
    }

    await this.saveItemsToStorage(items);
    const cart = this.calculateCart(items);
    
    this.emitUpdated(cart);
    return cart;
  }

  async selectShop(shopId: string, isSelected: boolean): Promise<Cart> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const current = await this.getCart();
      const targetItemIds = current.items.filter((item) => item.shopId === shopId).map((item) => item.id);
      if (targetItemIds.length === 0) {
        return current;
      }

      let latestCart: Cart = current;
      for (const itemId of targetItemIds) {
        const updated = await this.sdkService.updateCartItemSelection(itemId, isSelected);
        if (!updated) {
          const message = this.sdkErrorMessage('Failed to update shop selection');
          this.deps.logger.warn(TAG, 'SDK selectShop failed', { message, shopId, itemId, isSelected });
          throw new Error(message);
        }
        latestCart = updated;
      }

      this.emitUpdated(latestCart);
      return latestCart;
    }

    const items = await this.getItemsFromStorage();
    
    items.forEach(item => {
      if (item.shopId === shopId) {
        item.isSelected = isSelected;
      }
    });

    await this.saveItemsToStorage(items);
    const cart = this.calculateCart(items);
    
    this.emitUpdated(cart);
    return cart;
  }

  async selectAll(isSelected: boolean): Promise<Cart> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const current = await this.getCart();
      const allItemIds = current.items.map((item) => item.id);
      if (allItemIds.length === 0) {
        return current;
      }

      const batchUpdated = await this.sdkService.batchUpdateCartSelection(allItemIds, isSelected);
      if (batchUpdated) {
        this.emitUpdated(batchUpdated);
        return batchUpdated;
      }

      let latestCart: Cart = current;
      for (const itemId of allItemIds) {
        const updated = await this.sdkService.updateCartItemSelection(itemId, isSelected);
        if (!updated) {
          const message = this.sdkErrorMessage('Failed to update selection for all cart items');
          this.deps.logger.warn(TAG, 'SDK selectAll failed', { message, itemId, isSelected });
          throw new Error(message);
        }
        latestCart = updated;
      }
      this.emitUpdated(latestCart);
      return latestCart;
    }

    const items = await this.getItemsFromStorage();
    
    items.forEach(item => {
      item.isSelected = isSelected;
    });

    await this.saveItemsToStorage(items);
    const cart = this.calculateCart(items);
    
    this.emitUpdated(cart);
    return cart;
  }

  async clearCart(): Promise<void> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteCart = await this.sdkService.clearCart();
      if (!remoteCart) {
        const message = this.sdkErrorMessage('Failed to clear cart');
        this.deps.logger.warn(TAG, 'SDK clearCart failed', { message });
        throw new Error(message);
      }
      this.emitUpdated(remoteCart);
      return;
    }

    await Promise.resolve(this.deps.storage.remove(STORAGE_KEY));
    this.emitUpdated(this.calculateCart([]));
  }

  async clearSelected(): Promise<Cart> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const current = await this.getCart();
      const selectedIds = current.items.filter((item) => item.isSelected).map((item) => item.id);
      if (selectedIds.length === 0) return current;

      let latestCart: Cart = current;
      for (const itemId of selectedIds) {
        const updated = await this.sdkService.removeCartItem(itemId);
        if (!updated) {
          const message = this.sdkErrorMessage('Failed to clear selected cart items');
          this.deps.logger.warn(TAG, 'SDK clearSelected failed', { message, itemId });
          throw new Error(message);
        }
        latestCart = updated;
      }

      this.emitUpdated(latestCart);
      return latestCart;
    }

    const items = await this.getItemsFromStorage();
    
    const remaining = items.filter(i => !i.isSelected);
    await this.saveItemsToStorage(remaining);
    
    const cart = this.calculateCart(remaining);
    this.emitUpdated(cart);
    return cart;
  }

  async getSelectedItems(): Promise<CartItem[]> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const selectedItems = await this.sdkService.getSelectedCartItems();
      if (!selectedItems) {
        const message = this.sdkErrorMessage('Failed to load selected cart items');
        this.deps.logger.warn(TAG, 'SDK getSelectedItems failed', { message });
        throw new Error(message);
      }
      return selectedItems;
    }

    const items = await this.getItemsFromStorage();
    return items.filter(i => i.isSelected);
  }

  onCartUpdated(handler: (cart: Cart) => void): () => void {
    return this.deps.eventBus.on(CART_EVENTS.UPDATED, handler);
  }

  private calculateCart(items: CartItem[]): Cart {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const selectedItems = items.filter(i => i.isSelected);
    const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const selectedAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Group by shop
    const shopMap = new Map<string, CartShopGroup>();
    items.forEach(item => {
      if (!shopMap.has(item.shopId)) {
        shopMap.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shopName,
          items: [],
          isSelected: true,
          subtotal: 0,
        });
      }
      const group = shopMap.get(item.shopId)!;
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
      if (!item.isSelected) {
        group.isSelected = false;
      }
    });

    return {
      items,
      totalCount,
      selectedCount,
      totalAmount,
      selectedAmount,
      shopGroups: Array.from(shopMap.values()),
    };
  }
}

export function createCartService(_deps?: ServiceFactoryDeps): ICartService {
  return new CartServiceImpl(_deps);
}

export function createCartServiceWithSdk(_deps?: ServiceFactoryDeps, sdkService?: ICommerceSdkService): ICartService {
  return new CartServiceImpl(_deps, sdkService);
}

export const cartService: ICartService = createCartService();

