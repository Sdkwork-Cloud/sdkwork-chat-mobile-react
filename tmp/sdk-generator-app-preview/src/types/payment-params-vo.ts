export interface PaymentParamsVO {
  orderId?: string;
  paymentId?: string;
  outTradeNo?: string;
  amount?: string;
  paymentMethod?: string;
  paymentParams?: Record<string, unknown>;
}
