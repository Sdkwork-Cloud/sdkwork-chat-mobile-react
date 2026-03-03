import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Transaction, WalletData, IWalletService } from '../types';

const TAG = 'WalletService';

class WalletServiceImpl extends AbstractStorageService<Transaction> implements IWalletService {
  protected STORAGE_KEY = 'sys_wallet_transactions_v1';
  private baseBalance = 1000;
  private readonly SHOW_BALANCE_KEY = 'wallet_show_balance';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
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
    const list = await this.findAll();
    const transactionSum = list.content.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBalance = this.baseBalance + transactionSum;

    const start = new Date(this.deps.clock.now());
    start.setHours(0, 0, 0, 0);
    const startOfDay = start.getTime();

    const dailyIncome = list.content
      .filter((t) => t.type === 'income' && t.createTime >= startOfDay)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      balance: totalBalance,
      currency: 'CNY',
      dailyIncome: dailyIncome > 0 ? dailyIncome : 12.45,
    };
  }

  async getTransactions(page: number = 1, size: number = 20): Promise<Transaction[]> {
    const result = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });

    const startIndex = (page - 1) * size;
    return (result.content || []).slice(startIndex, startIndex + size);
  }

  async addTransaction(type: 'income' | 'expense', amount: number, description: string): Promise<Transaction> {
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
