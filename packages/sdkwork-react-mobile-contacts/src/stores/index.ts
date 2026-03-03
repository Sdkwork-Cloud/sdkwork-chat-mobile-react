export { useContactsStore } from './contactsStore';

// Selectors
export const selectContacts = (state: any) => state.contacts;
export const selectFriendRequests = (state: any) => state.friendRequests;
export const selectGroupedContacts = (state: any) => state.groupedContacts;
export const selectIsLoading = (state: any) => state.isLoading;
