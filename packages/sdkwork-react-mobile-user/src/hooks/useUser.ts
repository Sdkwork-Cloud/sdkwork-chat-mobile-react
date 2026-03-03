import { useCallback, useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import type { Address, InvoiceTitle, UserProfile } from '../types';

export function useUser() {
  const profile = useUserStore((state) => state.profile);
  const addresses = useUserStore((state) => state.addresses);
  const invoices = useUserStore((state) => state.invoices);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

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
    void loadProfile();
  }, [loadProfile]);

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

  return {
    profile,
    addresses,
    invoices,
    isLoading,
    error,
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
