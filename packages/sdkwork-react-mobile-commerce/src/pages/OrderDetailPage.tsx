import React from 'react';
import { Button, Toast } from '@sdkwork/react-mobile-commons';
import { useOrders } from '../hooks/useOrders';
import type { Order, OrderStatus } from '../types';
import { EmptyState, PageScaffold, PriceText, SectionCard } from '../components';
import { formatDateTime } from './helpers';
import './OrderDetailPage.css';

interface OrderDetailPageProps {
  t?: (key: string) => string;
  orderId?: string;
  onBack?: () => void;
}

interface StatusMeta {
  title: string;
  subtitle: string;
  tone: 'warning' | 'info' | 'success' | 'neutral';
}

interface JourneyStep {
  id: string;
  label: string;
  state: 'done' | 'active' | 'todo';
}

const canRefund = (status: OrderStatus): boolean => ['paid', 'processing', 'shipped', 'delivered'].includes(status);

const formatMoney = (amount: number) => `¥${amount.toFixed(2)}`;

const getJourneyIndex = (status: OrderStatus): number => {
  if (status === 'pending_payment') return 0;
  if (status === 'paid' || status === 'processing') return 1;
  if (status === 'shipped') return 2;
  if (status === 'delivered' || status === 'completed' || status === 'refunding' || status === 'refunded') return 3;
  return 0;
};

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ t, orderId, onBack }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const { orderCounts, orders, currentOrder, loadOrder, loadOrders, payOrder, cancelOrder, requestRefund, confirmDelivery } = useOrders();
  const [pendingAction, setPendingAction] = React.useState(false);

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

  const paymentMethodText: Record<string, string> = React.useMemo(
    () => ({
      wechat_pay: tr('commerce.order.payment.wechat', 'WeChat Pay'),
      alipay: tr('commerce.order.payment.alipay', 'Alipay'),
      balance: tr('commerce.order.payment.balance', 'Balance'),
      credit_card: tr('commerce.order.payment.credit_card', 'Credit Card'),
      cod: tr('commerce.order.payment.cod', 'Cash on Delivery'),
    }),
    [tr]
  );

  const statusMeta: Record<OrderStatus, StatusMeta> = React.useMemo(
    () => ({
      pending_payment: {
        title: tr('commerce.order_detail.meta.pending_payment.title', 'Awaiting Payment'),
        subtitle: tr(
          'commerce.order_detail.meta.pending_payment.subtitle',
          'Please complete payment soon, or the order will close automatically'
        ),
        tone: 'warning',
      },
      paid: {
        title: tr('commerce.order_detail.meta.paid.title', 'Paid, Awaiting Shipment'),
        subtitle: tr('commerce.order_detail.meta.paid.subtitle', 'The seller is preparing your order'),
        tone: 'info',
      },
      processing: {
        title: tr('commerce.order_detail.meta.processing.title', 'Processing'),
        subtitle: tr('commerce.order_detail.meta.processing.subtitle', 'The seller is processing your order'),
        tone: 'info',
      },
      shipped: {
        title: tr('commerce.order_detail.meta.shipped.title', 'Shipped'),
        subtitle: tr('commerce.order_detail.meta.shipped.subtitle', 'Please check your logistics updates'),
        tone: 'info',
      },
      delivered: {
        title: tr('commerce.order_detail.meta.delivered.title', 'Awaiting Confirmation'),
        subtitle: tr('commerce.order_detail.meta.delivered.subtitle', 'Items delivered, please confirm receipt'),
        tone: 'success',
      },
      completed: {
        title: tr('commerce.order_detail.meta.completed.title', 'Completed'),
        subtitle: tr('commerce.order_detail.meta.completed.subtitle', 'Thanks for your purchase'),
        tone: 'success',
      },
      cancelled: {
        title: tr('commerce.order_detail.meta.cancelled.title', 'Cancelled'),
        subtitle: tr('commerce.order_detail.meta.cancelled.subtitle', 'You can place a new order anytime'),
        tone: 'neutral',
      },
      refunding: {
        title: tr('commerce.order_detail.meta.refunding.title', 'Refunding'),
        subtitle: tr('commerce.order_detail.meta.refunding.subtitle', 'Your refund request is under review'),
        tone: 'warning',
      },
      refunded: {
        title: tr('commerce.order_detail.meta.refunded.title', 'Refunded'),
        subtitle: tr(
          'commerce.order_detail.meta.refunded.subtitle',
          'The amount has been returned to original payment method'
        ),
        tone: 'success',
      },
    }),
    [tr]
  );

  React.useEffect(() => {
    const bootstrap = async () => {
      if (orderId) {
        await loadOrder(orderId);
        return;
      }

      if (orders.length > 0) {
        await loadOrder(orders[0].id);
        return;
      }

      const firstPage = await loadOrders({ page: 1, pageSize: 1 });
      const first = firstPage.orders[0];
      if (first) {
        await loadOrder(first.id);
      }
    };

    void bootstrap();
  }, [loadOrder, loadOrders, orderId, orders]);

  const order: Order | null = currentOrder || null;

  const journeySteps = React.useMemo<JourneyStep[]>(() => {
    if (!order) return [];

    const currentIndex = getJourneyIndex(order.status);
    const labels = [
      tr('commerce.order_detail.progress_payment', 'Await payment'),
      tr('commerce.order_detail.progress_processing', 'Merchant ready'),
      tr('commerce.order_detail.progress_shipping', 'In transit'),
      tr('commerce.order_detail.progress_completed', 'Close order'),
    ];

    return labels.map((label, index) => ({
      id: `step-${index}`,
      label,
      state: index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'todo',
    }));
  }, [order, tr]);

  const runAction = async (task: () => Promise<void>, successText: string, errorText: string) => {
    if (!order || pendingAction) return;
    setPendingAction(true);
    try {
      await task();
      Toast.success(successText);
      await loadOrder(order.id);
    } catch (error) {
      console.error('[OrderDetailPage] action failed:', error);
      Toast.error(errorText);
    } finally {
      setPendingAction(false);
    }
  };

  const footer = order ? (
    <div className="commerce-order-detail__footer">
      <div className="commerce-order-detail__command-title">{tr('commerce.order_detail.command_title', 'Next action')}</div>
      <div className="commerce-order-detail__command-actions">
        {order.status === 'pending_payment' ? (
          <>
            <Button
              size="sm"
              variant="outline"
              loading={pendingAction}
              onClick={() =>
                void runAction(
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
              loading={pendingAction}
              onClick={() =>
                void runAction(
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
            loading={pendingAction}
            onClick={() =>
              void runAction(
                async () => confirmDelivery(order.id).then(() => undefined),
                tr('commerce.order.action.confirm_success', 'Receipt confirmed'),
                tr('commerce.order.action.confirm_failed', 'Failed to confirm receipt, please try again')
              )
            }
          >
            {tr('commerce.order.action.confirm', 'Confirm Receipt')}
          </Button>
        ) : null}

        {canRefund(order.status) ? (
          <Button
            size="sm"
            variant="outline"
            loading={pendingAction}
            onClick={() =>
              void runAction(
                async () => requestRefund(order.id, 'user_refund_request').then(() => undefined),
                tr('commerce.order.action.refund_success', 'Refund request submitted'),
                tr('commerce.order.action.refund_failed', 'Refund request failed, please try again')
              )
            }
          >
            {tr('commerce.order.action.refund', 'Request Refund')}
          </Button>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <PageScaffold title={tr('commerce.order_detail.title', 'Order Details')} onBack={onBack} footer={footer}>
      {!order ? (
        <EmptyState
          icon="🧾"
          title={tr('commerce.order_detail.not_found', 'Order not found')}
          actionText={tr('common.back', 'Back')}
          onAction={onBack}
        />
      ) : null}

      {order ? (
        <div className="commerce-order-detail">
          <section className="commerce-order-detail__surface">
            <SectionCard style={{ padding: 0, overflow: 'hidden' }}>
              <div className={`commerce-order-detail__status-board commerce-order-detail__status-board--${statusMeta[order.status].tone}`}>
                <div className="commerce-order-detail__status-board-label">
                  {tr('commerce.order_detail.status_board_label', 'Order status')}
                </div>
                <div className="commerce-order-detail__status-board-title">{statusMeta[order.status].title}</div>
                <div className="commerce-order-detail__status-board-subtitle">{statusMeta[order.status].subtitle}</div>

                <div className="commerce-order-detail__summary-grid">
                  <div className="commerce-order-detail__summary-cell">
                    <span>{tr('commerce.order.no', 'Order No')}</span>
                    <strong>{order.orderNo}</strong>
                  </div>
                  <div className="commerce-order-detail__summary-cell">
                    <span>{tr('commerce.order_confirmation.payment_method', 'Payment Method')}</span>
                    <strong>{paymentMethodText[order.paymentMethod] || order.paymentMethod}</strong>
                  </div>
                  <div className="commerce-order-detail__summary-cell">
                    <span>{tr('commerce.order_detail.order_time', 'Order Time')}</span>
                    <strong>{formatDateTime(order.createdAt)}</strong>
                  </div>
                  <div className="commerce-order-detail__summary-cell">
                    <span>{tr('commerce.order_detail.final_amount', 'Final Amount')}</span>
                    <strong>{formatMoney(order.finalAmount)}</strong>
                  </div>
                </div>
              </div>
            </SectionCard>
          </section>

          <section className="commerce-order-detail__surface commerce-order-detail__journey">
            <SectionCard>
              <div className="commerce-order-detail__section-title">
                {tr('commerce.order_detail.progress_title', 'Journey')}
              </div>
              <div className="commerce-order-detail__journey-steps">
                {journeySteps.map((step) => (
                  <div key={step.id} className={`commerce-order-detail__journey-step is-${step.state}`}>
                    <div className="commerce-order-detail__journey-node" />
                    <div className="commerce-order-detail__journey-copy">{step.label}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>

          <section className="commerce-order-detail__surface">
            <SectionCard>
              <div className="commerce-order-detail__section-title">
                {tr('commerce.order_detail.shipping_info', 'Shipping Info')}
              </div>
              <div className="commerce-order-detail__address-name">
                {order.shippingAddress.name} <span>{order.shippingAddress.phone}</span>
              </div>
              <div className="commerce-order-detail__address-text">
                {order.shippingAddress.province}
                {order.shippingAddress.city}
                {order.shippingAddress.district}
                {order.shippingAddress.detail}
              </div>

              <div className="commerce-order-detail__logistics-grid">
                <div className="commerce-order-detail__logistics-cell">
                  <span>{tr('commerce.order_detail.logistics_company', 'Logistics')}</span>
                  <strong>{order.logisticsCompany || tr('commerce.order_detail.logistics_pending', 'Awaiting shipment')}</strong>
                </div>
                <div className="commerce-order-detail__logistics-cell">
                  <span>{tr('commerce.order_detail.tracking_no', 'Tracking No')}</span>
                  <strong>{order.trackingNo || tr('commerce.order_detail.tracking_pending', 'Not generated')}</strong>
                </div>
              </div>
            </SectionCard>
          </section>

          <section className="commerce-order-detail__surface">
            <SectionCard>
              <div className="commerce-order-detail__section-title">
                {tr('commerce.order_detail.product_info', 'Product Info')}
              </div>
              {order.items.map((item) => (
                <div key={item.id} className="commerce-order-detail__item">
                  <div className="commerce-order-detail__item-cover" style={{ backgroundImage: `url(${item.productImage})` }} />
                  <div className="commerce-order-detail__item-main">
                    <div className="commerce-order-detail__item-name">{item.productName}</div>
                    <div className="commerce-order-detail__item-qty">x{item.quantity}</div>
                  </div>
                  <PriceText amount={item.subtotal} />
                </div>
              ))}
            </SectionCard>
          </section>

          <section className="commerce-order-detail__surface">
            <SectionCard>
              <div className="commerce-order-detail__section-title">
                {tr('commerce.order_detail.amount_title', 'Payment breakdown')}
              </div>
              <div className="commerce-order-detail__summary-row">
                <span>{tr('commerce.order_detail.order_status', 'Order Status')}</span>
                <span>{orderStatusText[order.status]}</span>
              </div>
              <div className="commerce-order-detail__summary-row">
                <span>{tr('commerce.order_detail.total_amount', 'Products Total')}</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
              <div className="commerce-order-detail__summary-row">
                <span>{tr('commerce.order_confirmation.shipping_fee', 'Shipping Fee')}</span>
                <span>{formatMoney(order.shippingAmount)}</span>
              </div>
              <div className="commerce-order-detail__summary-row">
                <span>{tr('commerce.order_detail.discount_label', 'Discount')}</span>
                <span>-{formatMoney(order.discountAmount)}</span>
              </div>
              <div className="commerce-order-detail__summary-total">
                <span>{tr('commerce.order_detail.final_amount', 'Final Amount')}</span>
                <PriceText amount={order.finalAmount} />
              </div>
            </SectionCard>
          </section>

          <section className="commerce-order-detail__surface">
            <SectionCard>
              <div className="commerce-order-detail__section-title">
                {tr('commerce.order_detail.overview_title', 'Order portfolio')}
              </div>
              <div className="commerce-order-detail__overview-grid">
                <div>
                  <span>{orderCounts.pending_payment}</span>
                  <small>{tr('commerce.order.status.pending_payment', 'Pending payment')}</small>
                </div>
                <div>
                  <span>{orderCounts.paid + orderCounts.processing + orderCounts.shipped}</span>
                  <small>{tr('commerce.order_detail.overview_in_progress', 'In progress')}</small>
                </div>
                <div>
                  <span>{orderCounts.completed}</span>
                  <small>{tr('commerce.order.status.completed', 'Completed')}</small>
                </div>
                <div>
                  <span>{orderCounts.refunding + orderCounts.refunded}</span>
                  <small>{tr('commerce.order.status.refunding', 'Refunding')}</small>
                </div>
              </div>
            </SectionCard>
          </section>
        </div>
      ) : null}
    </PageScaffold>
  );
};

export default OrderDetailPage;
