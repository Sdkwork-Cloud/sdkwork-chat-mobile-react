import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';

import type { IWalletService, Transaction, WalletData } from '../types';
import { createWalletSdkService } from './WalletSdkService';
import type { IWalletSdkService } from './WalletSdkService';

const TAG = 'WalletService';

class WalletServiceImpl extends AbstractStorageService<Transaction> implements IWalletService {
  protected STORAGE_KEY = 'sys_wallet_transactions_v1';
  private baseBalance = 1000;
  private readonly SHOW_BALANCE_KEY = 'wallet_show_balance';
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: IWalletSdkService;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createWalletSdkService(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0) {
      const now = this.deps.clock.now();
      const mockTransactions: Transaction[] = [
        {
          id: 'tx_1',
          title: 'Income',
          type: 'income',
          amount: 100,
          description: 'Initial income',
          createTime: now - 86400000,
          updateTime: now - 86400000,
        },
        {
          id: 'tx_2',
          title: 'Expense',
          type: 'expense',
          amount: -50,
          description: 'Initial expense',
          createTime: now - 172800000,
          updateTime: now - 172800000,
        },
      ];
      list.push(...mockTransactions);
      this.cache = list;
      await this.commit();
      this.deps.logger.info(TAG, 'Mock transactions initialized');
    }
  }

  async getBalance(): Promise<WalletData> {
    const remoteWalletData = await this.sdkService.getBalance();
    if (remoteWalletData) {
      return remoteWalletData;
    }

    const list = await this.findAll();
    const transactionSum = list.content.reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);
    const totalBalance = this.baseBalance + transactionSum;

    const start = new Date(this.deps.clock.now());
    start.setHours(0, 0, 0, 0);
    const startOfDay = start.getTime();

    const dailyIncome = list.content
      .filter((item: Transaction) => item.type === 'income' && item.createTime >= startOfDay)
      .reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);

    return {
      balance: totalBalance,
      currency: 'CNY',
      dailyIncome: dailyIncome > 0 ? dailyIncome : 12.45,
    };
  }

  async getTransactions(page: number = 1, size: number = 20): Promise<Transaction[]> {
    const remoteTransactions = await this.sdkService.getTransactions(page, size);
    if (remoteTransactions) {
      return remoteTransactions;
    }

    const result = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });

    const startIndex = (page - 1) * size;
    return (result.content || []).slice(startIndex, startIndex + size);
  }

  async addTransaction(type: 'income' | 'expense', amount: number, description: string): Promise<Transaction> {
    const remoteTransaction = type === 'income'
      ? await this.sdkService.topup(amount, description)
      : await this.sdkService.withdraw(amount, description);
    if (remoteTransaction) {
      return remoteTransaction;
    }

    const now = this.deps.clock.now();
    const newTransaction: Transaction = {
      id: this.deps.idGenerator.next('tx'),
      title: description,
      type,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      description,
      createTime: now,
      updateTime: now,
    };

    await this.save(newTransaction);
    this.deps.logger.info(TAG, 'Transaction added', { transactionId: newTransaction.id });
    return newTransaction;
  }

  async setShowBalancePreference(showBalance: boolean): Promise<void> {
    try {
      await Promise.resolve(this.deps.storage.set(this.SHOW_BALANCE_KEY, showBalance));
    } catch (error) {
      this.deps.logger.warn(TAG, 'Failed to save showBalance preference', error);
    }
  }
}

export function createWalletService(_deps?: ServiceFactoryDeps): IWalletService {
  return new WalletServiceImpl(_deps);
}

export const walletService: IWalletService = createWalletService();
