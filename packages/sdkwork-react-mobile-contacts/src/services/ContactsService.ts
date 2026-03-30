import {
  resolveServiceFactoryRuntimeDeps,
} from '@sdkwork/react-mobile-core';
import { getAppImSdk, getAppImSessionIdentity } from '@sdkwork/react-mobile-core/im';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Contact, FriendRequest, FriendRequestStatus, IContactsService } from '../types';

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

const DEV_SEED_CONTACTS: Partial<Contact>[] = [
  { id: '1', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Alice', wxid: 'alice_01', region: 'USA' },
  { id: '2', name: 'Agent Smith', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Agent', wxid: 'matrix_001', region: 'Matrix' },
  { id: '3', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Bob', wxid: 'bob_builder', region: 'UK' },
];

const DEV_SEED_REQUESTS: Partial<FriendRequest>[] = [
  {
    id: 'fr-seed-ethan',
    fromUserId: 'new_friend_1',
    fromUserName: 'Ethan',
    fromUserAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Ethan',
    message: 'Hi, I am Ethan. Nice to meet you!',
    status: 'pending',
  },
  {
    id: 'fr-seed-luna',
    fromUserId: 'new_friend_2',
    fromUserName: 'Luna',
    fromUserAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Luna',
    message: 'Can we become friends?',
    status: 'pending',
  },
];

type AnyRecord = Record<string, unknown>;

function toRecord(value: unknown): AnyRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as AnyRecord;
}

function toText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function toEpoch(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 10_000_000_000 ? value : value * 1000;
  }
  const text = toText(value);
  if (!text) {
    return fallback;
  }
  const asNumber = Number(text);
  if (Number.isFinite(asNumber)) {
    return asNumber > 10_000_000_000 ? asNumber : asNumber * 1000;
  }
  const asDate = Date.parse(text);
  if (!Number.isNaN(asDate)) {
    return asDate;
  }
  return fallback;
}

function normalizeStatus(value: unknown): FriendRequestStatus {
  const normalized = toText(value).toLowerCase();
  if (normalized === 'accepted' || normalized === 'approved' || normalized === 'accept' || normalized === 'pass') {
    return 'accepted';
  }
  if (normalized === 'rejected' || normalized === 'reject' || normalized === 'denied') {
    return 'rejected';
  }
  return 'pending';
}

function isDevRuntime(): boolean {
  const importMetaEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env;
  if (importMetaEnv?.DEV === true) {
    return true;
  }
  const mode = String(importMetaEnv?.MODE ?? '').trim().toLowerCase();
  if (mode === 'development' || mode === 'dev' || mode === 'test') {
    return true;
  }
  const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const nodeEnv = String(processEnv?.NODE_ENV ?? '').trim().toLowerCase();
  return nodeEnv !== 'production';
}

class ContactsServiceImpl implements IContactsService {
  private initialized = false;
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private now(): number {
    return this.deps.clock.now();
  }

  private getImSdk() {
    return getAppImSdk();
  }

  private createAvatar(seed: string): string {
    const normalized = (seed || '').trim() || 'Unknown';
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(normalized)}`;
  }

  private mapRemoteContact(raw: unknown): Contact {
    const source = toRecord(raw);
    const now = this.now();
    const name =
      toText(source.name) ||
      toText(source.nickname) ||
      toText(source.remark) ||
      toText(source.username) ||
      'Unknown';
    const id =
      toText(source.id) ||
      toText(source.contactId) ||
      toText(source.userId) ||
      toText(source.wxid) ||
      this.deps.idGenerator.next('contact');
    const wxid =
      toText(source.wxid) ||
      toText(source.userId) ||
      toText(source.id) ||
      id;
    const avatar = toText(source.avatar) || this.createAvatar(name);
    const createTime = toEpoch(source.createTime ?? source.createdAt, now);
    const updateTime = toEpoch(source.updateTime ?? source.updatedAt, now);

    return {
      id,
      name,
      avatar,
      wxid,
      region: toText(source.region) || 'Unknown',
      phone: toText(source.phone) || undefined,
      email: toText(source.email) || undefined,
      remark: toText(source.remark) || undefined,
      createTime,
      updateTime,
      createdAt: createTime,
    };
  }

  private mapRemoteRequest(raw: unknown): FriendRequest {
    const source = toRecord(raw);
    const now = this.now();
    const fromUserName =
      toText(source.fromUserName) ||
      toText(source.fromName) ||
      toText(source.nickname) ||
      toText(source.name) ||
      'Unknown';
    const fromUserId =
      toText(source.fromUserId) ||
      toText(source.fromId) ||
      toText(source.userId) ||
      this.deps.idGenerator.next('friend');
    const createTime = toEpoch(source.createTime ?? source.createdAt, now);
    const updateTime = toEpoch(source.updateTime ?? source.updatedAt, now);

    return {
      id: toText(source.id) || toText(source.requestId) || this.deps.idGenerator.next('fr'),
      fromUserId,
      fromUserName,
      fromUserAvatar: toText(source.fromUserAvatar) || toText(source.fromAvatar) || this.createAvatar(fromUserName),
      message: toText(source.message) || '',
      status: normalizeStatus(source.status),
      createTime,
      updateTime,
    };
  }

  private unwrapResult<T>(response: unknown, fallback: T, fallbackMessage: string): T {
    if (response === undefined || response === null) {
      return fallback;
    }

    const payload = toRecord(response);
    if (Object.keys(payload).length === 0) {
      return response as T;
    }

    const code = toText(payload.code);
    if (code && !code.startsWith('2')) {
      const message = toText(payload.msg) || toText(payload.message) || fallbackMessage;
      throw new Error(message);
    }

    if ('data' in payload) {
      const data = payload.data as T | undefined;
      return (data ?? fallback) as T;
    }

    return response as T;
  }

  private normalizeContactList(raw: unknown): Contact[] {
    return Array.isArray(raw) ? raw.map((item) => this.mapRemoteContact(item)) : [];
  }

  private normalizeRequestList(raw: unknown): FriendRequest[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw
      .map((item) => this.mapRemoteRequest(item))
      .sort((left, right) => right.createTime - left.createTime);
  }

  private async getContactsFromStorage(): Promise<Contact[]> {
    const data = await Promise.resolve(this.deps.storage.get<Contact[] | string>(STORAGE_KEYS.CONTACTS));
    if (!data) {
      return [];
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data) as unknown;
        return Array.isArray(parsed) ? parsed.map((item) => this.mapRemoteContact(item)) : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(data) ? data.map((item) => this.mapRemoteContact(item)) : [];
  }

  private async saveContactsToStorage(contacts: Contact[]): Promise<void> {
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.CONTACTS, contacts));
  }

  private async getFriendRequestsFromStorage(): Promise<FriendRequest[]> {
    const data = await Promise.resolve(this.deps.storage.get<FriendRequest[] | string>(STORAGE_KEYS.FRIEND_REQUESTS));
    if (!data) {
      return [];
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data) as unknown;
        return this.normalizeRequestList(parsed);
      } catch {
        return [];
      }
    }
    return this.normalizeRequestList(data);
  }

  private async saveFriendRequestsToStorage(requests: FriendRequest[]): Promise<void> {
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.FRIEND_REQUESTS, requests));
  }

  private async upsertContact(contact: Contact): Promise<void> {
    const list = await this.getContactsFromStorage();
    const next = list.some((item) => item.id === contact.id)
      ? list.map((item) => (item.id === contact.id ? { ...item, ...contact, updateTime: this.now() } : item))
      : [contact, ...list];
    await this.saveContactsToStorage(next);
  }

  private async upsertRequest(request: FriendRequest): Promise<void> {
    const list = await this.getFriendRequestsFromStorage();
    const next = list.some((item) => item.id === request.id)
      ? list.map((item) => (item.id === request.id ? { ...item, ...request } : item))
      : [request, ...list];
    await this.saveFriendRequestsToStorage(next.sort((left, right) => right.createTime - left.createTime));
  }

  private async updateRequestStatus(
    requestId: string,
    status: FriendRequestStatus,
  ): Promise<FriendRequest | null> {
    const list = await this.getFriendRequestsFromStorage();
    const now = this.now();
    let target: FriendRequest | null = null;
    const next = list.map((item) => {
      if (item.id !== requestId) {
        return item;
      }
      const updated: FriendRequest = { ...item, status, updateTime: now };
      target = updated;
      return updated;
    });
    await this.saveFriendRequestsToStorage(next);
    return target;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (isDevRuntime()) {
      const contactsData = await Promise.resolve(this.deps.storage.get<unknown>(STORAGE_KEYS.CONTACTS));
      if (!contactsData) {
        const now = this.now();
        const contacts = DEV_SEED_CONTACTS.map((item) => this.mapRemoteContact({ ...item, createTime: now, updateTime: now }));
        await this.saveContactsToStorage(contacts);
      }

      const requestsData = await Promise.resolve(this.deps.storage.get<unknown>(STORAGE_KEYS.FRIEND_REQUESTS));
      if (!requestsData) {
        const now = this.now();
        const requests = DEV_SEED_REQUESTS.map((item, index) =>
          this.mapRemoteRequest({
            ...item,
            createTime: now - (index + 1) * 60 * 60 * 1000,
            updateTime: now - (index + 1) * 60 * 60 * 1000,
          }),
        );
        await this.saveFriendRequestsToStorage(requests);
      }
    }

    this.initialized = true;
  }

  async getContacts(): Promise<Contact[]> {
    await this.init();
    const sdk = this.getImSdk();
    const response = await sdk.contacts.list();
    const data = this.unwrapResult<unknown[]>(response, [], 'Failed to load contacts');
    const contacts = this.normalizeContactList(data);
    await this.saveContactsToStorage(contacts);
    return contacts;
  }

  async getContactById(id: string): Promise<Contact | null> {
    await this.init();
    const sdk = this.getImSdk();
    const response = await sdk.contacts.get(id);
    const data = this.unwrapResult<unknown>(response, null, 'Failed to load contact detail');
    if (!data) {
      return null;
    }
    const contact = this.mapRemoteContact(data);
    await this.upsertContact(contact);
    return contact;
  }

  async findByName(name: string): Promise<Contact | null> {
    await this.init();
    const keyword = (name || '').trim();
    if (!keyword) {
      return null;
    }

    const sdk = this.getImSdk();
    const currentUserId = getAppImSessionIdentity()?.userId;
    const response = currentUserId
      ? await sdk.contacts.search(currentUserId, keyword)
      : await sdk.contacts.list({ keyword });
    const data = this.unwrapResult<unknown[]>(response, [], 'Failed to search contacts');
    const contacts = this.normalizeContactList(data);
    return contacts.find((item) => item.name === keyword) || contacts[0] || null;
  }

  async addContact(contact: Partial<Contact>): Promise<Contact> {
    await this.init();
    const now = this.now();
    const target = toText(contact.wxid) || toText(contact.id) || toText(contact.name);
    if (!target) {
      throw new Error('Contact target is required');
    }

    const draft: Contact = this.mapRemoteContact({
      ...contact,
      id: toText(contact.id) || target,
      wxid: target,
      name: toText(contact.name) || target,
      avatar: toText(contact.avatar),
      createTime: now,
      updateTime: now,
    });

    const message = toText(contact.remark) || `Hi, I am ${draft.name}`;
    const sdk = this.getImSdk();
    const result = await sdk.friends.request({
      toUserId: target,
      message,
    });
    if (!result.success) {
      throw new Error('Failed to send friend request');
    }
    await this.upsertContact(draft);
    this.deps.eventBus.emit(CONTACTS_EVENTS.CONTACT_ADDED, { contact: draft });
    return draft;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    await this.init();
    if (updates.remark !== undefined) {
      const sdk = this.getImSdk();
      const success = await sdk.contacts.setRemark(id, updates.remark || '');
      if (!success) {
        throw new Error('Failed to update contact remark');
      }
    }

    const contacts = await this.getContactsFromStorage();
    const index = contacts.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error('Contact not found');
    }
    contacts[index] = this.mapRemoteContact({
      ...contacts[index],
      ...updates,
      updateTime: this.now(),
    });
    await this.saveContactsToStorage(contacts);
    this.deps.eventBus.emit(CONTACTS_EVENTS.CONTACT_UPDATED, { contact: contacts[index] });
  }

  async deleteContact(id: string): Promise<void> {
    await this.init();
    const sdk = this.getImSdk();
    const success = await sdk.contacts.delete(id);
    if (!success) {
      throw new Error('Failed to delete contact');
    }

    const contacts = await this.getContactsFromStorage();
    const filtered = contacts.filter((item) => item.id !== id);
    await this.saveContactsToStorage(filtered);
    this.deps.eventBus.emit(CONTACTS_EVENTS.CONTACT_DELETED, { id });
  }

  async getGroupedContacts(): Promise<{ groups: Record<string, Contact[]>; sortedKeys: string[] }> {
    const contacts = await this.getContacts();
    contacts.sort((left, right) => left.name.localeCompare(right.name));

    const groups: Record<string, Contact[]> = {};
    contacts.forEach((contact) => {
      const firstChar = (contact.name[0] || '#').toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(contact);
    });

    const sortedKeys = Object.keys(groups).sort((left, right) => {
      if (left === '#') {
        return 1;
      }
      if (right === '#') {
        return -1;
      }
      return left.localeCompare(right);
    });

    return { groups, sortedKeys };
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    await this.init();
    const sdk = this.getImSdk();
    const response = await sdk.friends.requests();
    const data = this.unwrapResult<unknown[]>(response, [], 'Failed to load friend requests');
    const requests = this.normalizeRequestList(data);
    await this.saveFriendRequestsToStorage(requests);
    return requests;
  }

  async sendFriendRequest(toUserId: string, message: string): Promise<FriendRequest> {
    await this.init();
    const now = this.now();
    const requestDraft = this.mapRemoteRequest({
      id: this.deps.idGenerator.next('fr'),
      fromUserId: toUserId,
      fromUserName: toUserId,
      message,
      status: 'pending',
      createTime: now,
      updateTime: now,
    });

    const sdk = this.getImSdk();
    const result = await sdk.friends.request({
      toUserId,
      message,
    });
    if (!result.success) {
      throw new Error('Failed to send friend request');
    }
    const request = this.mapRemoteRequest({
      ...requestDraft,
      id: result.requestId || requestDraft.id,
    });
    await this.upsertRequest(request);
    this.deps.eventBus.emit(CONTACTS_EVENTS.FRIEND_REQUEST_RECEIVED, { request });
    return request;
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    await this.init();
    const sdk = this.getImSdk();
    const success = await sdk.friends.accept(requestId);
    if (!success) {
      throw new Error('Failed to accept friend request');
    }

    const accepted = await this.updateRequestStatus(requestId, 'accepted');
    if (accepted) {
      const contacts = await this.getContactsFromStorage();
      const exists = contacts.some(
        (item) =>
          item.wxid === accepted.fromUserId ||
          item.id === accepted.fromUserId ||
          item.name === accepted.fromUserName,
      );
      if (!exists) {
        const now = this.now();
        const contact = this.mapRemoteContact({
          id: accepted.fromUserId,
          name: accepted.fromUserName,
          avatar: accepted.fromUserAvatar,
          wxid: accepted.fromUserId,
          createTime: now,
          updateTime: now,
        });
        await this.upsertContact(contact);
      }
      this.deps.eventBus.emit(CONTACTS_EVENTS.FRIEND_REQUEST_ACCEPTED, { request: accepted });
    }
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    await this.init();
    const sdk = this.getImSdk();
    const success = await sdk.friends.reject(requestId);
    if (!success) {
      throw new Error('Failed to reject friend request');
    }

    const rejected = await this.updateRequestStatus(requestId, 'rejected');
    if (rejected) {
      this.deps.eventBus.emit(CONTACTS_EVENTS.FRIEND_REQUEST_REJECTED, { request: rejected });
    }
  }
}

export function createContactsService(_deps?: ServiceFactoryDeps): IContactsService {
  return new ContactsServiceImpl(_deps);
}

export const contactsService: IContactsService = createContactsService();
