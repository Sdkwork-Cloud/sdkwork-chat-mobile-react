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

const canRefund = (status: OrderStatus): boolean => {
  return ['paid', 'processing', 'shipped', 'delivered'].includes(status);
};

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ t, orderId, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { orderCounts, orders, currentOrder, loadOrder, loadOrders, payOrder, cancelOrder, requestRefund, confirmDelivery } = useOrders();
  const [pendingAction, setPendingAction] = React.useState(false);
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
  const paymentMethodText: Record<string, string> = React.useMemo(
    () => ({
      wechat_pay: tr('commerce.order.payment.wechat', '微信支付'),
      alipay: tr('commerce.order.payment.alipay', '支付宝'),
      balance: tr('commerce.order.payment.balance', '余额支付'),
      credit_card: tr('commerce.order.payment.credit_card', '信用卡'),
      cod: tr('commerce.order.payment.cod', '货到付款'),
    }),
    [t]
  );
  const statusMeta: Record<OrderStatus, StatusMeta> = React.useMemo(
    () => ({
      pending_payment: {
        title: tr('commerce.order_detail.meta.pending_payment.title', '等待买家付款'),
        subtitle: tr('commerce.order_detail.meta.pending_payment.subtitle', '请尽快完成支付，超时后订单将自动关闭'),
        tone: 'warning',
      },
      paid: {
        title: tr('commerce.order_detail.meta.paid.title', '支付成功，等待发货'),
        subtitle: tr('commerce.order_detail.meta.paid.subtitle', '商家正在为你准备商品'),
        tone: 'info',
      },
      processing: {
        title: tr('commerce.order_detail.meta.processing.title', '订单处理中'),
        subtitle: tr('commerce.order_detail.meta.processing.subtitle', '商家正在处理你的订单'),
        tone: 'info',
      },
      shipped: {
        title: tr('commerce.order_detail.meta.shipped.title', '商品已发货'),
        subtitle: tr('commerce.order_detail.meta.shipped.subtitle', '请注意查收物流通知'),
        tone: 'info',
      },
      delivered: {
        title: tr('commerce.order_detail.meta.delivered.title', '订单待确认'),
        subtitle: tr('commerce.order_detail.meta.delivered.subtitle', '商品已送达，请确认收货'),
        tone: 'success',
      },
      completed: {
        title: tr('commerce.order_detail.meta.completed.title', '交易完成'),
        subtitle: tr('commerce.order_detail.meta.completed.subtitle', '感谢你的购买，欢迎再次下单'),
        tone: 'success',
      },
      cancelled: {
        title: tr('commerce.order_detail.meta.cancelled.title', '订单已取消'),
        subtitle: tr('commerce.order_detail.meta.cancelled.subtitle', '如有需要可以重新下单'),
        tone: 'neutral',
      },
      refunding: {
        title: tr('commerce.order_detail.meta.refunding.title', '退款处理中'),
        subtitle: tr('commerce.order_detail.meta.refunding.subtitle', '退款申请已提交，请耐心等待审核'),
        tone: 'warning',
      },
      refunded: {
        title: tr('commerce.order_detail.meta.refunded.title', '已退款'),
        subtitle: tr('commerce.order_detail.meta.refunded.subtitle', '款项已按原路退回'),
        tone: 'success',
      },
    }),
    [t]
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
      {order.status === 'pending_payment' ? (
        <>
          <Button
            size="sm"
            variant="outline"
            loading={pendingAction}
            onClick={() =>
              void runAction(
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
            loading={pendingAction}
            onClick={() =>
              void runAction(
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
          loading={pendingAction}
          onClick={() =>
            void runAction(
              async () => confirmDelivery(order.id).then(() => undefined),
              tr('commerce.order.action.confirm_success', '已确认收货'),
              tr('commerce.order.action.confirm_failed', '确认收货失败，请稍后重试')
            )
          }
        >
          {tr('commerce.order.action.confirm', '确认收货')}
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
              tr('commerce.order.action.refund_success', '退款申请已提交'),
              tr('commerce.order.action.refund_failed', '退款申请失败，请稍后重试')
            )
          }
        >
          {tr('commerce.order.action.refund', '申请退款')}
        </Button>
      ) : null}
    </div>
  ) : null;

  return (
    <PageScaffold title={tr('commerce.order_detail.title', '订单详情')} onBack={onBack} footer={footer}>
      {!order ? <EmptyState icon="🧾" title={tr('commerce.order_detail.not_found', '未找到订单')} actionText={tr('common.back', '返回')} onAction={onBack} /> : null}

      {order ? (
        <div className="commerce-order-detail">
          <SectionCard style={{ padding: 0, overflow: 'hidden' }}>
            <div className={`commerce-order-detail__hero commerce-order-detail__hero--${statusMeta[order.status].tone}`}>
              <div className="commerce-order-detail__hero-title">{statusMeta[order.status].title}</div>
              <div className="commerce-order-detail__hero-subtitle">{statusMeta[order.status].subtitle}</div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="commerce-order-detail__section-title">{tr('commerce.order_detail.shipping_info', '收货信息')}</div>
            <div className="commerce-order-detail__address-name">
              {order.shippingAddress.name} <span>{order.shippingAddress.phone}</span>
            </div>
            <div className="commerce-order-detail__address-text">
              {order.shippingAddress.province}
              {order.shippingAddress.city}
              {order.shippingAddress.district}
              {order.shippingAddress.detail}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="commerce-order-detail__section-title">{tr('commerce.order_detail.product_info', '商品信息')}</div>
            {order.items.map((item) => (
              <div key={item.id} className="commerce-order-detail__item">
                <div
                  className="commerce-order-detail__item-cover"
                  style={{ backgroundImage: `url(${item.productImage})` }}
                />
                <div className="commerce-order-detail__item-main">
                  <div className="commerce-order-detail__item-name">{item.productName}</div>
                  <div className="commerce-order-detail__item-qty">x{item.quantity}</div>
                </div>
                <PriceText amount={item.subtotal} />
              </div>
            ))}
          </SectionCard>

          <SectionCard>
            <div className="commerce-order-detail__summary-row">
              <span>{tr('commerce.order_detail.order_status', '订单状态')}</span>
              <span>{orderStatusText[order.status]}</span>
            </div>
            <div className="commerce-order-detail__summary-row">
              <span>{tr('commerce.order.no', '订单号')}</span>
              <span>{order.orderNo}</span>
            </div>
            <div className="commerce-order-detail__summary-row">
              <span>{tr('commerce.order_detail.order_time', '下单时间')}</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="commerce-order-detail__summary-row">
              <span>{tr('commerce.order_confirmation.payment_method', '支付方式')}</span>
              <span>{paymentMethodText[order.paymentMethod] || order.paymentMethod}</span>
            </div>
            <div className="commerce-order-detail__summary-row">
              <span>{tr('commerce.order_detail.total_amount', '商品总额')}</span>
              <span>¥{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="commerce-order-detail__summary-row">
              <span>{tr('commerce.order_confirmation.shipping_fee', '运费')}</span>
              <span>¥{order.shippingAmount.toFixed(2)}</span>
            </div>
            <div className="commerce-order-detail__summary-total">
              <span>{tr('commerce.order_detail.final_amount', '实付款')}</span>
              <PriceText amount={order.finalAmount} />
            </div>
          </SectionCard>

          <SectionCard>
            <div className="commerce-order-detail__count-title">{tr('commerce.order_detail.overview', '订单概况')}</div>
            <div className="commerce-order-detail__count-grid">
              <div>
                <span>{orderCounts.pending_payment}</span>
                <small>{tr('commerce.order.status.pending_payment', '待支付')}</small>
              </div>
              <div>
                <span>{orderCounts.paid + orderCounts.processing}</span>
                <small>{tr('commerce.order_detail.overview_in_progress', '进行中')}</small>
              </div>
              <div>
                <span>{orderCounts.completed}</span>
                <small>{tr('commerce.order.status.completed', '已完成')}</small>
              </div>
              <div>
                <span>{orderCounts.refunding + orderCounts.refunded}</span>
                <small>{tr('commerce.order.status.refunding', '退款中')}</small>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </PageScaffold>
  );
};

export default OrderDetailPage;
