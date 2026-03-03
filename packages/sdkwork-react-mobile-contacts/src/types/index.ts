import type { BaseEntity } from '@sdkwork/react-mobile-core';

/**
 * 联系人
 */
export interface Contact extends BaseEntity {
  name: string;
  avatar: string;
  wxid: string;
  region: string;
  phone?: string;
  email?: string;
  remark?: string;
  createdAt?: number;
  isNew?: boolean;
}

/**
 * 好友请求状态
 */
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

/**
 * 好友请求
 */
export interface FriendRequest extends BaseEntity {
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  message: string;
  status: FriendRequestStatus;
}

/**
 * 联系人状态
 */
export interface ContactsState {
  contacts: Contact[];
  friendRequests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
}

/**
 * 分组联系人
 */
export interface GroupedContacts {
  groups: Record<string, Contact[]>;
  sortedKeys: string[];
  totalCount: number;
}

/**
 * 联系人事件类型
 */
export type ContactsEventType =
  | 'contacts:contact_added'
  | 'contacts:contact_deleted'
  | 'contacts:contact_updated'
  | 'contacts:friend_request_received'
  | 'contacts:friend_request_accepted'
  | 'contacts:friend_request_rejected';

/**
 * 联系人事件载荷
 */
export interface ContactsEventPayload {
  'contacts:contact_added': { contact: Contact };
  'contacts:contact_deleted': { id: string };
  'contacts:contact_updated': { contact: Contact };
  'contacts:friend_request_received': { request: FriendRequest };
  'contacts:friend_request_accepted': { request: FriendRequest };
  'contacts:friend_request_rejected': { request: FriendRequest };
}

// Backward compatibility
export type ContactsEvent = ContactsEventType;

/**
 * 联系人服务接口
 */
export interface IContactService {
  getContacts(): Promise<Contact[]>;
  getGroupedContacts(): Promise<GroupedContacts>;
  findByName(name: string): Promise<Contact | null>;
  addContact(contact: Partial<Contact>): Promise<Contact>;
  removeContact(id: string): Promise<void>;
}

/**
 * 好友请求服务接口
 */
export interface IFriendRequestService {
  getFriendRequests(): Promise<FriendRequest[]>;
  sendRequest(toUserId: string, message: string): Promise<FriendRequest>;
  acceptRequest(requestId: string): Promise<void>;
  rejectRequest(requestId: string): Promise<void>;
  getPendingCount(): Promise<number>;
}

/**
 * 统一联系人服务接口（新标准）
 * 包含联系人与好友请求交互，供 SDK 接入时一次性替换。
 */
export interface IContactsService {
  init(): Promise<void>;
  getContacts(): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | null>;
  findByName(name: string): Promise<Contact | null>;
  addContact(contact: Partial<Contact>): Promise<Contact>;
  updateContact(id: string, updates: Partial<Contact>): Promise<void>;
  deleteContact(id: string): Promise<void>;
  getGroupedContacts(): Promise<{ groups: Record<string, Contact[]>; sortedKeys: string[] }>;
  getFriendRequests(): Promise<FriendRequest[]>;
  sendFriendRequest(toUserId: string, message: string): Promise<FriendRequest>;
  acceptFriendRequest(requestId: string): Promise<void>;
  rejectFriendRequest(requestId: string): Promise<void>;
}
