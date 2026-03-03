import React from 'react';
import { Button, Toast } from '@sdkwork/react-mobile-commons';
import { useOrders } from '../hooks/useOrders';
import type { Order, OrderStatus } from '../types';
import { EmptyState, PageScaffold, PriceText, SectionCard } from '../components';
import './OrderListPage.css';

interface OrderListPageProps {
  t?: (key: string) => string;
  initialStatus?: OrderStatus;
  onBack?: () => void;
  onOrderClick?: (orderId: string) => void;
}

const getStatusClassName = (status: OrderStatus): string => {
  if (status === 'pending_payment') return 'commerce-order-list__status--danger';
  if (status === 'refunding' || status === 'refunded') return 'commerce-order-list__status--warn';
  return '';
};

const getTotalQuantity = (order: Order): number => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
};

export const OrderListPage: React.FC<OrderListPageProps> = ({ t, initialStatus, onBack, onOrderClick }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { orders, isLoading, loadOrders, payOrder, cancelOrder, confirmDelivery, requestRefund } = useOrders();
  const [activeTab, setActiveTab] = React.useState<'all' | OrderStatus>(initialStatus || 'all');
  const [pendingOrderId, setPendingOrderId] = React.useState('');
  const tabItems: Array<{ label: string; value: 'all' | OrderStatus }> = React.useMemo(
    () => [
      { label: tr('commerce.orders.tabs.all', '全部'), value: 'all' },
      { label: tr('commerce.orders.tabs.pending_payment', '待支付'), value: 'pending_payment' },
      { label: tr('commerce.orders.tabs.paid', '已支付'), value: 'paid' },
      { label: tr('commerce.orders.tabs.processing', '处理中'), value: 'processing' },
      { label: tr('commerce.orders.tabs.shipped', '已发货'), value: 'shipped' },
      { label: tr('commerce.orders.tabs.completed', '已完成'), value: 'completed' },
    ],
    [t]
  );
  const orderStatusText: Record<OrderStatus, string> = React.useMemo(
    () => ({
      pending_payment: tr('commerce.order.status.pending_payment', '待支付'),
      paid: tr('commerce.order.status.paid', '已支付'),
      processing: tr('commerce.order.status.processing', '处理中'),
      shipped: tr('commerce.order.status.shipped', '已发货'),
      delivered: tr('commerce.order.status.delivered', '待确认'),
      completed: tr('commerce.order.status.completed', '已完成'),
      cancelled: tr('commerce.order.status.cancelled', '已取消'),
      refunding: tr('commerce.order.status.refunding', '退款中'),
      refunded: tr('commerce.order.status.refunded', '已退款'),
    }),
    [t]
  );

  const refreshOrders = React.useCallback(async () => {
    await loadOrders({
      status: activeTab === 'all' ? undefined : activeTab,
      page: 1,
      pageSize: 50,
    });
  }, [activeTab, loadOrders]);

  React.useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const runOrderAction = async (orderId: string, task: () => Promise<void>, successText: string, errorText: string) => {
    if (pendingOrderId) return;
    setPendingOrderId(orderId);
    try {
      await task();
      Toast.success(successText);
      await refreshOrders();
    } catch (error) {
      console.error('[OrderListPage] order action failed:', error);
      Toast.error(errorText);
    } finally {
      setPendingOrderId('');
    }
  };

  return (
    <PageScaffold title={tr('commerce.orders.title', '我的订单')} onBack={onBack}>
      <SectionCard style={{ marginBottom: '10px' }}>
        <div className="commerce-order-list__tabs">
          {tabItems.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`commerce-order-list__tab ${activeTab === tab.value ? 'commerce-order-list__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </SectionCard>

      {isLoading ? (
        <SectionCard style={{ color: 'var(--text-secondary)' }}>{tr('commerce.orders.loading', '正在加载订单...')}</SectionCard>
      ) : null}

      {!isLoading && orders.length === 0 ? <EmptyState icon="📦" title={tr('commerce.orders.empty', '暂无订单记录')} /> : null}

      {!isLoading
        ? orders.map((order) => {
            const primaryItem = order.items[0];
            const orderBusy = pendingOrderId === order.id;
            const canRefund = ['paid', 'processing', 'shipped', 'delivered'].includes(order.status);

            return (
              <SectionCard key={order.id}>
                <div className="commerce-order-list__header">
                  <div className="commerce-order-list__no">{tr('commerce.order.no', '订单号')}: {order.orderNo}</div>
                  <span className={`commerce-order-list__status ${getStatusClassName(order.status)}`}>
                    {orderStatusText[order.status]}
                  </span>
                </div>

                <button type="button" className="commerce-order-list__main" onClick={() => onOrderClick?.(order.id)}>
                  <span
                    className="commerce-order-list__cover"
                    style={{ backgroundImage: `url(${primaryItem?.productImage || ''})` }}
                  />
                  <span className="commerce-order-list__main-body">
                    <span className="commerce-order-list__title">
                      {primaryItem?.productName || tr('commerce.orders.fallback_item', '订单商品')}
                    </span>
                    <span className="commerce-order-list__meta">
                      {tr('commerce.order.items_count', '共 {count} 件商品').replace('{count}', String(getTotalQuantity(order)))}
                    </span>
                  </span>
                  <PriceText amount={order.finalAmount} />
                </button>

                <div className="commerce-order-list__actions">
                  {order.status === 'pending_payment' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={orderBusy}
                        onClick={() =>
                          void runOrderAction(
                            order.id,
                            async () => cancelOrder(order.id, 'user_cancelled').then(() => undefined),
                            tr('commerce.order.action.cancel_success', '订单已取消'),
                            tr('commerce.order.action.cancel_failed', '取消失败，请稍后重试')
                          )
                        }
                      >
                        {tr('commerce.order.action.cancel', '取消订单')}
                      </Button>
                      <Button
                        size="sm"
                        disabled={orderBusy}
                        onClick={() =>
                          void runOrderAction(
                            order.id,
                            async () => payOrder(order.id).then(() => undefined),
                            tr('commerce.order.action.pay_success', '支付成功'),
                            tr('commerce.order.action.pay_failed', '支付失败，请稍后重试')
                          )
                        }
                      >
                        {tr('commerce.order.action.pay', '去支付')}
                      </Button>
                    </>
                  ) : null}

                  {order.status === 'delivered' ? (
                    <Button
                      size="sm"
                      disabled={orderBusy}
                      onClick={() =>
                        void runOrderAction(
                          order.id,
                          async () => confirmDelivery(order.id).then(() => undefined),
                          tr('commerce.order.action.confirm_success', '已确认收货'),
                          tr('commerce.order.action.confirm_failed', '确认收货失败，请稍后重试')
                        )
                      }
                    >
                      {tr('commerce.order.action.confirm', '确认收货')}
                    </Button>
                  ) : null}

                  {canRefund ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={orderBusy}
                      onClick={() =>
                        void runOrderAction(
                          order.id,
                          async () => requestRefund(order.id, 'user_refund_request').then(() => undefined),
                          tr('commerce.order.action.refund_success', '退款申请已提交'),
                          tr('commerce.order.action.refund_failed', '退款申请失败，请稍后重试')
                        )
                      }
                    >
                      {tr('commerce.order.action.refund', '申请退款')}
                    </Button>
                  ) : null}

                  <Button size="sm" variant="ghost" onClick={() => onOrderClick?.(order.id)}>
                    {tr('commerce.order.action.view_detail', '查看详情')}
                  </Button>
                </div>
              </SectionCard>
            );
          })
        : null}
    </PageScaffold>
  );
};

export default OrderListPage;
