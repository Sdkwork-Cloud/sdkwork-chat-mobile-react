import type { BaseEntity } from '@sdkwork/react-mobile-core';

/**
 * 钱包数据
 */
export interface WalletData {
  balance: number;
  currency: string;
  dailyIncome: number;
}

/**
 * 交易记录
 */
export interface Transaction extends BaseEntity {
  title: string;
  description?: string;
  amount: number;
  category?: string;
  type: 'income' | 'expense';
}

/**
 * 钱包状态
 */
export interface WalletState {
  walletData: WalletData | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

/**
 * 红包数据
 */
export interface RedPacket {
  id: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  amount?: number;
  status: 'closed' | 'opening' | 'opened';
}

/**
 * 钱包事件类型
 */
export type WalletEventType =
  | 'wallet:balance_updated'
  | 'wallet:transaction_added'
  | 'wallet:red_packet_received';

/**
 * 钱包事件载荷
 */
export interface WalletEventPayload {
  'wallet:balance_updated': { balance: number };
  'wallet:transaction_added': { transaction: Transaction };
  'wallet:red_packet_received': { redPacket: RedPacket };
}

/**
 * 钱包服务接口
 */
export interface IWalletService {
  getBalance(): Promise<WalletData>;
  getTransactions(page?: number, size?: number): Promise<Transaction[]>;
  addTransaction(type: 'income' | 'expense', amount: number, description: string): Promise<Transaction>;
  setShowBalancePreference(showBalance: boolean): Promise<void>;
}

/**
 * 红包服务接口
 */
export interface IRedPacketService {
  openRedPacket(id: string): Promise<number>;
  sendRedPacket(toUserId: string, amount: number, message: string): Promise<RedPacket>;
}
