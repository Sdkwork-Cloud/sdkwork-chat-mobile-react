import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createAppSdkCoreConfigMock,
  getAppSdkCoreClientWithSessionMock,
  getOverviewMock,
  listTransactionsMock,
  topupMock,
  loggerWarnMock,
  runtimeDeps,
} = vi.hoisted(() => {
  const getOverview = vi.fn();
  const listTransactions = vi.fn();
  const topup = vi.fn();
  const loggerWarn = vi.fn();
  const deps = {
    storage: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
    logger: {
      warn: loggerWarn,
    },
    clock: {
      now: () => Date.parse('2026-03-15T12:00:00.000Z'),
    },
    idGenerator: {
      next: vi.fn((prefix: string) => `${prefix}_generated`),
    },
  };

  return {
    createAppSdkCoreConfigMock: vi.fn(() => ({ baseUrl: 'https://api.example.com' })),
    getAppSdkCoreClientWithSessionMock: vi.fn(async () => ({
      wallet: {
        getOverview,
        listTransactions,
        topup,
        withdraw: vi.fn(),
      },
    })),
    getOverviewMock: getOverview,
    listTransactionsMock: listTransactions,
    topupMock: topup,
    loggerWarnMock: loggerWarn,
    runtimeDeps: deps,
  };
});

vi.mock('@sdkwork/react-mobile-core', () => ({
  APP_SDK_AUTH_TOKEN_STORAGE_KEY: 'sdkwork_token',
  createAppSdkCoreConfig: createAppSdkCoreConfigMock,
  getAppSdkCoreClientWithSession: getAppSdkCoreClientWithSessionMock,
  resolveServiceFactoryRuntimeDeps: (deps?: Record<string, unknown>) => ({
    ...runtimeDeps,
    ...(deps || {}),
  }),
}));

import { createWalletSdkService } from './WalletSdkService';

describe('WalletSdkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createAppSdkCoreConfigMock.mockReturnValue({ baseUrl: 'https://api.example.com' });
  });

  it('maps wallet overview and same-day income transactions', async () => {
    getOverviewMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        cashAvailable: 256.8,
      },
    });
    listTransactionsMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        content: [
          {
            historyId: 'tx_1',
            transactionType: 'TOPUP',
            transactionTypeName: 'Top Up',
            amount: 20,
            createdAt: '2026-03-15T08:00:00.000Z',
            updatedAt: '2026-03-15T08:00:00.000Z',
          },
          {
            historyId: 'tx_2',
            transactionType: 'WITHDRAW',
            transactionTypeName: 'Withdraw',
            amount: 8,
            createdAt: '2026-03-15T09:00:00.000Z',
            updatedAt: '2026-03-15T09:00:00.000Z',
          },
        ],
      },
    });

    const service = createWalletSdkService();
    const result = await service.getBalance();

    expect(result).toEqual({
      balance: 256.8,
      currency: 'CNY',
      dailyIncome: 20,
    });
  });

  it('maps wallet history to signed transactions', async () => {
    listTransactionsMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        content: [
          {
            historyId: 'tx_1',
            transactionType: 'TOPUP',
            transactionTypeName: 'Top Up',
            amount: 30,
            remarks: 'Recharge',
            createdAt: '2026-03-15T08:00:00.000Z',
            updatedAt: '2026-03-15T08:00:00.000Z',
          },
          {
            historyId: 'tx_2',
            transactionType: 'WITHDRAW',
            transactionTypeName: 'Withdraw',
            amount: 12,
            remarks: 'Cash out',
            createdAt: '2026-03-14T08:00:00.000Z',
            updatedAt: '2026-03-14T08:00:00.000Z',
          },
        ],
      },
    });

    const service = createWalletSdkService();
    const result = await service.getTransactions(1, 20);

    expect(result).toEqual([
      expect.objectContaining({ id: 'tx_1', type: 'income', amount: 30 }),
      expect.objectContaining({ id: 'tx_2', type: 'expense', amount: -12 }),
    ]);
  });

  it('maps topup operation result to income transaction', async () => {
    topupMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        transactionId: 'wallet_income_1',
        amount: 88,
        operationType: 'TOPUP',
        statusName: 'Success',
        processedAt: '2026-03-15T10:00:00.000Z',
      },
    });

    const service = createWalletSdkService();
    const result = await service.topup(88, 'Recharge');

    expect(result).toEqual(expect.objectContaining({
      id: 'wallet_income_1',
      type: 'income',
      amount: 88,
      title: 'Recharge',
    }));
  });

  it('returns null and records warning on business failure', async () => {
    listTransactionsMock.mockResolvedValue({
      code: '5001',
      msg: 'wallet offline',
      data: {
        content: [],
      },
    });

    const service = createWalletSdkService();
    const result = await service.getTransactions();

    expect(result).toBeNull();
    expect(service.getLastError()).toEqual({
      code: '5001',
      message: 'wallet offline',
    });
    expect(loggerWarnMock).toHaveBeenCalled();
  });
});
