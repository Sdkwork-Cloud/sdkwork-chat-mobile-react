import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  Cart,
  CartItem,
  CreateOrderParams,
  Order,
  OrderQueryParams,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductCategory,
  ProductQueryParams,
  ShippingAddress,
} from '../types';

const TAG = 'CommerceSdkService';
const APP_API_PREFIX = '/app/v3/api';
const AUTH_TOKEN_STORAGE_KEY = 'sys_auth_token';

interface SdkApiResult<T> {
  data: T;
  code: string;
  msg: string;
  requestId?: string;
}

export interface CommerceSdkError {
  code?: string;
  message: string;
}

export interface ICommerceSdkService {
  hasSdkBaseUrl(): boolean;
  getLastError(): CommerceSdkError | null;
  listProducts(params?: ProductQueryParams): Promise<{ products: Product[]; total: number } | null>;
  getProductById(id: string): Promise<Product | null>;
  listCategories(): Promise<ProductCategory[] | null>;
  getCart(): Promise<Cart | null>;
  addCartItem(item: Omit<CartItem, 'id' | 'addedAt'>): Promise<Cart | null>;
  updateCartItemQuantity(itemId: string, quantity: number): Promise<Cart | null>;
  removeCartItem(itemId: string): Promise<Cart | null>;
  updateCartItemSelection(itemId: string, selected: boolean): Promise<Cart | null>;
  batchUpdateCartSelection(itemIds: string[] | undefined, selected: boolean): Promise<Cart | null>;
  clearCart(): Promise<Cart | null>;
  getSelectedCartItems(): Promise<CartItem[] | null>;
  listOrders(params?: OrderQueryParams): Promise<{ orders: Order[]; total: number } | null>;
  createOrder(params: CreateOrderParams): Promise<Order | null>;
  getOrderDetail(orderId: string): Promise<Order | null>;
  payOrder(orderId: string, method: PaymentMethod): Promise<Order | null>;
  cancelOrder(orderId: string, reason?: string): Promise<Order | null>;
  confirmOrder(orderId: string): Promise<Order | null>;
  refundOrder(orderId: string, reason: string): Promise<Order | null>;
  getOrderStatistics(): Promise<Record<OrderStatus, number> | null>;
}

