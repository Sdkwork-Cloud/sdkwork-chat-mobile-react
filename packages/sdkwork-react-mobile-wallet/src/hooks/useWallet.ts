import { useCallback, useEffect } from 'react';
import { useWalletStore } from '../stores/walletStore';

export function useWallet() {
  const walletData = useWalletStore((state) => state.walletData);
  const transactions = useWalletStore((state) => state.transactions);
  const isLoading = useWalletStore((state) => state.isLoading);
  const error = useWalletStore((state) => state.error);
  const showBalance = useWalletStore((state) => state.showBalance);

  const loadBalance = useWalletStore((state) => state.loadBalance);
  const loadTransactions = useWalletStore((state) => state.loadTransactions);
  const addTransaction = useWalletStore((state) => state.addTransaction);
  const toggleBalance = useWalletStore((state) => state.toggleBalance);

  useEffect(() => {
    void loadBalance();
    void loadTransactions(1);
  }, [loadBalance, loadTransactions]);

  const handleAddTransaction = useCallback(
    async (title: string, amount: number, category: string) => {
      await addTransaction(title, amount, category);
    },
    [addTransaction]
  );

  return {
    walletData,
    transactions,
    isLoading,
    error,
    showBalance,
    loadBalance,
    loadTransactions,
    addTransaction: handleAddTransaction,
    toggleBalance,
  };
}

export function useBalance() {
  const walletData = useWalletStore((state) => state.walletData);
  const loadBalance = useWalletStore((state) => state.loadBalance);

  useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  return { balance: walletData?.balance || 0, dailyIncome: walletData?.dailyIncome || 0 };
}

export function useTransactions(page = 1) {
  const transactions = useWalletStore((state) => state.transactions);
  const isLoading = useWalletStore((state) => state.isLoading);
  const loadTransactions = useWalletStore((state) => state.loadTransactions);

  useEffect(() => {
    void loadTransactions(page);
  }, [loadTransactions, page]);

  return { transactions, isLoading };
}
