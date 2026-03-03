import type { OrderStatus } from '../types';

export const formatPrice = (amount: number): string => {
  return Number(amount || 0).toFixed(2);
};

export const formatDateTime = (value: string | undefined): string => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
    2,
    '0'
  )}`;
};

export const formatRelativeTime = (value: string | undefined): string => {
  if (!value) return '--';
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '--';
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < day * 7) return `${Math.floor(diff / day)} 天前`;
  return formatDateTime(value);
};

export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  processing: '处理中',
  shipped: '已发货',
  delivered: '待确认',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
};

export const PAYMENT_METHOD_TEXT: Record<string, string> = {
  wechat_pay: '微信支付',
  alipay: '支付宝',
  balance: '余额支付',
  credit_card: '信用卡',
  cod: '货到付款',
};