class CommerceSdkServiceImpl implements ICommerceSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private lastError: CommerceSdkError | null = null;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private resolveEnv(name: string): string | undefined {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name];
  }

  private resolveBaseUrl(): string {
    return (this.resolveEnv('VITE_API_BASE_URL') || '').trim().replace(/\/+$/g, '');
  }

  hasSdkBaseUrl(): boolean {
    return this.resolveBaseUrl().length > 0;
  }

  getLastError(): CommerceSdkError | null {
    return this.lastError;
  }

  private setLastError(error: CommerceSdkError | null): void {
    this.lastError = error;
  }

  private buildAppApiPath(path: string): string {
    const prefixRaw = APP_API_PREFIX.trim();
    const prefix = prefixRaw ? `/${prefixRaw.replace(/^\/+|\/+$/g, '')}` : '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (!prefix || prefix === '/') return normalized;
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) return normalized;
    return `${prefix}${normalized}`;
  }

  private appendQuery(path: string, query?: Record<string, unknown>): string {
    if (!query) return path;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== '') params.append(key, String(item));
        });
        return;
      }
      params.append(key, String(value));
    });
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    return `${this.resolveBaseUrl()}${this.appendQuery(this.buildAppApiPath(path), query)}`;
  }

  private async resolveAuthHeaders(options?: { includeContentType?: boolean }): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (options?.includeContentType !== false) headers['Content-Type'] = 'application/json';

    const envToken = this.resolveEnv('VITE_ACCESS_TOKEN');
    const storageToken = await Promise.resolve(this.deps.storage.get<string>(AUTH_TOKEN_STORAGE_KEY));
    const token = (envToken || storageToken || '').trim();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === '2000';
  }

  private async requestJson<T>(
    path: string,
    init: RequestInit,
    options?: { includeContentType?: boolean; query?: Record<string, unknown> }
  ): Promise<T> {
    if (typeof fetch !== 'function') throw new Error('Global fetch is not available');
    const headers = await this.resolveAuthHeaders(options);
    const response = await fetch(this.buildUrl(path, options?.query), {
      ...init,
      headers: {
        ...headers,
        ...(init.headers || {}),
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return (await response.json()) as T;
  }

  private toNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  }

  private toId(value: unknown, fallback = ''): string {
    if (typeof value === 'string') return value.trim() || fallback;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return fallback;
  }

  private toPositiveInt(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.floor(value);
    if (typeof value === 'string') {
      const direct = Number(value.trim());
      if (Number.isFinite(direct) && direct > 0) return Math.floor(direct);
      const matched = value.match(/\d+/);
      if (matched) return Number(matched[0]);
    }
    return null;
  }

  private toIso(value: unknown, fallbackMs: number): string {
    if (typeof value === 'string' && value.trim()) {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
    }
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return new Date(value).toISOString();
    }
    return new Date(fallbackMs).toISOString();
  }

  private extractList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const keys = ['content', 'items', 'records', 'list'];
      for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value as T[];
      }
    }
    return [];
  }

  private extractPage<T>(data: unknown): { list: T[]; total: number } {
    if (data && typeof data === 'object') {
      const source = data as Record<string, unknown>;
      const list = this.extractList<T>(data);
      const total = this.toNumber(source.totalElements ?? source.total ?? source.count, list.length);
      return { list, total };
    }
    return { list: [], total: 0 };
  }

  private failBusiness(result: { code?: string; msg?: string }, fallback: string): null {
    this.setLastError({ code: result.code, message: result.msg || fallback });
    this.deps.logger.warn(TAG, fallback, { code: result.code, message: result.msg });
    return null;
  }

  private failRequest(error: unknown, fallback: string): null {
    const message = error instanceof Error ? error.message : fallback;
    this.setLastError({ message });
    this.deps.logger.warn(TAG, fallback, error);
    return null;
  }

  private mapOrderStatus(value: unknown): OrderStatus {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase().replace(/[\s-]+/g, '_') : '';
    if (['paid'].includes(normalized)) return 'paid';
    if (['processing', 'pending_shipment'].includes(normalized)) return 'processing';
    if (['shipped'].includes(normalized)) return 'shipped';
    if (['delivered', 'pending_receipt'].includes(normalized)) return 'delivered';
    if (['completed', 'complete'].includes(normalized)) return 'completed';
    if (['cancelled', 'canceled', 'closed'].includes(normalized)) return 'cancelled';
    if (['refunding', 'refund_pending'].includes(normalized)) return 'refunding';
    if (['refunded'].includes(normalized)) return 'refunded';
    return 'pending_payment';
  }

  private mapPaymentMethod(value: unknown): PaymentMethod {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase().replace(/[\s-]+/g, '_') : '';
    if (['alipay'].includes(normalized)) return 'alipay';
    if (['credit_card', 'card'].includes(normalized)) return 'credit_card';
    if (['balance', 'wallet'].includes(normalized)) return 'balance';
    if (['cod', 'cash_on_delivery'].includes(normalized)) return 'cod';
    return 'wechat_pay';
  }

  private toSdkPaymentMethod(method: PaymentMethod): string {
    const map: Record<PaymentMethod, string> = {
      wechat_pay: 'WECHAT_PAY',
      alipay: 'ALIPAY',
      credit_card: 'CREDIT_CARD',
      balance: 'BALANCE',
      cod: 'COD',
    };
    return map[method];
  }

  private mapProduct(item: Record<string, unknown>): Product | null {
    const id = this.toId(item.id);
    if (!id) return null;
    const now = this.deps.clock.now();
    const name = String(item.title || '').trim() || `Product ${id}`;
    const categoryName = String(item.categoryName || '').trim() || 'General';
    const image = String(item.mainImage || '').trim();
    return {
      id,
      name,
      description: String(item.description || item.summary || '').trim(),
      price: this.toNumber(item.price, 0),
      originalPrice: this.toNumber(item.originalPrice, this.toNumber(item.price, 0)),
      images: image ? [image] : [],
      thumbnail: image,
      category: {
        id: this.toId(item.categoryId, `cat_${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`),
        name: categoryName,
      },
      tags: Array.isArray(item.tags) ? item.tags.filter((tag) => typeof tag === 'string') as string[] : [],
      rating: this.toNumber((item.reviewStatistics as Record<string, unknown> | undefined)?.averageRating, 0),
      reviewCount: this.toNumber((item.reviewStatistics as Record<string, unknown> | undefined)?.reviewCount, 0),
      salesCount: this.toNumber(item.sales, 0),
      stock: this.toNumber(item.stock, 0),
      sku: this.toId((item.skus as Array<Record<string, unknown>> | undefined)?.[0]?.skuCode, `SKU-${id}`),
      specifications: {},
      shopId: this.toId(item.categoryId, 'shop_default'),
      shopName: `${categoryName} Store`,
      isFavorite: false,
      createdAt: this.toIso(item.createdAt, now),
      updatedAt: this.toIso(item.updatedAt, now),
    };
  }

  private mapCartItem(item: Record<string, unknown>, shopId: string, shopName: string): CartItem | null {
    const id = this.toId(item.itemId) || this.toId(item.uuid);
    const productId = this.toId(item.productId);
    if (!id || !productId) return null;
    const now = this.deps.clock.now();
    return {
      id,
      productId,
      productName: String(item.skuName || `Product ${productId}`).trim(),
      productImage: String(item.skuImage || '').trim(),
      price: this.toNumber(item.skuPrice ?? item.price, 0),
      quantity: Math.max(1, this.toNumber(item.quantity, 1)),
      selectedVariants: this.toId(item.skuId) ? { skuId: this.toId(item.skuId) } : undefined,
      shopId,
      shopName,
      isSelected: item.selected !== false,
      addedAt: this.toIso(item.createdAt, now),
    };
  }

  private buildCart(items: CartItem[]): Cart {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const selectedItems = items.filter((item) => item.isSelected);
    const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const selectedAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shopMap = new Map<string, { shopName: string; items: CartItem[]; subtotal: number; isSelected: boolean }>();
    items.forEach((item) => {
      const group = shopMap.get(item.shopId) || { shopName: item.shopName, items: [], subtotal: 0, isSelected: true };
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
      if (!item.isSelected) group.isSelected = false;
      shopMap.set(item.shopId, group);
    });
    return {
      items,
      totalCount,
      selectedCount,
      totalAmount,
      selectedAmount,
      shopGroups: Array.from(shopMap.entries()).map(([shopId, group]) => ({
        shopId,
        shopName: group.shopName,
        items: group.items,
        isSelected: group.isSelected,
        subtotal: group.subtotal,
      })),
    };
  }

  private mapOrder(item: Record<string, unknown>): Order | null {
    const id = this.toId(item.orderId);
    if (!id) return null;
    const status = this.mapOrderStatus(item.status);
    const quantity = Math.max(1, this.toNumber(item.quantity, 1));
    const totalAmount = this.toNumber(item.totalAmount, this.toNumber(item.paidAmount, 0));
    const shippingAddress: ShippingAddress = {
      id: this.toId((item.address as Record<string, unknown> | undefined)?.id, `addr_${id}`),
      name: String((item.address as Record<string, unknown> | undefined)?.recipient || item.receiverName || '').trim() || 'Receiver',
      phone: String((item.address as Record<string, unknown> | undefined)?.phone || item.receiverPhone || '').trim(),
      province: String((item.address as Record<string, unknown> | undefined)?.province || '').trim(),
      city: String((item.address as Record<string, unknown> | undefined)?.city || '').trim(),
      district: String((item.address as Record<string, unknown> | undefined)?.district || '').trim(),
      detail: String((item.address as Record<string, unknown> | undefined)?.detail || (item.address as Record<string, unknown> | undefined)?.address || item.receiverAddress || '').trim(),
      isDefault: Boolean((item.address as Record<string, unknown> | undefined)?.isDefault),
    };
    const rawItems = Array.isArray(item.items) ? item.items as Array<Record<string, unknown>> : [];
    const mappedItems = rawItems.map((row, index) => ({
      id: this.toId(row.id, `item_${id}_${index + 1}`),
      productId: this.toId(row.productId, this.toId(item.productId, 'unknown_product')),
      productName: String(row.productName || item.subject || 'Order item').trim(),
      productImage: String(row.productImage || item.productImage || '').trim(),
      price: this.toNumber(row.unitPrice, 0),
      quantity: Math.max(1, this.toNumber(row.quantity, 1)),
      selectedVariants: undefined,
      subtotal: this.toNumber(row.totalAmount, this.toNumber(row.unitPrice, 0) * Math.max(1, this.toNumber(row.quantity, 1))),
    }));
    if (mappedItems.length === 0) {
      mappedItems.push({
        id: `item_${id}_1`,
        productId: this.toId(item.productId, `product_${id}`),
        productName: String(item.subject || 'Order item').trim(),
        productImage: String(item.productImage || '').trim(),
        price: quantity > 0 ? totalAmount / quantity : totalAmount,
        quantity,
        selectedVariants: undefined,
        subtotal: totalAmount,
      });
    }
    const now = this.deps.clock.now();
    return {
      id,
      orderNo: String(item.orderSn || id).trim(),
      userId: this.toId(item.userId),
      status,
      items: mappedItems,
      totalAmount,
      discountAmount: this.toNumber(item.discountAmount, 0),
      shippingAmount: this.toNumber(item.shippingAmount, 0),
      finalAmount: this.toNumber(item.paidAmount, totalAmount),
      paymentMethod: this.mapPaymentMethod(item.paymentMethod),
      paymentTime: String(item.payTime || '').trim() || undefined,
      shippingAddress,
      trackingNo: String(item.logisticsNo || '').trim() || undefined,
      logisticsCompany: String(item.logisticsCompany || '').trim() || undefined,
      remark: String(item.remark || '').trim() || undefined,
      createdAt: this.toIso(item.createdAt, now),
      updatedAt: this.toIso(item.updatedAt, now),
    };
  }

  private async mutateCart(path: string, init: RequestInit, options?: { query?: Record<string, unknown>; includeContentType?: boolean }): Promise<Cart | null> {
    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(path, init, {
        query: options?.query,
        includeContentType: options?.includeContentType,
      });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Cart mutation failed');
      return this.getCart();
    } catch (error) {
      return this.failRequest(error, 'Cart mutation failed');
    }
  }

  async listProducts(params?: ProductQueryParams): Promise<{ products: Product[]; total: number } | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    const endpoint = params?.keyword ? '/products/search' : params?.categoryId ? `/products/category/${params.categoryId}` : '/products';
    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(endpoint, { method: 'GET' }, {
        includeContentType: false,
        query: {
          page: params?.page,
          pageNo: params?.page,
          pageSize: params?.pageSize,
          size: params?.pageSize,
          keyword: params?.keyword,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Fetch products failed');
      const page = this.extractPage<Record<string, unknown>>(result.data);
      return { products: page.list.map((item) => this.mapProduct(item)).filter((item): item is Product => item !== null), total: page.total };
    } catch (error) {
      return this.failRequest(error, 'Fetch products failed');
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<Record<string, unknown>>>(`/products/${id}`, { method: 'GET' }, { includeContentType: false });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Fetch product detail failed');
      return this.mapProduct(result.data);
    } catch (error) {
      return this.failRequest(error, 'Fetch product detail failed');
    }
  }

  async listCategories(): Promise<ProductCategory[] | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<unknown>>('/category', { method: 'GET' }, { includeContentType: false });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Fetch categories failed');
      return this.extractList<Record<string, unknown>>(result.data).map((item) => ({
        id: this.toId(item.id, `cat_${String(item.name || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`),
        name: String(item.name || 'General').trim(),
        icon: String(item.icon || '').trim() || undefined,
        parentId: this.toId(item.parentId) || undefined,
      }));
    } catch (error) {
      return this.failRequest(error, 'Fetch categories failed');
    }
  }

  async getCart(): Promise<Cart | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<Record<string, unknown>>>('/cart', { method: 'GET' }, { includeContentType: false });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Fetch cart failed');
      const groups = Array.isArray(result.data.groups) ? result.data.groups as Array<Record<string, unknown>> : [];
      const items: CartItem[] = [];
      groups.forEach((group, groupIndex) => {
        const shopId = this.toId(group.uuid, `shop_group_${groupIndex + 1}`);
        const shopName = String(group.name || `Shop ${groupIndex + 1}`).trim();
        const groupItems = Array.isArray(group.items) ? group.items as Array<Record<string, unknown>> : [];
        groupItems.forEach((raw) => {
          const mapped = this.mapCartItem(raw, shopId, shopName);
          if (mapped) items.push(mapped);
        });
      });
      const cart = this.buildCart(items);
      return {
        ...cart,
        totalCount: this.toNumber(result.data.totalQuantity, cart.totalCount),
        selectedCount: this.toNumber(result.data.selectedQuantity, cart.selectedCount),
        totalAmount: this.toNumber(result.data.totalPrice, cart.totalAmount),
        selectedAmount: this.toNumber(result.data.selectedPrice, cart.selectedAmount),
      };
    } catch (error) {
      return this.failRequest(error, 'Fetch cart failed');
    }
  }

  async addCartItem(item: Omit<CartItem, 'id' | 'addedAt'>): Promise<Cart | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    const productId = this.toPositiveInt(item.productId);
    if (productId === null) {
      this.setLastError({ message: 'Cart productId must be numeric for SDK API' });
      return null;
    }
    const skuId = this.toPositiveInt(item.selectedVariants?.skuId ?? item.productId) || productId;
    return this.mutateCart('/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        skuId,
        quantity: Math.max(1, this.toNumber(item.quantity, 1)),
      }),
    });
  }

  async updateCartItemQuantity(itemId: string, quantity: number): Promise<Cart | null> {
    if (quantity <= 0) return this.removeCartItem(itemId);
    return this.mutateCart(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: string): Promise<Cart | null> {
    return this.mutateCart(`/cart/items/${itemId}`, { method: 'DELETE' }, { includeContentType: false });
  }

  async updateCartItemSelection(itemId: string, selected: boolean): Promise<Cart | null> {
    return this.mutateCart(`/cart/items/${itemId}/select`, { method: 'PUT' }, {
      includeContentType: false,
      query: { selected },
    });
  }

  async batchUpdateCartSelection(itemIds: string[] | undefined, selected: boolean): Promise<Cart | null> {
    const numericIds = (itemIds || []).map((id) => this.toPositiveInt(id)).filter((id): id is number => id !== null);
    return this.mutateCart('/cart/items/select', {
      method: 'PUT',
      body: JSON.stringify({
        itemIds: numericIds.length > 0 ? numericIds : undefined,
        selected,
      }),
    });
  }

  async clearCart(): Promise<Cart | null> {
    return this.mutateCart('/cart', { method: 'DELETE' }, { includeContentType: false });
  }

  async getSelectedCartItems(): Promise<CartItem[] | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<unknown>>('/cart/items/selected', { method: 'GET' }, { includeContentType: false });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Fetch selected cart items failed');
      return this.extractList<Record<string, unknown>>(result.data)
        .map((item) => this.mapCartItem(item, this.toId(item.cartGroupUuid, 'selected_group'), 'Selected Items'))
        .filter((item): item is CartItem => item !== null);
    } catch (error) {
      return this.failRequest(error, 'Fetch selected cart items failed');
    }
  }

  async listOrders(params?: OrderQueryParams): Promise<{ orders: Order[]; total: number } | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<unknown>>('/orders', { method: 'GET' }, {
        includeContentType: false,
        query: {
          page: params?.page,
          pageNo: params?.page,
          pageSize: params?.pageSize,
          size: params?.pageSize,
          status: params?.status,
          keyword: params?.keyword,
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Fetch orders failed');
      const page = this.extractPage<Record<string, unknown>>(result.data);
      let orders = page.list.map((item) => this.mapOrder(item)).filter((item): item is Order => item !== null);
      if (params?.status) orders = orders.filter((item) => item.status === params.status);
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase();
        orders = orders.filter((order) => order.orderNo.toLowerCase().includes(keyword) || order.items.some((item) => item.productName.toLowerCase().includes(keyword)));
      }
      return { orders, total: params?.status || params?.keyword ? orders.length : page.total };
    } catch (error) {
      return this.failRequest(error, 'Fetch orders failed');
    }
  }

  async createOrder(params: CreateOrderParams): Promise<Order | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    const first = params.items[0];
    if (!first) {
      this.setLastError({ message: 'Order items are required' });
      return null;
    }
    try {
      const result = await this.requestJson<SdkApiResult<Record<string, unknown>>>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          orderType: 'NORMAL',
          productId: String(first.productId),
          quantity: params.items.reduce((sum, item) => sum + Math.max(1, this.toNumber(item.quantity, 1)), 0),
          items: params.items.map((item) => ({
            productId: String(item.productId),
            quantity: Math.max(1, this.toNumber(item.quantity, 1)),
            price: String(this.toNumber(item.price, 0)),
            productName: item.productName,
          })),
          addressId: params.shippingAddress.id || undefined,
          paymentMethod: this.toSdkPaymentMethod(params.paymentMethod),
          remark: params.remark,
          sourceChannel: 'openchat-react-mobile',
        }),
      });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Create order failed');
      const orderId = this.toId(result.data?.orderId);
      if (orderId) return this.getOrderDetail(orderId);
      return this.mapOrder(result.data);
    } catch (error) {
      return this.failRequest(error, 'Create order failed');
    }
  }

  async getOrderDetail(orderId: string): Promise<Order | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<Record<string, unknown>>>(`/orders/${orderId}`, { method: 'GET' }, { includeContentType: false });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Fetch order detail failed');
      return this.mapOrder(result.data);
    } catch (error) {
      return this.failRequest(error, 'Fetch order detail failed');
    }
  }

  async payOrder(orderId: string, method: PaymentMethod): Promise<Order | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(`/orders/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod: this.toSdkPaymentMethod(method) }),
      });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Pay order failed');
      return this.getOrderDetail(orderId);
    } catch (error) {
      return this.failRequest(error, 'Pay order failed');
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order | null> {
    return this.simpleOrderMutation(orderId, '/cancel', { reason: reason || 'user_cancelled' }, 'Cancel order failed');
  }

  async confirmOrder(orderId: string): Promise<Order | null> {
    return this.simpleOrderMutation(orderId, '/confirm', undefined, 'Confirm order failed');
  }

  async refundOrder(orderId: string, reason: string): Promise<Order | null> {
    return this.simpleOrderMutation(orderId, '/refund', { reason: reason || 'user_refund_request' }, 'Refund order failed');
  }

  private async simpleOrderMutation(
    orderId: string,
    suffix: string,
    body: Record<string, unknown> | undefined,
    failureMessage: string
  ): Promise<Order | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<unknown>>(`/orders/${orderId}${suffix}`, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, failureMessage);
      return this.getOrderDetail(orderId);
    } catch (error) {
      return this.failRequest(error, failureMessage);
    }
  }

  async getOrderStatistics(): Promise<Record<OrderStatus, number> | null> {
    if (!this.hasSdkBaseUrl()) return null;
    this.setLastError(null);
    try {
      const result = await this.requestJson<SdkApiResult<Record<string, unknown>>>('/orders/statistics', { method: 'GET' }, { includeContentType: false });
      if (!this.isSuccessCode(result.code)) return this.failBusiness(result, 'Fetch order statistics failed');
      return {
        pending_payment: this.toNumber(result.data.pendingPayment, 0),
        paid: 0,
        processing: this.toNumber(result.data.pendingShipment, 0),
        shipped: 0,
        delivered: this.toNumber(result.data.pendingReceipt, 0),
        completed: this.toNumber(result.data.completed, 0),
        cancelled: 0,
        refunding: 0,
        refunded: 0,
      };
    } catch (error) {
      return this.failRequest(error, 'Fetch order statistics failed');
    }
  }
}

export function createCommerceSdkService(_deps?: ServiceFactoryDeps): ICommerceSdkService {
  return new CommerceSdkServiceImpl(_deps);
}

export const commerceSdkService: ICommerceSdkService = createCommerceSdkService();
