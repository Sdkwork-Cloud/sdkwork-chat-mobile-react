import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  CreateOrderParams,
  IOrderService,
  Order,
  OrderStatus,
  OrderQueryParams,
  PaymentMethod,
} from '../types';
import { createCommerceSdkService } from './CommerceSdkService';
import type { ICommerceSdkService } from './CommerceSdkService';

const TAG = 'OrderService';

const STORAGE_KEY = 'sys_commerce_orders_v2';

const ORDER_EVENTS = {
  CREATED: 'order:created',
  PAID: 'order:paid',
  CANCELLED: 'order:cancelled',
  COMPLETED: 'order:completed',
  REFUNDING: 'order:refunding',
} as const;

class OrderServiceImpl implements IOrderService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: ICommerceSdkService;

  constructor(deps?: ServiceFactoryDeps, sdkService?: ICommerceSdkService) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = sdkService || createCommerceSdkService(deps);
  }

  private nowIso(): string {
    return new Date(this.deps.clock.now()).toISOString();
  }

  private sdkErrorMessage(defaultMessage: string): string {
    const sdkError = this.sdkService.getLastError();
    return sdkError?.message || defaultMessage;
  }

  private async getOrdersFromStorage(): Promise<Order[]> {
    const value = await Promise.resolve(this.deps.storage.get<Order[]>(STORAGE_KEY));
    return value || [];
  }

  private async saveOrdersToStorage(orders: Order[]): Promise<void> {
    await Promise.resolve(this.deps.storage.set(STORAGE_KEY, orders));
  }

  async createOrder(params: CreateOrderParams): Promise<Order> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteOrder = await this.sdkService.createOrder(params);
      if (!remoteOrder) {
        const message = this.sdkErrorMessage('Failed to create order');
        this.deps.logger.warn(TAG, 'SDK createOrder failed', { message });
        throw new Error(message);
      }
      this.deps.eventBus.emit(ORDER_EVENTS.CREATED, remoteOrder);
      return remoteOrder;
    }

    const orders = await this.getOrdersFromStorage();

    const totalAmount = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalAmount = totalAmount - (params.discountAmount || 0) + (params.shippingAmount || 0);

    const order: Order = {
      id: this.deps.idGenerator.next('ord'),
      orderNo: this.generateOrderNo(),
      userId: '', // Will be set from auth context
      status: 'pending_payment',
      items: params.items.map(item => ({
        ...item,
        id: this.deps.idGenerator.next('oi'),
        subtotal: item.price * item.quantity,
      })),
      totalAmount,
      discountAmount: params.discountAmount || 0,
      shippingAmount: params.shippingAmount || 0,
      finalAmount,
      paymentMethod: params.paymentMethod,
      shippingAddress: params.shippingAddress,
      remark: params.remark,
      createdAt: this.nowIso(),
      updatedAt: this.nowIso(),
    };

    orders.unshift(order);
    await this.saveOrdersToStorage(orders);

    this.deps.eventBus.emit(ORDER_EVENTS.CREATED, order);
    return order;
  }

  async getOrders(params?: OrderQueryParams): Promise<{ orders: Order[]; total: number }> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remote = await this.sdkService.listOrders(params);
      if (!remote) {
        const message = this.sdkErrorMessage('Failed to load orders');
        this.deps.logger.warn(TAG, 'SDK getOrders failed', { message });
        throw new Error(message);
      }
      return remote;
    }

    let orders = await this.getOrdersFromStorage();

    if (params?.status) {
      orders = orders.filter(o => o.status === params.status);
    }

    if (params?.startDate) {
      orders = orders.filter(o => o.createdAt >= params.startDate!);
    }

    if (params?.endDate) {
      orders = orders.filter(o => o.createdAt <= params.endDate!);
    }

    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      orders = orders.filter(o => 
        o.orderNo.toLowerCase().includes(keyword) ||
        o.items.some(i => i.productName.toLowerCase().includes(keyword))
      );
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = orders.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paginatedOrders = orders.slice(start, start + pageSize);

    return { orders: paginatedOrders, total };
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    if (this.sdkService.hasSdkBaseUrl()) {
      return this.sdkService.getOrderDetail(orderId);
    }

    const orders = await this.getOrdersFromStorage();
    return orders.find(o => o.id === orderId) || null;
  }

  async getOrderByNo(orderNo: string): Promise<Order | null> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remote = await this.sdkService.listOrders({
        page: 1,
        pageSize: 20,
        keyword: orderNo,
      });
      if (!remote) return null;
      return remote.orders.find((order) => order.orderNo === orderNo) || null;
    }

    const orders = await this.getOrdersFromStorage();
    return orders.find(o => o.orderNo === orderNo) || null;
  }

  async payOrder(orderId: string): Promise<Order> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const currentOrder = await this.getOrderById(orderId);
      const paymentMethod: PaymentMethod = currentOrder?.paymentMethod || 'wechat_pay';
      const remoteOrder = await this.sdkService.payOrder(orderId, paymentMethod);
      if (!remoteOrder) {
        const message = this.sdkErrorMessage('Failed to pay order');
        this.deps.logger.warn(TAG, 'SDK payOrder failed', { message, orderId });
        throw new Error(message);
      }
      this.deps.eventBus.emit(ORDER_EVENTS.PAID, remoteOrder);
      return remoteOrder;
    }

    const orders = await this.getOrdersFromStorage();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'pending_payment') throw new Error('Order cannot be paid');

    order.status = 'paid';
    order.paymentTime = this.nowIso();
    order.updatedAt = this.nowIso();

    await this.saveOrdersToStorage(orders);
    this.deps.eventBus.emit(ORDER_EVENTS.PAID, order);
    return order;
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteOrder = await this.sdkService.cancelOrder(orderId, reason);
      if (!remoteOrder) {
        const message = this.sdkErrorMessage('Failed to cancel order');
        this.deps.logger.warn(TAG, 'SDK cancelOrder failed', { message, orderId });
        throw new Error(message);
      }
      this.deps.eventBus.emit(ORDER_EVENTS.CANCELLED, { order: remoteOrder, reason });
      return remoteOrder;
    }

    const orders = await this.getOrdersFromStorage();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (!['pending_payment', 'paid', 'processing'].includes(order.status)) {
      throw new Error('Order cannot be cancelled');
    }

    order.status = 'cancelled';
    order.updatedAt = this.nowIso();

    await this.saveOrdersToStorage(orders);
    this.deps.eventBus.emit(ORDER_EVENTS.CANCELLED, { order, reason });
    return order;
  }

  async confirmDelivery(orderId: string): Promise<Order> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteOrder = await this.sdkService.confirmOrder(orderId);
      if (!remoteOrder) {
        const message = this.sdkErrorMessage('Failed to confirm delivery');
        this.deps.logger.warn(TAG, 'SDK confirmDelivery failed', { message, orderId });
        throw new Error(message);
      }
      this.deps.eventBus.emit(ORDER_EVENTS.COMPLETED, remoteOrder);
      return remoteOrder;
    }

    const orders = await this.getOrdersFromStorage();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'delivered') throw new Error('Order not delivered yet');

    order.status = 'completed';
    order.updatedAt = this.nowIso();

    await this.saveOrdersToStorage(orders);
    this.deps.eventBus.emit(ORDER_EVENTS.COMPLETED, order);
    return order;
  }

  async requestRefund(orderId: string, reason: string): Promise<Order> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteOrder = await this.sdkService.refundOrder(orderId, reason);
      if (!remoteOrder) {
        const message = this.sdkErrorMessage('Failed to request refund');
        this.deps.logger.warn(TAG, 'SDK requestRefund failed', { message, orderId });
        throw new Error(message);
      }
      this.deps.eventBus.emit(ORDER_EVENTS.REFUNDING, { order: remoteOrder, reason });
      return remoteOrder;
    }

    const orders = await this.getOrdersFromStorage();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (!['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      throw new Error('Order cannot be refunded');
    }

    order.status = 'refunding';
    order.updatedAt = this.nowIso();

    await this.saveOrdersToStorage(orders);
    this.deps.eventBus.emit(ORDER_EVENTS.REFUNDING, { order, reason });
    return order;
  }

  async getOrderCountByStatus(): Promise<Record<OrderStatus, number>> {
    if (this.sdkService.hasSdkBaseUrl()) {
      const remoteCounts = await this.sdkService.getOrderStatistics();
      if (!remoteCounts) {
        const message = this.sdkErrorMessage('Failed to load order statistics');
        this.deps.logger.warn(TAG, 'SDK getOrderCountByStatus failed', { message });
        throw new Error(message);
      }
      return remoteCounts;
    }

    const orders = await this.getOrdersFromStorage();
    
    const counts: Record<string, number> = {
      pending_payment: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      refunding: 0,
      refunded: 0,
    };

    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return counts as Record<OrderStatus, number>;
  }

  onOrderCreated(handler: (order: Order) => void): () => void {
    return this.deps.eventBus.on(ORDER_EVENTS.CREATED, handler);
  }

  onOrderPaid(handler: (order: Order) => void): () => void {
    return this.deps.eventBus.on(ORDER_EVENTS.PAID, handler);
  }

  onOrderCancelled(handler: (payload: { order: Order; reason?: string }) => void): () => void {
    return this.deps.eventBus.on(ORDER_EVENTS.CANCELLED, handler);
  }

  private generateOrderNo(): string {
    const date = new Date(this.deps.clock.now());
    const dateStr = date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `ORD${dateStr}${random}`;
  }
}

export function createOrderService(_deps?: ServiceFactoryDeps): IOrderService {
  return new OrderServiceImpl(_deps);
}

export function createOrderServiceWithSdk(_deps?: ServiceFactoryDeps, sdkService?: ICommerceSdkService): IOrderService {
  return new OrderServiceImpl(_deps, sdkService);
}

export const orderService: IOrderService = createOrderService();

