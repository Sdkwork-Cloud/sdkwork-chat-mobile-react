import type { FriendRequest, IFriendRequestService, IContactsService } from '../types';
import { createContactsService } from './ContactsService';
import type { ServiceFactoryDeps } from '@sdkwork/react-mobile-core';

/**
 * Legacy adapter:
 * keeps backward-compatibility for modules importing `friendRequestService`,
 * while routing all data access to the unified `contactsService`.
 */
class FriendRequestServiceAdapter implements IFriendRequestService {
  constructor(private readonly contacts: IContactsService) {}

  async getFriendRequests(): Promise<FriendRequest[]> {
    return this.contacts.getFriendRequests();
  }

  async sendRequest(toUserId: string, message: string): Promise<FriendRequest> {
    return this.contacts.sendFriendRequest(toUserId, message);
  }

  async acceptRequest(requestId: string): Promise<void> {
    await this.contacts.acceptFriendRequest(requestId);
  }

  async rejectRequest(requestId: string): Promise<void> {
    await this.contacts.rejectFriendRequest(requestId);
  }

  async getPendingCount(): Promise<number> {
    const list = await this.contacts.getFriendRequests();
    return list.filter((item) => item.status === 'pending').length;
  }
}

export function createFriendRequestService(_deps?: ServiceFactoryDeps): IFriendRequestService {
  return new FriendRequestServiceAdapter(createContactsService(_deps));
}

export const friendRequestService: IFriendRequestService = createFriendRequestService();
