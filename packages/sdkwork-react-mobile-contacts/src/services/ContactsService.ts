import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Contact, FriendRequest, IContactsService } from '../types';

const STORAGE_KEYS = {
  CONTACTS: 'sys_contacts_v2',
  FRIEND_REQUESTS: 'sys_friend_requests_v1',
};

const CONTACTS_EVENTS = {
  CONTACT_ADDED: 'contacts:contact_added',
  CONTACT_UPDATED: 'contacts:contact_updated',
  CONTACT_DELETED: 'contacts:contact_deleted',
  FRIEND_REQUEST_RECEIVED: 'contacts:friend_request_received',
  FRIEND_REQUEST_ACCEPTED: 'contacts:friend_request_accepted',
  FRIEND_REQUEST_REJECTED: 'contacts:friend_request_rejected',
} as const;

const SEED_CONTACTS: Partial<Contact>[] = [
  { id: '1', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Alice', wxid: 'alice_01', region: 'USA' },
  { id: '2', name: 'Agent Smith', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Agent', wxid: 'matrix_001', region: 'Matrix' },
  { id: '3', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Bob', wxid: 'bob_builder', region: 'UK' },
  { id: '4', name: 'Catherine', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Catherine', wxid: 'cat_00', region: 'France' },
  { id: '5', name: 'David', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=David', wxid: 'dave_x', region: 'USA' },
  { id: '6', name: 'Elon', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Elon', wxid: 'mars_king', region: 'Mars' },
  { id: '7', name: 'Felix', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Felix', wxid: 'felix_cat', region: 'Germany' },
  { id: '8', name: 'George', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=George', wxid: 'geo_jungle', region: 'Africa' },
  { id: '9', name: 'Harry', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Harry', wxid: 'wizard_h', region: 'UK' },
  { id: '10', name: 'Ivy', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Ivy', wxid: 'poison_ivy', region: 'Gotham' },
];

class ContactsServiceImpl implements IContactsService {
  private initialized = false;
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private now(): number {
    return this.deps.clock.now();
  }

  private async getContactsFromStorage(): Promise<Contact[]> {
    const data = await Promise.resolve(this.deps.storage.get<Contact[] | string>(STORAGE_KEYS.CONTACTS));
    if (!data) return [];

    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as Contact[];
      } catch {
        return [];
      }
    }

    return data;
  }

  private async saveContactsToStorage(contacts: Contact[]): Promise<void> {
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.CONTACTS, contacts));
  }

  private async getFriendRequestsFromStorage(): Promise<FriendRequest[]> {
    const data = await Promise.resolve(this.deps.storage.get<FriendRequest[] | string>(STORAGE_KEYS.FRIEND_REQUESTS));
    if (!data) return [];

    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as FriendRequest[];
      } catch {
        return [];
      }
    }

    return data;
  }

  private async saveFriendRequestsToStorage(requests: FriendRequest[]): Promise<void> {
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.FRIEND_REQUESTS, requests));
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const contactsData = await Promise.resolve(this.deps.storage.get<unknown>(STORAGE_KEYS.CONTACTS));
    if (!contactsData) {
      const now = this.now();
      const contacts = SEED_CONTACTS.map((c) => ({
        ...c,
        createTime: now,
        updateTime: now,
      })) as Contact[];
      await this.saveContactsToStorage(contacts);
    }

    const friendRequestsData = await Promise.resolve(this.deps.storage.get<unknown>(STORAGE_KEYS.FRIEND_REQUESTS));
    if (!friendRequestsData) {
      const now = this.now();
      const friendRequests: FriendRequest[] = [
        {
          id: this.deps.idGenerator.next('fr'),
          fromUserId: 'new_friend_1',
          fromUserName: 'Ethan',
          fromUserAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Ethan',
          message: 'Hi, I am Ethan. Nice to meet you!',
          status: 'pending',
          createTime: now - 1000 * 60 * 35,
          updateTime: now - 1000 * 60 * 35,
        },
        {
          id: this.deps.idGenerator.next('fr'),
          fromUserId: 'new_friend_2',
          fromUserName: 'Luna',
          fromUserAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Luna',
          message: 'Can we become friends?',
          status: 'pending',
          createTime: now - 1000 * 60 * 120,
          updateTime: now - 1000 * 60 * 120,
        },
        {
          id: this.deps.idGenerator.next('fr'),
          fromUserId: 'new_friend_3',
          fromUserName: 'Mason',
          fromUserAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Mason',
          message: 'Already connected before.',
          status: 'accepted',
          createTime: now - 1000 * 60 * 60 * 12,
          updateTime: now - 1000 * 60 * 60 * 12,
        },
      ];
      await this.saveFriendRequestsToStorage(friendRequests);
    }

    this.initialized = true;
  }

  async getContacts(): Promise<Contact[]> {
    await this.init();
    return this.getContactsFromStorage();
  }

  async getContactById(id: string): Promise<Contact | null> {
    const contacts = await this.getContacts();
    return contacts.find((c) => c.id === id) || null;
  }

  async findByName(name: string): Promise<Contact | null> {
    const contacts = await this.getContacts();
    return contacts.find((c) => c.name === name) || null;
  }

  async addContact(contact: Partial<Contact>): Promise<Contact> {
    const contacts = await this.getContacts();

    const exists = contacts.some((c) => c.name === contact.name);
    if (exists) throw new Error('Contact already exists');

    const now = this.now();
    const displayName = (contact.name || '').trim() || 'Unknown';
    const newContact: Contact = {
      ...contact,
      id: contact.id || this.deps.idGenerator.next('contact'),
      name: contact.name || displayName,
      avatar: contact.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(displayName)}`,
      wxid: contact.wxid || `wx_${this.deps.idGenerator.next('wx')}`,
      region: contact.region || 'Unknown',
      createTime: contact.createTime || now,
      updateTime: now,
    } as Contact;

    contacts.push(newContact);
    await this.saveContactsToStorage(contacts);

    this.deps.eventBus.emit(CONTACTS_EVENTS.CONTACT_ADDED, { contact: newContact });
    return newContact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    const contacts = await this.getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Contact not found');

    contacts[index] = { ...contacts[index], ...updates, updateTime: this.now() };
    await this.saveContactsToStorage(contacts);

    this.deps.eventBus.emit(CONTACTS_EVENTS.CONTACT_UPDATED, { contact: contacts[index] });
  }

  async deleteContact(id: string): Promise<void> {
    const contacts = await this.getContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    await this.saveContactsToStorage(filtered);

    this.deps.eventBus.emit(CONTACTS_EVENTS.CONTACT_DELETED, { id });
  }

  async getGroupedContacts(): Promise<{ groups: Record<string, Contact[]>; sortedKeys: string[] }> {
    const contacts = await this.getContacts();

    contacts.sort((a, b) => a.name.localeCompare(b.name));

    const groups: Record<string, Contact[]> = {};

    contacts.forEach((contact) => {
      const firstChar = contact.name[0].toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';

      if (!groups[key]) groups[key] = [];
      groups[key].push(contact);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    return { groups, sortedKeys };
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    await this.init();
    const requests = await this.getFriendRequestsFromStorage();
    return [...requests].sort((a, b) => b.createTime - a.createTime);
  }

  async sendFriendRequest(toUserId: string, message: string): Promise<FriendRequest> {
    const requests = await this.getFriendRequests();
    const displayName = (toUserId || '').trim() || 'Unknown';
    const now = this.now();
    const newRequest: FriendRequest = {
      id: this.deps.idGenerator.next('fr'),
      fromUserId: toUserId || `friend_${this.deps.idGenerator.next('friend')}`,
      fromUserName: displayName,
      fromUserAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(displayName)}`,
      message,
      status: 'pending',
      createTime: now,
      updateTime: now,
    };

    requests.push(newRequest);
    await this.saveFriendRequestsToStorage(requests);

    this.deps.eventBus.emit(CONTACTS_EVENTS.FRIEND_REQUEST_RECEIVED, { request: newRequest });
    return newRequest;
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    const requests = await this.getFriendRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    const now = this.now();
    const acceptedRequest: FriendRequest = { ...requests[index], status: 'accepted', updateTime: now };
    requests[index] = acceptedRequest;
    await this.saveFriendRequestsToStorage(requests);

    const contacts = await this.getContacts();
    const exists = contacts.some(
      (contact) =>
        contact.wxid === acceptedRequest.fromUserId ||
        contact.name === acceptedRequest.fromUserName,
    );

    if (!exists) {
      contacts.unshift({
        id: this.deps.idGenerator.next('contact'),
        name: acceptedRequest.fromUserName,
        avatar: acceptedRequest.fromUserAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${acceptedRequest.fromUserName}`,
        wxid: acceptedRequest.fromUserId,
        region: 'Unknown',
        createTime: now,
        updateTime: now,
      });
      await this.saveContactsToStorage(contacts);
    }

    this.deps.eventBus.emit(CONTACTS_EVENTS.FRIEND_REQUEST_ACCEPTED, { request: requests[index] });
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    const requests = await this.getFriendRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    requests[index] = { ...requests[index], status: 'rejected', updateTime: this.now() };
    await this.saveFriendRequestsToStorage(requests);

    this.deps.eventBus.emit(CONTACTS_EVENTS.FRIEND_REQUEST_REJECTED, { request: requests[index] });
  }
}

export function createContactsService(_deps?: ServiceFactoryDeps): IContactsService {
  return new ContactsServiceImpl(_deps);
}

export const contactsService: IContactsService = createContactsService();
