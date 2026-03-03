import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserState, UserProfile, Address, InvoiceTitle } from '../types';
import { userService } from '../services/UserService';
import { addressService } from '../services/AddressService';
import { invoiceService } from '../services/InvoiceService';

interface UserStore extends UserState {
  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  loadAddresses: () => Promise<void>;
  saveAddress: (address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  loadInvoices: () => Promise<void>;
  saveInvoice: (invoice: Partial<InvoiceTitle>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  setCurrentUserId: (id: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      addresses: [],
      invoices: [],
      isLoading: false,
      error: null,

      // Set current user ID
      setCurrentUserId: (id: string) => {
        userService.setCurrentUserId(id);
      },

      // Load profile
      loadProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const cachedProfile = get().profile;
          if (cachedProfile?.id) {
            userService.setCurrentUserId(cachedProfile.id);
          }

          let profile = await userService.getProfile();
          if (!profile) {
            const fallbackId = cachedProfile?.id || `user_${Date.now().toString(36)}`;
            const fallbackName = cachedProfile?.name || fallbackId.slice(-8);
            profile = await userService.createProfile(fallbackId, fallbackName);
          }

          set({ profile, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      // Update profile
      updateProfile: async (updates: Partial<UserProfile>) => {
        set({ isLoading: true });
        try {
          await userService.updateProfile(updates);
          const profile = await userService.getProfile();
          set({ profile, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      // Update avatar
      updateAvatar: async (file: File) => {
        set({ isLoading: true });
        try {
          const avatarUrl = await userService.uploadAvatar(file);
          await userService.updateAvatar(avatarUrl);
          const profile = await userService.getProfile();
          set({ profile, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      // Load addresses
      loadAddresses: async () => {
        try {
          const addresses = await addressService.getAddresses();
          set({ addresses });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Save address
      saveAddress: async (address: Partial<Address>) => {
        try {
          await addressService.saveAddress(address);
          const addresses = await addressService.getAddresses();
          set({ addresses });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Delete address
      deleteAddress: async (id: string) => {
        try {
          await addressService.deleteAddress(id);
          const addresses = await addressService.getAddresses();
          set({ addresses });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Set default address
      setDefaultAddress: async (id: string) => {
        try {
          await addressService.setDefaultAddress(id);
          const addresses = await addressService.getAddresses();
          set({ addresses });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Load invoices
      loadInvoices: async () => {
        try {
          const invoices = await invoiceService.getInvoices();
          set({ invoices });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Save invoice
      saveInvoice: async (invoice: Partial<InvoiceTitle>) => {
        try {
          await invoiceService.saveInvoice(invoice);
          const invoices = await invoiceService.getInvoices();
          set({ invoices });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Delete invoice
      deleteInvoice: async (id: string) => {
        try {
          await invoiceService.deleteInvoice(id);
          const invoices = await invoiceService.getInvoices();
          set({ invoices });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);
