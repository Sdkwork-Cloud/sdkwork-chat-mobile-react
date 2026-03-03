import { useCallback, useEffect } from 'react';
import { useCommerceStore } from '../stores/commerceStore';
import { orderService } from '../services/OrderService';
import type { Order, OrderItem, OrderQueryParams, PaymentMethod } from '../types';

export function useOrders() {
  const orders = useCommerceStore((state) => state.orders);
  const currentOrder = useCommerceStore((state) => state.currentOrder);
  const orderCounts = useCommerceStore((state) => state.orderCounts);
  const isLoading = useCommerceStore((state) => state.isLoadingOrders);

  const setOrders = useCommerceStore((state) => state.setOrders);
  const setCurrentOrder = useCommerceStore((state) => state.setCurrentOrder);
  const setOrderCounts = useCommerceStore((state) => state.setOrderCounts);
  const setIsLoadingOrders = useCommerceStore((state) => state.setIsLoadingOrders);

  const loadOrderCounts = useCallback(async () => {
    const counts = await orderService.getOrderCountByStatus();
    setOrderCounts(counts);
    return counts;
  }, [setOrderCounts]);

  const loadOrders = useCallback(
    async (params?: OrderQueryParams) => {
      setIsLoadingOrders(true);
      try {
        const { orders: nextOrders, total } = await orderService.getOrders(params);
        setOrders(nextOrders);
        return { orders: nextOrders, total };
      } finally {
        setIsLoadingOrders(false);
      }
    },
    [setIsLoadingOrders, setOrders]
  );

  const loadOrder = useCallback(
    async (orderId: string) => {
      setIsLoadingOrders(true);
      try {
        const order = await orderService.getOrderById(orderId);
        setCurrentOrder(order);
        return order;
      } finally {
        setIsLoadingOrders(false);
      }
    },
    [setCurrentOrder, setIsLoadingOrders]
  );

  const createOrder = useCallback(
    async (params: {
      items: Omit<OrderItem, 'id' | 'subtotal'>[];
      shippingAddress: Order['shippingAddress'];
      paymentMethod: PaymentMethod;
      remark?: string;
      discountAmount?: number;
      shippingAmount?: number;
    }) => {
      const order = await orderService.createOrder(params);
      setCurrentOrder(order);
      await loadOrderCounts();
      return order;
    },
    [loadOrderCounts, setCurrentOrder]
  );

  const payOrder = useCallback(
    async (orderId: string) => {
      const updatedOrder = await orderService.payOrder(orderId);
      setCurrentOrder(updatedOrder);
      const currentOrders = useCommerceStore.getState().orders;
      setOrders(currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)));
      await loadOrderCounts();
      return updatedOrder;
    },
    [loadOrderCounts, setCurrentOrder, setOrders]
  );

  const cancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      const updatedOrder = await orderService.cancelOrder(orderId, reason);
      setCurrentOrder(updatedOrder);
      const currentOrders = useCommerceStore.getState().orders;
      setOrders(currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)));
      await loadOrderCounts();
      return updatedOrder;
    },
    [loadOrderCounts, setCurrentOrder, setOrders]
  );

  const confirmDelivery = useCallback(
    async (orderId: string) => {
      const updatedOrder = await orderService.confirmDelivery(orderId);
      setCurrentOrder(updatedOrder);
      const currentOrders = useCommerceStore.getState().orders;
      setOrders(currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)));
      await loadOrderCounts();
      return updatedOrder;
    },
    [loadOrderCounts, setCurrentOrder, setOrders]
  );

  const requestRefund = useCallback(
    async (orderId: string, reason: string) => {
      const updatedOrder = await orderService.requestRefund(orderId, reason);
      setCurrentOrder(updatedOrder);
      const currentOrders = useCommerceStore.getState().orders;
      setOrders(currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)));
      await loadOrderCounts();
      return updatedOrder;
    },
    [loadOrderCounts, setCurrentOrder, setOrders]
  );

  useEffect(() => {
    const unsubscribers: Array<() => void> = [
      orderService.onOrderCreated((order: Order) => {
        const currentOrders = useCommerceStore.getState().orders;
        setOrders([order, ...currentOrders]);
      }),
      orderService.onOrderPaid((order: Order) => {
        const current = useCommerceStore.getState().currentOrder;
        if (current?.id === order.id) {
          setCurrentOrder(order);
        }
      }),
      orderService.onOrderCancelled(({ order }: { order: Order }) => {
        const current = useCommerceStore.getState().currentOrder;
        if (current?.id === order.id) {
          setCurrentOrder(order);
        }
      }),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [setCurrentOrder, setOrders]);

  useEffect(() => {
    void loadOrderCounts();
  }, [loadOrderCounts]);

  return {
    orders,
    currentOrder,
    orderCounts,
    isLoading,
    loadOrders,
    loadOrder,
    createOrder,
    payOrder,
    cancelOrder,
    confirmDelivery,
    requestRefund,
    loadOrderCounts,
  };
}
