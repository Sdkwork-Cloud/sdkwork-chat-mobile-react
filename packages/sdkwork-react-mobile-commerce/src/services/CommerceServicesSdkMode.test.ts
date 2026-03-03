import { describe, expect, it } from 'vitest';
import type { ServiceFactoryDeps } from '@sdkwork/react-mobile-core';
import type {
  Cart,
  CreateOrderParams,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductCategory,
  ProductQueryParams,
} from '../types';
import { createProductServiceWithSdk } from './ProductService';
import { createCartServiceWithSdk } from './CartService';
import { createOrderServiceWithSdk } from './OrderService';
import type { CommerceSdkError, ICommerceSdkService } from './CommerceSdkService';

interface TestRuntime {
  deps: ServiceFactoryDeps;
}

function createTestRuntime(): TestRuntime {
  const runtimeStorage = new Map<string, unknown>();
  let sequence = 0;
  let now = 1710000000000;

  const deps: ServiceFactoryDeps = {
    storage: {
      get: <T>(key: string) => runtimeStorage.get(key) as T | null | undefined,
      set: <T>(key: string, value: T) => {
        runtimeStorage.set(key, value);
      },
      remove: (key: string) => {
        runtimeStorage.delete(key);
      },
    },
    eventBus: {
      emit: () => {
        // no-op for unit tests
      },
      on: () => () => {
        // no-op unsubscribe
      },
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
    clock: {
      now: () => now,
    },
    idGenerator: {
      next: (prefix?: string) => {
        sequence += 1;
        return `${prefix || 'id'}_${sequence}`;
      },
    },
    command: {
      execute: async () => ({ success: false, error: 'Command executor not configured' }),
    },
  };

  return { deps };
}

function createSampleProduct(id = 'prod_remote_1'): Product {
  return {
    id,
    name: 'Remote Product',
    description: 'Mapped from SDK',
    price: 99,
    originalPrice: 109,
    images: ['https://example.com/p1.png'],
    thumbnail: 'https://example.com/p1-thumb.png',
    category: {
      id: 'cat_remote',
      name: 'Remote Category',
    },
    tags: ['remote'],
    rating: 4.5,
    reviewCount: 10,
    salesCount: 20,
    stock: 100,
    sku: 'SKU-1',
    specifications: {},
    shopId: 'shop_remote_1',
    shopName: 'Remote Shop',
    isFavorite: false,
    createdAt: new Date(1710000000000).toISOString(),
    updatedAt: new Date(1710000000000).toISOString(),
  };
}

function createSampleCart(): Cart {
  return {
    items: [
      {
        id: 'cart_item_1',
        productId: 'prod_remote_1',
        productName: 'Remote Product',
        productImage: 'https://example.com/p1.png',
        price: 99,
        quantity: 2,
        selectedVariants: { color: 'black' },
        shopId: 'shop_remote_1',
        shopName: 'Remote Shop',
        isSelected: true,
        addedAt: new Date(1710000000000).toISOString(),
      },
    ],
    totalCount: 2,
    selectedCount: 2,
    totalAmount: 198,
    selectedAmount: 198,
    shopGroups: [
      {
        shopId: 'shop_remote_1',
        shopName: 'Remote Shop',
        items: [],
        isSelected: true,
        subtotal: 198,
      },
    ],
  };
}

function createSampleOrder(status: OrderStatus = 'pending_payment'): Order {
  return {
    id: 'order_remote_1',
    orderNo: 'ORD202603030001',
    userId: 'user_remote',
    status,
    items: [
      {
        id: 'order_item_1',
        productId: 'prod_remote_1',
        productName: 'Remote Product',
        productImage: 'https://example.com/p1.png',
        price: 99,
        quantity: 2,
        selectedVariants: { color: 'black' },
        subtotal: 198,
      },
    ],
    totalAmount: 198,
    discountAmount: 0,
    shippingAmount: 0,
    finalAmount: 198,
    paymentMethod: 'wechat_pay',
    shippingAddress: {
      id: 'addr_remote_1',
      name: 'Remote User',
      phone: '13800000000',
      province: 'Shanghai',
      city: 'Shanghai',
      district: 'Pudong',
      detail: 'No.1 Road',
      isDefault: true,
    },
    createdAt: new Date(1710000000000).toISOString(),
    updatedAt: new Date(1710000000000).toISOString(),
  };
}

function createSdkStub(overrides?: Partial<ICommerceSdkService>): ICommerceSdkService {
  return {
    hasSdkBaseUrl: () => false,
    getLastError: () => null,
    listProducts: async (_params?: ProductQueryParams) => null,
    getProductById: async (_id: string) => null,
    listCategories: async () => null,
    getCart: async () => null,
    addCartItem: async (_item) => null,
    updateCartItemQuantity: async (_itemId: string, _quantity: number) => null,
    removeCartItem: async (_itemId: string) => null,
    updateCartItemSelection: async (_itemId: string, _selected: boolean) => null,
    batchUpdateCartSelection: async (_itemIds: string[] | undefined, _selected: boolean) => null,
    clearCart: async () => null,
    getSelectedCartItems: async () => null,
    listOrders: async () => null,
    createOrder: async (_params: CreateOrderParams) => null,
    getOrderDetail: async (_orderId: string) => null,
    payOrder: async (_orderId: string, _method: PaymentMethod) => null,
    cancelOrder: async (_orderId: string, _reason?: string) => null,
    confirmOrder: async (_orderId: string) => null,
    refundOrder: async (_orderId: string, _reason: string) => null,
    getOrderStatistics: async () => null,
    ...overrides,
  };
}

describe('Commerce services sdk mode integration', () => {
  it('ProductService uses sdk list result in sdk mode', async () => {
    const runtime = createTestRuntime();
    const remoteProduct = createSampleProduct();
    const remoteCategories: ProductCategory[] = [{ id: 'cat_remote', name: 'Remote Category' }];
    const service = createProductServiceWithSdk(
      runtime.deps,
      createSdkStub({
        hasSdkBaseUrl: () => true,
        listProducts: async () => ({
          products: [remoteProduct],
          total: 1,
        }),
        listCategories: async () => remoteCategories,
      }),
    );

    const productsResult = await service.getProducts({ page: 1, pageSize: 10 });
    const categoriesResult = await service.getCategories();

    expect(productsResult.total).toBe(1);
    expect(productsResult.products).toHaveLength(1);
    expect(productsResult.products[0].id).toBe('prod_remote_1');
    expect(categoriesResult).toHaveLength(1);
    expect(categoriesResult[0].id).toBe('cat_remote');
  });

  it('ProductService throws sdk error when sdk mode request fails', async () => {
    const runtime = createTestRuntime();
    const sdkError: CommerceSdkError = {
      code: '5001',
      message: 'Remote product list failed',
    };
    const service = createProductServiceWithSdk(
      runtime.deps,
      createSdkStub({
        hasSdkBaseUrl: () => true,
        getLastError: () => sdkError,
        listProducts: async () => null,
      }),
    );

    await expect(service.getProducts()).rejects.toThrow('Remote product list failed');
  });

  it('CartService uses sdk mutation result in sdk mode', async () => {
    const runtime = createTestRuntime();
    const remoteCart = createSampleCart();
    const service = createCartServiceWithSdk(
      runtime.deps,
      createSdkStub({
        hasSdkBaseUrl: () => true,
        addCartItem: async () => remoteCart,
      }),
    );

    const updated = await service.addToCart({
      productId: 'prod_remote_1',
      productName: 'Remote Product',
      productImage: 'https://example.com/p1.png',
      price: 99,
      quantity: 2,
      shopId: 'shop_remote_1',
      shopName: 'Remote Shop',
      isSelected: true,
      selectedVariants: { color: 'black' },
    });

    expect(updated.totalCount).toBe(2);
    expect(updated.selectedAmount).toBe(198);
    expect(updated.items[0].id).toBe('cart_item_1');
  });

  it('OrderService uses sdk create and statistics in sdk mode', async () => {
    const runtime = createTestRuntime();
    const createdOrder = createSampleOrder('pending_payment');
    const paidOrder = createSampleOrder('paid');
    const service = createOrderServiceWithSdk(
      runtime.deps,
      createSdkStub({
        hasSdkBaseUrl: () => true,
        createOrder: async () => createdOrder,
        payOrder: async () => paidOrder,
        getOrderStatistics: async () => ({
          pending_payment: 1,
          paid: 2,
          processing: 0,
          shipped: 0,
          delivered: 0,
          completed: 3,
          cancelled: 0,
          refunding: 0,
          refunded: 0,
        }),
      }),
    );

    const order = await service.createOrder({
      items: [
        {
          productId: 'prod_remote_1',
          productName: 'Remote Product',
          productImage: 'https://example.com/p1.png',
          quantity: 2,
          price: 99,
          selectedVariants: { color: 'black' },
        },
      ],
      shippingAddress: createdOrder.shippingAddress,
      paymentMethod: 'wechat_pay',
      shippingAmount: 0,
      discountAmount: 0,
    });
    expect(order.id).toBe('order_remote_1');

    const paid = await service.payOrder('order_remote_1');
    expect(paid.status).toBe('paid');

    const counts = await service.getOrderCountByStatus();
    expect(counts.completed).toBe(3);
    expect(counts.pending_payment).toBe(1);
  });
});
