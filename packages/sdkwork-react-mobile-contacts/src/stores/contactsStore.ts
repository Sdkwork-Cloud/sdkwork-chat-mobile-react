import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContactsState, Contact, GroupedContacts } from '../types';
import { contactsService } from '../services/ContactsService';

interface ContactsStore extends ContactsState {
  // Actions
  loadContacts: () => Promise<void>;
  loadGroupedContacts: () => Promise<GroupedContacts>;
  addContact: (contact: Partial<Contact>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  loadFriendRequests: () => Promise<void>;
  sendFriendRequest: (toUserId: string, message: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
}

export const useContactsStore = create<ContactsStore>()(
  persist(
    (set) => ({
      // Initial state
      contacts: [],
      friendRequests: [],
      isLoading: false,
      error: null,

      // Load contacts
      loadContacts: async () => {
        set({ isLoading: true, error: null });
        try {
          const contacts = await contactsService.getContacts();
          set({ contacts, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      // Load grouped contacts
      loadGroupedContacts: async () => {
        set({ isLoading: true, error: null });
        try {
          const grouped = await contactsService.getGroupedContacts();
          const groupedResult: GroupedContacts = {
            groups: grouped.groups,
            sortedKeys: grouped.sortedKeys,
            totalCount: Object.values(grouped.groups).reduce((sum, list) => sum + list.length, 0),
          };
          set({ contacts: Object.values(groupedResult.groups).flat(), isLoading: false });
          return groupedResult;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      // Add contact
      addContact: async (contact: Partial<Contact>) => {
        try {
          await contactsService.addContact(contact);
          const contacts = await contactsService.getContacts();
          set({ contacts });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Remove contact
      removeContact: async (id: string) => {
        try {
          await contactsService.deleteContact(id);
          const contacts = await contactsService.getContacts();
          set({ contacts });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Load friend requests
      loadFriendRequests: async () => {
        try {
          const friendRequests = await contactsService.getFriendRequests();
          set({ friendRequests });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Send friend request
      sendFriendRequest: async (toUserId: string, message: string) => {
        try {
          await contactsService.sendFriendRequest(toUserId, message);
          const friendRequests = await contactsService.getFriendRequests();
          set({ friendRequests });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Accept friend request
      acceptFriendRequest: async (requestId: string) => {
        try {
          await contactsService.acceptFriendRequest(requestId);
          const friendRequests = await contactsService.getFriendRequests();
          const contacts = await contactsService.getContacts();
          set({ friendRequests, contacts });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Reject friend request
      rejectFriendRequest: async (requestId: string) => {
        try {
          await contactsService.rejectFriendRequest(requestId);
          const friendRequests = await contactsService.getFriendRequests();
          set({ friendRequests });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
    }),
    {
      name: 'contacts-storage',
      partialize: (state) => ({
        contacts: state.contacts,
      }),
    }
  )
);
