import React from 'react';
import { Button, Toast } from '@sdkwork/react-mobile-commons';
import { useOrders } from '../hooks/useOrders';
import type { Order, OrderStatus } from '../types';
import { PageScaffold, PriceText } from '../components';
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

const formatMoney = (amount: number) => `¥${amount.toFixed(2)}`;

const getTotalQuantity = (order: Order): number => order.items.reduce((sum, item) => sum + item.quantity, 0);

export const OrderListPage: React.FC<OrderListPageProps> = ({ t, initialStatus, onBack, onOrderClick }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const { orders, orderCounts, isLoading, loadOrders, payOrder, cancelOrder, confirmDelivery, requestRefund } = useOrders();
  const [activeTab, setActiveTab] = React.useState<'all' | OrderStatus>(initialStatus || 'all');
  const [pendingOrderId, setPendingOrderId] = React.useState('');

  const tabItems: Array<{ label: string; value: 'all' | OrderStatus }> = React.useMemo(
    () => [
      { label: tr('commerce.orders.tabs.all', 'All'), value: 'all' },
      { label: tr('commerce.orders.tabs.pending_payment', 'Pending'), value: 'pending_payment' },
      { label: tr('commerce.orders.tabs.paid', 'Paid'), value: 'paid' },
      { label: tr('commerce.orders.tabs.processing', 'Processing'), value: 'processing' },
      { label: tr('commerce.orders.tabs.shipped', 'Shipped'), value: 'shipped' },
      { label: tr('commerce.orders.tabs.completed', 'Completed'), value: 'completed' },
    ],
    [tr]
  );

  const orderStatusText: Record<OrderStatus, string> = React.useMemo(
    () => ({
      pending_payment: tr('commerce.order.status.pending_payment', 'Pending payment'),
      paid: tr('commerce.order.status.paid', 'Paid'),
      processing: tr('commerce.order.status.processing', 'Processing'),
      shipped: tr('commerce.order.status.shipped', 'Shipped'),
      delivered: tr('commerce.order.status.delivered', 'To confirm'),
      completed: tr('commerce.order.status.completed', 'Completed'),
      cancelled: tr('commerce.order.status.cancelled', 'Cancelled'),
      refunding: tr('commerce.order.status.refunding', 'Refunding'),
      refunded: tr('commerce.order.status.refunded', 'Refunded'),
    }),
    [tr]
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

  const workbenchMetrics = React.useMemo(
    () => [
      {
        label: tr('commerce.orders.metric_pending', 'Pending payment'),
        value: String(orderCounts.pending_payment),
      },
      {
        label: tr('commerce.orders.metric_shipping', 'In transit'),
        value: String(orderCounts.shipped + orderCounts.delivered),
      },
      {
        label: tr('commerce.orders.metric_after_sales', 'After-sales'),
        value: String(orderCounts.refunding + orderCounts.refunded),
      },
      {
        label: tr('commerce.orders.metric_completed', 'Completed'),
        value: String(orderCounts.completed),
      },
    ],
    [orderCounts, tr]
  );

  const decisionMetrics = React.useMemo(
    () => [
      {
        label: tr('commerce.orders.decision_payment_title', 'Payment risk'),
        value: `${orderCounts.pending_payment}`,
        hint: tr('commerce.orders.decision_payment_hint', 'Orders still waiting to be paid'),
      },
      {
        label: tr('commerce.orders.decision_shipping_title', 'Delivery watch'),
        value: `${orderCounts.shipped + orderCounts.delivered}`,
        hint: tr('commerce.orders.decision_shipping_hint', 'Orders currently moving to the buyer'),
      },
      {
        label: tr('commerce.orders.decision_after_sales_title', 'After-sales'),
        value: `${orderCounts.refunding + orderCounts.refunded}`,
        hint: tr('commerce.orders.decision_after_sales_hint', 'Refund or service attention needed'),
      },
    ],
    [orderCounts, tr]
  );

  const activeTabLabel = tabItems.find((tab) => tab.value === activeTab)?.label ?? tr('commerce.orders.tabs.all', 'All');

  return (
    <PageScaffold title={tr('commerce.orders.title', 'My Orders')} onBack={onBack}>
      <section className="commerce-order-list__hero">
        <div className="commerce-order-list__hero-copy">
          <div className="commerce-order-list__hero-kicker">
            {tr('commerce.orders.hero_kicker', 'Order workspace')}
          </div>
          <div className="commerce-order-list__hero-title-row">
            <h1 className="commerce-order-list__hero-title">
              {tr('commerce.orders.hero_title', 'See which orders need action first')}
            </h1>
            <span className="commerce-order-list__hero-badge">{orders.length}</span>
          </div>
          <p className="commerce-order-list__hero-subtitle">
            {tr(
              'commerce.orders.hero_subtitle',
              'Use payment, shipping, and refund signals to decide which queue deserves attention now.'
            )}
          </p>
        </div>
      </section>

      <section className="commerce-order-list__workbench">
        <div className="commerce-order-list__workbench-grid">
          {workbenchMetrics.map((metric) => (
            <div key={metric.label} className="commerce-order-list__workbench-card">
              <div className="commerce-order-list__workbench-label">{metric.label}</div>
              <div className="commerce-order-list__workbench-value">{metric.value}</div>
            </div>
          ))}
        </div>
      </section>

      <nav className="commerce-order-list__tabbar" role="tablist" aria-label={tr('commerce.orders.title', 'My Orders')}>
        {tabItems.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              className={`commerce-order-list__tab ${active ? 'commerce-order-list__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <section className="commerce-order-list__decision-strip">
        {decisionMetrics.map((metric) => (
          <div key={metric.label} className="commerce-order-list__decision-card">
            <div className="commerce-order-list__decision-label">{metric.label}</div>
            <div className="commerce-order-list__decision-value">{metric.value}</div>
            <div className="commerce-order-list__decision-hint">{metric.hint}</div>
          </div>
        ))}
      </section>

      <section className="commerce-order-list__queue">
        <div className="commerce-order-list__queue-heading">
          <div>
            <div className="commerce-order-list__queue-kicker">
              {tr('commerce.orders.queue_kicker', 'Queue focus')}
            </div>
            <h2 className="commerce-order-list__queue-title">{tr('commerce.orders.queue_title', 'Order queue')}</h2>
            <p className="commerce-order-list__queue-subtitle">
              {tr(
                'commerce.orders.queue_subtitle',
                'Each card keeps status, amount, and next action in one scan line.'
              )}
            </p>
          </div>
          <span className="commerce-order-list__queue-badge">{activeTabLabel}</span>
        </div>

        {isLoading ? (
          <div className="commerce-order-list__loading">{tr('commerce.orders.loading', 'Loading orders...')}</div>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <div className="commerce-order-list__empty">
            <div className="commerce-order-list__empty-icon">OD</div>
            <div className="commerce-order-list__empty-title">{tr('commerce.orders.empty', 'No orders yet')}</div>
            <div className="commerce-order-list__empty-copy">
              {tr('commerce.orders.empty_copy', 'New orders will land here once a checkout is completed.')}
            </div>
          </div>
        ) : null}

        {!isLoading
          ? orders.map((order) => {
              const primaryItem = order.items[0];
              const orderBusy = pendingOrderId === order.id;
              const canRefund = ['paid', 'processing', 'shipped', 'delivered'].includes(order.status);

              return (
                <article key={order.id} className="commerce-order-list__order-card">
                  <div className="commerce-order-list__header">
                    <div className="commerce-order-list__no">
                      {tr('commerce.order.no', 'Order No')} {order.orderNo}
                    </div>
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
                        {primaryItem?.productName || tr('commerce.orders.fallback_item', 'Order item')}
                      </span>
                      <span className="commerce-order-list__meta">
                        {tr('commerce.order.items_count', '{count} items').replace('{count}', String(getTotalQuantity(order)))}
                      </span>
                      <span className="commerce-order-list__meta">
                        {tr('commerce.orders.updated_at', 'Updated')} {new Date(order.updatedAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="commerce-order-list__amount">
                      <PriceText amount={order.finalAmount} />
                      <small>{formatMoney(order.finalAmount)}</small>
                    </span>
                  </button>

                  <div className="commerce-order-list__signals">
                    <span className="commerce-order-list__signal">
                      {tr('commerce.orders.signal_payment', 'Payment')} · {orderStatusText[order.status]}
                    </span>
                    <span className="commerce-order-list__signal">
                      {tr('commerce.orders.signal_items', 'Items')} · {getTotalQuantity(order)}
                    </span>
                    <span className="commerce-order-list__signal">
                      {tr('commerce.orders.signal_total', 'Total')} · {formatMoney(order.finalAmount)}
                    </span>
                  </div>

                  <div className="commerce-order-list__order-actions">
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
                              tr('commerce.order.action.cancel_success', 'Order cancelled'),
                              tr('commerce.order.action.cancel_failed', 'Failed to cancel order, please try again')
                            )
                          }
                        >
                          {tr('commerce.order.action.cancel', 'Cancel Order')}
                        </Button>
                        <Button
                          size="sm"
                          disabled={orderBusy}
                          onClick={() =>
                            void runOrderAction(
                              order.id,
                              async () => payOrder(order.id).then(() => undefined),
                              tr('commerce.order.action.pay_success', 'Payment successful'),
                              tr('commerce.order.action.pay_failed', 'Payment failed, please try again')
                            )
                          }
                        >
                          {tr('commerce.order.action.pay', 'Pay Now')}
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
                            tr('commerce.order.action.confirm_success', 'Receipt confirmed'),
                            tr('commerce.order.action.confirm_failed', 'Failed to confirm receipt, please try again')
                          )
                        }
                      >
                        {tr('commerce.order.action.confirm', 'Confirm Receipt')}
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
                            tr('commerce.order.action.refund_success', 'Refund request submitted'),
                            tr('commerce.order.action.refund_failed', 'Refund request failed, please try again')
                          )
                        }
                      >
                        {tr('commerce.order.action.refund', 'Request Refund')}
                      </Button>
                    ) : null}

                    <Button size="sm" variant="ghost" onClick={() => onOrderClick?.(order.id)}>
                      {tr('commerce.order.action.view_detail', 'View Details')}
                    </Button>
                  </div>
                </article>
              );
            })
          : null}
      </section>
    </PageScaffold>
  );
};

export default OrderListPage;
