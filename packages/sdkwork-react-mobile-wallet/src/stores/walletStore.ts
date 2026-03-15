import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WalletState } from '../types';
import { walletService } from '../services/WalletService';

interface WalletStore extends WalletState {
  // Actions
  loadBalance: () => Promise<void>;
  loadTransactions: (page?: number) => Promise<void>;
  addTransaction: (title: string, amount: number, category: string) => Promise<void>;
  showBalance: boolean;
  toggleBalance: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      // Initial state
      walletData: null,
      transactions: [],
      isLoading: false,
      error: null,
      showBalance: true,

      // Toggle balance visibility
      toggleBalance: () => {
        const newState = !get().showBalance;
        set({ showBalance: newState });
        void walletService.setShowBalancePreference(newState);
      },

      // Load balance
      loadBalance: async () => {
        set({ isLoading: true, error: null });
        try {
          const walletData = await walletService.getBalance();
          set({ walletData, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      // Load transactions
      loadTransactions: async (page = 1) => {
        set({ isLoading: true, error: null });
        try {
          const transactions = await walletService.getTransactions(page);
          if (page === 1) {
            set({ transactions, isLoading: false });
          } else {
            set((state) => ({
              transactions: [...state.transactions, ...transactions],
              isLoading: false,
            }));
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      // Add transaction
      addTransaction: async (title: string, amount: number, category: string) => {
        try {
          const type: 'income' | 'expense' = category === 'income' ? 'income' : 'expense';
          const transaction = await walletService.addTransaction(type, amount, title);
          set((state) => ({
            transactions: [transaction, ...state.transactions],
          }));
          // Refresh balance
          const walletData = await walletService.getBalance();
          set({ walletData });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        showBalance: state.showBalance,
      }),
    }
  )
);
