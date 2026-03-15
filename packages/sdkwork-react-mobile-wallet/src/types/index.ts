/**
 * Wallet data
 */
export interface WalletData {
  balance: number;
  currency: string;
  dailyIncome: number;
}

/**
 * Wallet transaction record
 */
export interface Transaction {
  id: string;
  createTime: number;
  updateTime: number;
  title: string;
  description?: string;
  amount: number;
  category?: string;
  type: 'income' | 'expense';
}

/**
 * Wallet store state
 */
export interface WalletState {
  walletData: WalletData | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Red packet data
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
 * Wallet event types
 */
export type WalletEventType =
  | 'wallet:balance_updated'
  | 'wallet:transaction_added'
  | 'wallet:red_packet_received';

/**
 * Wallet event payloads
 */
export interface WalletEventPayload {
  'wallet:balance_updated': { balance: number };
  'wallet:transaction_added': { transaction: Transaction };
  'wallet:red_packet_received': { redPacket: RedPacket };
}

/**
 * Wallet service contract
 */
export interface IWalletService {
  getBalance(): Promise<WalletData>;
  getTransactions(page?: number, size?: number): Promise<Transaction[]>;
  addTransaction(type: 'income' | 'expense', amount: number, description: string): Promise<Transaction>;
  setShowBalancePreference(showBalance: boolean): Promise<void>;
}

/**
 * Red packet service contract
 */
export interface IRedPacketService {
  openRedPacket(id: string): Promise<number>;
  sendRedPacket(toUserId: string, amount: number, message: string): Promise<RedPacket>;
}
