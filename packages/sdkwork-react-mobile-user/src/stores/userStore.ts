import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserState, UserProfile, Address, InvoiceTitle } from '../types';
import { userService } from '../services/UserService';
import { invoiceService } from '../services/InvoiceService';
import { mapUserCenterProfileToUserProfile, resolveProfileWithFallback } from './profileResolution';
import {
  userCenterService,
  type UserCenterAddress,
  type UserCenterUpdateProfileInput,
} from '../services/UserCenterService';

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

function toTimestamp(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toUserCenterUpdateProfileInput(updates: Partial<UserProfile>): UserCenterUpdateProfileInput {
  return {
    nickname: updates.name?.trim() || undefined,
    region: updates.region?.trim() || undefined,
    bio: updates.signature?.trim() || undefined,
    gender: updates.gender,
    avatar: updates.avatar?.trim() || undefined,
  };
}

function mapUserCenterAddressToAddress(item: UserCenterAddress): Address {
  const now = Date.now();
  const addressId = item.id === undefined || item.id === null ? `addr_${now.toString(36)}` : String(item.id);
  return {
    id: addressId,
    name: (item.name || '').trim(),
    phone: (item.phone || '').trim(),
    province: (item.provinceCode || '').trim() || undefined,
    city: (item.cityCode || '').trim() || undefined,
    district: (item.districtCode || '').trim() || undefined,
    detail: (item.addressDetail || item.fullAddress || '').trim(),
    tag: undefined,
    isDefault: !!item.isDefault,
    createTime: toTimestamp(item.createdAt, now),
    updateTime: toTimestamp(item.updatedAt, now),
  };
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

          const profile = await resolveProfileWithFallback(cachedProfile, {
            getRemoteProfile: () => userCenterService.getUserProfile(),
            getLocalProfile: () => userService.getProfile(),
            createLocalProfile: (fallbackId, fallbackName) => userService.createProfile(fallbackId, fallbackName),
          });

          set({ profile, isLoading: false, error: null });
        } catch {
          const fallbackProfile = get().profile;
          set({
            profile: fallbackProfile,
            error: 'Failed to load profile',
            isLoading: false,
          });
        }
      },

      // Update profile
      updateProfile: async (updates: Partial<UserProfile>) => {
        set({ isLoading: true });
        try {
          const input = toUserCenterUpdateProfileInput(updates);
          const remoteProfile = await userCenterService.updateUserProfile(input);
          const profile = mapUserCenterProfileToUserProfile(remoteProfile, get().profile);
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
          const remoteAddresses = await userCenterService.listUserAddresses();
          set({
            addresses: remoteAddresses.map(mapUserCenterAddressToAddress),
          });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Save address
      saveAddress: async (address: Partial<Address>) => {
        try {
          const name = (address.name || '').trim();
          const phone = (address.phone || '').trim();
          const detail = (address.detail || '').trim();
          if (!name || !phone || !detail) {
            throw new Error('Address name, phone and detail are required');
          }

          if (address.id) {
            await userCenterService.updateAddress(String(address.id), {
              name,
              phone,
              countryCode: 'CN',
              provinceCode: address.province?.trim() || undefined,
              cityCode: address.city?.trim() || undefined,
              districtCode: address.district?.trim() || undefined,
              addressDetail: detail,
              isDefault: address.isDefault,
            });
          } else {
            await userCenterService.createAddress({
              name,
              phone,
              countryCode: 'CN',
              provinceCode: address.province?.trim() || undefined,
              cityCode: address.city?.trim() || undefined,
              districtCode: address.district?.trim() || undefined,
              addressDetail: detail,
              isDefault: address.isDefault,
            });
          }

          const next = await userCenterService.listUserAddresses();
          set({ addresses: next.map(mapUserCenterAddressToAddress) });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Delete address
      deleteAddress: async (id: string) => {
        try {
          await userCenterService.deleteAddress(id);
          const next = await userCenterService.listUserAddresses();
          set({ addresses: next.map(mapUserCenterAddressToAddress) });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Set default address
      setDefaultAddress: async (id: string) => {
        try {
          await userCenterService.setDefaultAddress(id);
          const next = await userCenterService.listUserAddresses();
          set({ addresses: next.map(mapUserCenterAddressToAddress) });
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
