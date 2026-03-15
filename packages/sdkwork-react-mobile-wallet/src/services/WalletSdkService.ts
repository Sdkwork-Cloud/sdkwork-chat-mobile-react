import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  createAppSdkCoreConfig,
  getAppSdkCoreClientWithSession,
  resolveServiceFactoryRuntimeDeps,
} from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  HistoryVO,
  PlusApiResultPageHistoryVO,
  PlusApiResultWalletOperationResultVO,
  PlusApiResultWalletOverviewVO,
  SdkworkAppClient,
  WalletOperationResultVO,
  WalletOverviewVO,
} from '@sdkwork/app-sdk';

import type { Transaction, WalletData } from '../types';

const TAG = 'WalletSdkService';
const SUCCESS_CODE = '2000';

interface WalletSdkError {
  code?: string;
  message: string;
}

export interface IWalletSdkService {
  hasSdkBaseUrl(): boolean;
  getLastError(): WalletSdkError | null;
  getBalance(): Promise<WalletData | null>;
  getTransactions(page?: number, size?: number): Promise<Transaction[] | null>;
  topup(amount: number, description: string): Promise<Transaction | null>;
  withdraw(amount: number, description: string): Promise<Transaction | null>;
}

class WalletSdkServiceImpl implements IWalletSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private lastError: WalletSdkError | null = null;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    return (createAppSdkCoreConfig().baseUrl || '').trim().length > 0;
  }

  getLastError(): WalletSdkError | null {
    return this.lastError;
  }

  private setLastError(error: WalletSdkError | null): void {
    this.lastError = error;
  }

  private isSuccessCode(code: string | undefined): boolean {
    return code === SUCCESS_CODE;
  }

  private failBusiness(result: { code?: string; msg?: string }, fallback: string): null {
    this.setLastError({ code: result.code, message: result.msg || fallback });
    this.deps.logger.warn(TAG, fallback, { code: result.code, message: result.msg });
    return null;
  }

  private failRequest(error: unknown, fallback: string): null {
    const message = error instanceof Error ? error.message : fallback;
    this.setLastError({ message });
    this.deps.logger.warn(TAG, fallback, error);
    return null;
  }

  private toNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }

  private toTimestamp(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }

  private normalizeTransactionType(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLowerCase().replace(/[\s-]+/g, '_') : '';
  }

  private resolveSignedAmount(history: HistoryVO): { amount: number; type: 'income' | 'expense' } {
    const rawAmount = this.toNumber(history.amount, 0);
    const transactionType = this.normalizeTransactionType(history.transactionType);
    const statusName = this.normalizeTransactionType(history.transactionTypeName);
    const description = `${transactionType} ${statusName}`.trim();
    const expenseHints = ['withdraw', 'expense', 'debit', 'consume', 'payment', 'transfer_out', 'deduct', 'refund_out'];
    const isExpense = expenseHints.some((item) => description.includes(item));
    if (rawAmount < 0) {
      return { amount: rawAmount, type: 'expense' };
    }
    if (isExpense) {
      return { amount: -Math.abs(rawAmount), type: 'expense' };
    }
    return { amount: Math.abs(rawAmount), type: 'income' };
  }

  private mapHistoryToTransaction(history: HistoryVO | null | undefined): Transaction | null {
    if (!history || typeof history !== 'object') {
      return null;
    }

    const fallbackTime = this.deps.clock.now();
    const createTime = this.toTimestamp(history.createdAt, fallbackTime);
    const updateTime = this.toTimestamp(history.updatedAt, createTime);
    const { amount, type } = this.resolveSignedAmount(history);
    const id = String(history.historyId || history.transactionId || this.deps.idGenerator.next('wallet_tx')).trim();
    const title = String(history.transactionTypeName || history.transactionType || history.remarks || 'Wallet transaction').trim();
    const description = String(history.remarks || history.statusName || title).trim() || undefined;

    return {
      id,
      title,
      description,
      category: String(history.transactionType || '').trim() || undefined,
      type,
      amount,
      createTime,
      updateTime,
    };
  }

  private mapOperationToTransaction(
    operation: WalletOperationResultVO | null | undefined,
    type: 'income' | 'expense',
    description: string,
  ): Transaction | null {
    if (!operation || typeof operation !== 'object') {
      return null;
    }

    const fallbackTime = this.deps.clock.now();
    const createTime = this.toTimestamp(operation.processedAt || operation.createdAt, fallbackTime);
    const updateTime = this.toTimestamp(operation.updatedAt, createTime);
    const rawAmount = this.toNumber(operation.amount, 0);
    const signedAmount = type === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    return {
      id: String(operation.transactionId || operation.requestNo || this.deps.idGenerator.next('wallet_tx')).trim(),
      title: description,
      description: String(operation.resultDesc || operation.statusName || description).trim() || description,
      category: String(operation.operationType || '').trim() || undefined,
      type,
      amount: signedAmount,
      createTime,
      updateTime,
    };
  }

  private extractDailyIncome(transactions: Transaction[]): number {
    const start = new Date(this.deps.clock.now());
    start.setHours(0, 0, 0, 0);
    const startOfDay = start.getTime();

    return transactions
      .filter((item) => item.type === 'income' && item.createTime >= startOfDay)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  }

  async getBalance(): Promise<WalletData | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const overview = await client.wallet.getOverview() as PlusApiResultWalletOverviewVO;
      if (!this.isSuccessCode(overview.code)) {
        return this.failBusiness(overview, 'Failed to load wallet overview');
      }

      const data = (overview.data || {}) as WalletOverviewVO;
      const balance = this.toNumber(data.cashAvailable, 0);
      const transactionList = await this.getTransactions(1, 50);
      const dailyIncome = transactionList ? this.extractDailyIncome(transactionList) : 0;

      return {
        balance,
        currency: 'CNY',
        dailyIncome,
      };
    } catch (error) {
      return this.failRequest(error, 'Failed to load wallet overview');
    }
  }

  async getTransactions(page = 1, size = 20): Promise<Transaction[] | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const response = await client.wallet.listTransactions({
        page: Math.max(0, page - 1),
        size,
      }) as PlusApiResultPageHistoryVO;

      if (!this.isSuccessCode(response.code)) {
        return this.failBusiness(response, 'Failed to load wallet transactions');
      }

      const content = Array.isArray(response.data?.content) ? response.data.content : [];
      return content
        .map((item) => this.mapHistoryToTransaction(item))
        .filter((item): item is Transaction => item !== null);
    } catch (error) {
      return this.failRequest(error, 'Failed to load wallet transactions');
    }
  }

  async topup(amount: number, description: string): Promise<Transaction | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const response = await client.wallet.topup({
        amount: Math.abs(amount),
        paymentMethod: 'BALANCE',
        remarks: description,
        requestNo: this.deps.idGenerator.next('wallet_topup'),
      }) as PlusApiResultWalletOperationResultVO;

      if (!this.isSuccessCode(response.code)) {
        return this.failBusiness(response, 'Failed to top up wallet');
      }

      return this.mapOperationToTransaction(response.data, 'income', description);
    } catch (error) {
      return this.failRequest(error, 'Failed to top up wallet');
    }
  }

  async withdraw(amount: number, description: string): Promise<Transaction | null> {
    if (!this.hasSdkBaseUrl()) {
      return null;
    }

    this.setLastError(null);

    try {
      const client = await this.getClient();
      const response = await client.wallet.withdraw({
        amount: Math.abs(amount),
        withdrawMethod: 'BALANCE',
        remarks: description,
        requestNo: this.deps.idGenerator.next('wallet_withdraw'),
      }) as PlusApiResultWalletOperationResultVO;

      if (!this.isSuccessCode(response.code)) {
        return this.failBusiness(response, 'Failed to withdraw from wallet');
      }

      return this.mapOperationToTransaction(response.data, 'expense', description);
    } catch (error) {
      return this.failRequest(error, 'Failed to withdraw from wallet');
    }
  }
}

export function createWalletSdkService(_deps?: ServiceFactoryDeps): IWalletSdkService {
  return new WalletSdkServiceImpl(_deps);
}

export const walletSdkService: IWalletSdkService = createWalletSdkService();
