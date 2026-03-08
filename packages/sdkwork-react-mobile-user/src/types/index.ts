/**
 * Local entity base shape for user-center models.
 * Keep this aligned with core BaseEntity to avoid dts flattening issues.
 */
export interface UserEntityBase {
  id: string;
  createTime: number;
  updateTime: number;
}

/**
 * 用户状态
 */
export interface UserStatus {
  icon: string;
  text: string;
  isActive: boolean;
}

/**
 * 用户资料
 */
export interface UserProfile extends UserEntityBase {
  name: string;
  wxid: string;
  avatar: string;
  email?: string;
  phone?: string;
  region: string;
  status: UserStatus;
  gender: 'male' | 'female';
  signature: string;
}

/**
 * 地址信息
 */
export interface Address extends UserEntityBase {
  name: string;
  phone: string;
  province?: string;
  city?: string;
  district?: string;
  detail: string;
  tag?: string;
  isDefault?: boolean;
}

/**
 * 发票抬头
 */
export interface InvoiceTitle extends UserEntityBase {
  type: 'company' | 'personal';
  title: string;
  taxNo?: string;
  taxNumber?: string;
  isDefault?: boolean;
}

/**
 * 用户状态
 */
export interface UserState {
  profile: UserProfile | null;
  addresses: Address[];
  invoices: InvoiceTitle[];
  isLoading: boolean;
  error: string | null;
}

/**
 * 用户事件类型
 */
export type UserEventType =
  | 'user:profile_updated'
  | 'user:avatar_updated'
  | 'user:address_added'
  | 'user:address_updated'
  | 'user:invoice_added'
  | 'user:invoice_updated';

/**
 * 用户事件载荷
 */
export interface UserEventPayload {
  'user:profile_updated': { profile: UserProfile };
  'user:avatar_updated': { avatar: string };
  'user:address_added': { address: Address };
  'user:address_updated': { address: Address };
  'user:invoice_added': { invoice: InvoiceTitle };
  'user:invoice_updated': { invoice: InvoiceTitle };
}

/**
 * 用户服务接口
 */
export interface IUserService {
  setCurrentUserId(id: string): void;
  getProfile(): Promise<UserProfile | null>;
  getProfileById(id: string): Promise<UserProfile | null>;
  updateProfile(updates: Partial<UserProfile>): Promise<void>;
  uploadAvatar(file: File): Promise<string>;
  updateAvatar(avatarUrl: string): Promise<void>;
  createProfile(userId: string, username: string): Promise<UserProfile>;
}

export interface AgentPreferenceOverride {
  name?: string;
  description?: string;
}

export interface IAgentPreferenceService {
  getHiddenAgentIds(): Promise<string[]>;
  setHiddenAgentIds(agentIds: string[]): Promise<void>;
  getAgentOverrides(): Promise<Record<string, AgentPreferenceOverride>>;
  setAgentOverrides(overrides: Record<string, AgentPreferenceOverride>): Promise<void>;
}

/**
 * 地址服务接口
 */
export interface IAddressService {
  getAddresses(): Promise<Address[]>;
  saveAddress(address: Partial<Address>): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<void>;
}

/**
 * 发票服务接口
 */
export interface IInvoiceService {
  getInvoices(): Promise<InvoiceTitle[]>;
  saveInvoice(invoice: Partial<InvoiceTitle>): Promise<InvoiceTitle>;
  deleteInvoice(id: string): Promise<void>;
  setDefaultInvoice(id: string): Promise<void>;
}
