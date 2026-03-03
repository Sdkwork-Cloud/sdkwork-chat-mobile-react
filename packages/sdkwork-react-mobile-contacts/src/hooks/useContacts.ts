import { useCallback, useEffect } from 'react';
import { useContactsStore } from '../stores/contactsStore';
import type { Contact, GroupedContacts } from '../types';

export function useContacts() {
  const contacts = useContactsStore((state) => state.contacts);
  const friendRequests = useContactsStore((state) => state.friendRequests);
  const isLoading = useContactsStore((state) => state.isLoading);
  const error = useContactsStore((state) => state.error);

  const loadContacts = useContactsStore((state) => state.loadContacts);
  const loadGroupedContacts = useContactsStore((state) => state.loadGroupedContacts);
  const addContact = useContactsStore((state) => state.addContact);
  const removeContact = useContactsStore((state) => state.removeContact);
  const loadFriendRequests = useContactsStore((state) => state.loadFriendRequests);
  const sendFriendRequest = useContactsStore((state) => state.sendFriendRequest);
  const acceptFriendRequest = useContactsStore((state) => state.acceptFriendRequest);
  const rejectFriendRequest = useContactsStore((state) => state.rejectFriendRequest);

  useEffect(() => {
    void loadContacts();
    void loadFriendRequests();
  }, [loadContacts, loadFriendRequests]);

  const handleAddContact = useCallback(
    async (contact: Partial<Contact>) => {
      await addContact(contact);
    },
    [addContact]
  );

  const handleRemoveContact = useCallback(
    async (id: string) => {
      await removeContact(id);
    },
    [removeContact]
  );

  const handleSendFriendRequest = useCallback(
    async (toUserId: string, message: string) => {
      await sendFriendRequest(toUserId, message);
    },
    [sendFriendRequest]
  );

  const handleAcceptFriendRequest = useCallback(
    async (requestId: string) => {
      await acceptFriendRequest(requestId);
    },
    [acceptFriendRequest]
  );

  const handleRejectFriendRequest = useCallback(
    async (requestId: string) => {
      await rejectFriendRequest(requestId);
    },
    [rejectFriendRequest]
  );

  const pendingRequestCount = friendRequests.filter((request) => request.status === 'pending').length;

  return {
    contacts,
    friendRequests,
    isLoading,
    error,
    pendingRequestCount,
    loadContacts,
    loadGroupedContacts,
    addContact: handleAddContact,
    removeContact: handleRemoveContact,
    loadFriendRequests,
    sendFriendRequest: handleSendFriendRequest,
    acceptFriendRequest: handleAcceptFriendRequest,
    rejectFriendRequest: handleRejectFriendRequest,
  };
}

export function useContactList() {
  const contacts = useContactsStore((state) => state.contacts);
  const isLoading = useContactsStore((state) => state.isLoading);
  const loadContacts = useContactsStore((state) => state.loadContacts);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  return { contacts, isLoading };
}

export function useGroupedContacts() {
  const loadGroupedContacts = useContactsStore((state) => state.loadGroupedContacts);

  const getGrouped = useCallback(async (): Promise<GroupedContacts> => {
    return loadGroupedContacts();
  }, [loadGroupedContacts]);

  return { getGrouped };
}

export function useFriendRequests() {
  const friendRequests = useContactsStore((state) => state.friendRequests);
  const loadFriendRequests = useContactsStore((state) => state.loadFriendRequests);

  useEffect(() => {
    void loadFriendRequests();
  }, [loadFriendRequests]);

  return { friendRequests };
}
