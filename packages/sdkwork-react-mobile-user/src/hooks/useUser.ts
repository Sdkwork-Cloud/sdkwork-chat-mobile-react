import { useCallback, useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import type { Address, InvoiceTitle, UserProfile } from '../types';
import {
  userCenterService,
  type UserCenterBindPlatform,
  type UserCenterChangePasswordInput,
  type UserCenterHistoryPage,
  type UserCenterHistoryQuery,
  type UserCenterSettings,
  type UserCenterThirdPartyBindInput,
  type UserCenterUpdateSettingsInput,
} from '../services/UserCenterService';

export function useUser() {
  const profile = useUserStore((state) => state.profile);
  const addresses = useUserStore((state) => state.addresses);
  const invoices = useUserStore((state) => state.invoices);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

  const ensureCurrentUser = useUserStore((state) => state.ensureCurrentUser);
  const refreshCurrentUser = useUserStore((state) => state.refreshCurrentUser);
  const updateCurrentUser = useUserStore((state) => state.updateCurrentUser);
  const clearCurrentUser = useUserStore((state) => state.clearCurrentUser);
  const loadProfile = useUserStore((state) => state.loadProfile);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const updateAvatar = useUserStore((state) => state.updateAvatar);
  const loadAddresses = useUserStore((state) => state.loadAddresses);
  const saveAddress = useUserStore((state) => state.saveAddress);
  const deleteAddress = useUserStore((state) => state.deleteAddress);
  const setDefaultAddress = useUserStore((state) => state.setDefaultAddress);
  const loadInvoices = useUserStore((state) => state.loadInvoices);
  const saveInvoice = useUserStore((state) => state.saveInvoice);
  const deleteInvoice = useUserStore((state) => state.deleteInvoice);
  const setCurrentUserId = useUserStore((state) => state.setCurrentUserId);

  useEffect(() => {
    void ensureCurrentUser();
  }, [ensureCurrentUser]);

  const handleUpdateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      await updateProfile(updates);
    },
    [updateProfile]
  );

  const handleUpdateAvatar = useCallback(
    async (file: File) => {
      await updateAvatar(file);
    },
    [updateAvatar]
  );

  const handleSaveAddress = useCallback(
    async (address: Partial<Address>) => {
      await saveAddress(address);
    },
    [saveAddress]
  );

  const handleDeleteAddress = useCallback(
    async (id: string) => {
      await deleteAddress(id);
    },
    [deleteAddress]
  );

  const handleSaveInvoice = useCallback(
    async (invoice: Partial<InvoiceTitle>) => {
      await saveInvoice(invoice);
    },
    [saveInvoice]
  );

  const handleDeleteInvoice = useCallback(
    async (id: string) => {
      await deleteInvoice(id);
    },
    [deleteInvoice]
  );

  const handleChangePassword = useCallback(
    async (input: UserCenterChangePasswordInput) => {
      await userCenterService.changePassword(input);
    },
    []
  );

  const handleGetLoginHistory = useCallback(
    async (params?: UserCenterHistoryQuery): Promise<UserCenterHistoryPage> => {
      return userCenterService.getLoginHistory(params);
    },
    []
  );

  const handleGetGenerationHistory = useCallback(
    async (params?: UserCenterHistoryQuery): Promise<UserCenterHistoryPage> => {
      return userCenterService.getGenerationHistory(params);
    },
    []
  );

  const handleGetUserSettings = useCallback(
    async (): Promise<UserCenterSettings | null> => {
      return userCenterService.getUserSettings();
    },
    []
  );

  const handleUpdateUserSettings = useCallback(
    async (input: UserCenterUpdateSettingsInput): Promise<UserCenterSettings> => {
      return userCenterService.updateUserSettings(input);
    },
    []
  );

  const handleBindEmail = useCallback(
    async (email: string, verifyCode?: string) => {
      const result = await userCenterService.bindEmail(email, verifyCode);
      await loadProfile();
      return result;
    },
    [loadProfile]
  );

  const handleUnbindEmail = useCallback(
    async () => {
      const result = await userCenterService.unbindEmail();
      await loadProfile();
      return result;
    },
    [loadProfile]
  );

  const handleBindPhone = useCallback(
    async (phone: string, verifyCode?: string) => {
      const result = await userCenterService.bindPhone(phone, verifyCode);
      await loadProfile();
      return result;
    },
    [loadProfile]
  );

  const handleUnbindPhone = useCallback(
    async () => {
      const result = await userCenterService.unbindPhone();
      await loadProfile();
      return result;
    },
    [loadProfile]
  );

  const handleBindThirdParty = useCallback(
    async (platform: UserCenterBindPlatform, input?: UserCenterThirdPartyBindInput) => {
      await userCenterService.bindThirdParty(platform, input);
      await loadProfile();
    },
    [loadProfile]
  );

  const handleUnbindThirdParty = useCallback(
    async (platform: UserCenterBindPlatform) => {
      await userCenterService.unbindThirdParty(platform);
      await loadProfile();
    },
    [loadProfile]
  );

  return {
    profile,
    addresses,
    invoices,
    isLoading,
    error,
    ensureCurrentUser,
    refreshCurrentUser,
    updateCurrentUser,
    clearCurrentUser,
    loadProfile,
    updateProfile: handleUpdateProfile,
    updateAvatar: handleUpdateAvatar,
    loadAddresses,
    saveAddress: handleSaveAddress,
    deleteAddress: handleDeleteAddress,
    setDefaultAddress,
    loadInvoices,
    saveInvoice: handleSaveInvoice,
    deleteInvoice: handleDeleteInvoice,
    changePassword: handleChangePassword,
    getLoginHistory: handleGetLoginHistory,
    getGenerationHistory: handleGetGenerationHistory,
    getUserSettings: handleGetUserSettings,
    updateUserSettings: handleUpdateUserSettings,
    bindEmail: handleBindEmail,
    unbindEmail: handleUnbindEmail,
    bindPhone: handleBindPhone,
    unbindPhone: handleUnbindPhone,
    bindThirdParty: handleBindThirdParty,
    unbindThirdParty: handleUnbindThirdParty,
    setCurrentUserId,
  };
}

export function useProfile() {
  const profile = useUserStore((state) => state.profile);
  const isLoading = useUserStore((state) => state.isLoading);
  return { profile, isLoading };
}

export function useAddresses() {
  const addresses = useUserStore((state) => state.addresses);
  const loadAddresses = useUserStore((state) => state.loadAddresses);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  return { addresses };
}

export function useInvoices() {
  const invoices = useUserStore((state) => state.invoices);
  const loadInvoices = useUserStore((state) => state.loadInvoices);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  return { invoices };
}
