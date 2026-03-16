export interface PaymentStatisticsVO {
  totalPayments?: number;
  pendingPayments?: number;
  successPayments?: number;
  failedPayments?: number;
  closedPayments?: number;
  timeoutPayments?: number;
}
