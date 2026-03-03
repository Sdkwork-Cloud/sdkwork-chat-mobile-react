/**
 * Core Type Definitions
 * Domain entities, API types, and shared interfaces
 */

// ============================================================================
// Base Entity Types
// ============================================================================

export interface BaseEntity {
  id: string;
  createTime: number;
  updateTime: number;
}

export interface AuditableEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface Result<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PageRequest {
  page: number;
  size: number;
}

export interface Page<T> {
  content: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export type SortOrder = 'asc' | 'desc';

export interface Sort {
  field: string;
  order: SortOrder;
}

// ============================================================================
// Filter Types
// ============================================================================

export type FilterOperator = 
  | 'eq' | 'neq'           // Equality
  | 'gt' | 'gte'           // Greater than
  | 'lt' | 'lte'           // Less than
  | 'contains'             // String contains
  | 'startsWith'           // String starts with
  | 'endsWith'             // String ends with
  | 'in' | 'nin'           // In / Not in array
  | 'between'              // Range
  | 'isNull' | 'isNotNull' // Null check
  | 'arrayContains';       // Array contains

export interface FilterCriterion {
  field: string;
  operator: FilterOperator;
  value?: any;
  valueTo?: any; // For between operator
}

export interface QueryParams {
  pageRequest?: PageRequest;
  sort?: Sort;
  filters?: FilterCriterion[];
  keywords?: string;
}

// ============================================================================
// Service Interface
// ============================================================================

export interface IBaseService<T extends BaseEntity> {
  save(entity: Partial<T>): Promise<T>;
  saveAll(entities: T[]): Promise<boolean>;
  findById(id: string): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  findAll(params?: QueryParams): Promise<Page<T>>;
  count(params?: QueryParams): Promise<number>;
  subscribe(callback: (event: { type: string; data: T }) => void): () => void;
}

/**
 * Shared dependency contract for service factories.
 * Keep this interface backward compatible and only add optional fields.
 * This reserves a typed DI extension point for SDK integration.
 */
export interface ServiceApiClient {
  request?<T>(path: string, options?: Record<string, unknown>): Promise<T>;
  get?<T>(path: string, options?: Record<string, unknown>): Promise<T>;
  post?<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
  put?<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
  delete?<T>(path: string, options?: Record<string, unknown>): Promise<T>;
}

export interface ServiceStorageAdapter {
  get<T>(key: string): Promise<T | null | undefined> | T | null | undefined;
  set<T>(key: string, value: T): Promise<void> | void;
  remove(key: string): Promise<void> | void;
}

export interface ServiceEventBusAdapter {
  emit<T>(event: string, payload?: T): void;
  on<T>(event: string, handler: (payload: T) => void): () => void;
}

export interface ServiceLoggerAdapter {
  info(tag: string, message: string, payload?: unknown): void;
  warn(tag: string, message: string, payload?: unknown): void;
  error(tag: string, message: string, payload?: unknown): void;
  debug(tag: string, message: string, payload?: unknown): void;
}

export interface ServiceClock {
  now(): number;
}

export interface ServiceIdGenerator {
  next(prefix?: string): string;
}

export interface ServiceCommandResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ServiceCommandAdapter {
  execute<T>(command: { type: string; payload?: unknown }): Promise<ServiceCommandResult<T>>;
}

/**
 * Minimal runtime dependency set for service factories.
 * These are the stable integration points for SDK/native/web adaptation.
 */
export interface ServiceFactoryRuntimeDeps {
  storage: ServiceStorageAdapter;
  eventBus: ServiceEventBusAdapter;
  logger: ServiceLoggerAdapter;
  clock: ServiceClock;
  idGenerator: ServiceIdGenerator;
  command: ServiceCommandAdapter;
}

/**
 * Backward-compatible service factory dependency contract.
 * Keep all fields optional to avoid breaking existing modules.
 */
export interface ServiceFactoryDeps extends Partial<ServiceFactoryRuntimeDeps> {
  sdk?: unknown;
  apiClient?: ServiceApiClient;
  [key: string]: unknown;
}

// ============================================================================
// User & Auth Types
// ============================================================================

export interface User extends BaseEntity {
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'banned';
  role: 'user' | 'admin' | 'moderator';
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================================
// Chat Types
// ============================================================================

export interface ChatMessage extends BaseEntity {
  chatId: string;
  senderId: string;
  content: string;
  contentType: 'text' | 'image' | 'audio' | 'video' | 'file' | 'location';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession extends BaseEntity {
  type: 'private' | 'group' | 'ai';
  title?: string;
  avatar?: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
}

// ============================================================================
// UI Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'wechat-dark' | 'midnight-blue';

export interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
}

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ActionSheetOption {
  text: string;
  value: string;
  destructive?: boolean;
  disabled?: boolean;
}

// ============================================================================
// Navigation Types
// ============================================================================

export interface RouteDefinition {
  path: string;
  component: React.ComponentType<any>;
  layout?: 'main' | 'none' | 'fullscreen';
  public?: boolean;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    keepAlive?: boolean;
  };
}

export interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : any;

export interface Disposable {
  dispose(): void;
}

export type EventHandler<T = void> = (payload: T) => void;

export type Unsubscribe = () => void;

// ============================================================================
// Component Base Types (Migrated from src/types)
// ============================================================================

import React from 'react';

/**
 * The Standard Base Props for all UI Components.
 * Adheres to the Open-Closed Principle: open for extension (via style/className/children), closed for modification.
 */
export interface BaseProps {
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles (use sparingly, prefer className) */
  style?: React.CSSProperties;
  /** Content */
  children?: React.ReactNode;
  /** Test ID for automated testing */
  'data-testid'?: string;
}

/**
 * Standard Props for Input/Form components
 */
export interface BaseInputProps<T> extends Omit<BaseProps, 'children'> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

// ============================================================================
// Legacy Types (Migrated from src/types)
// ============================================================================

/**
 * @deprecated Use Agent from @sdkwork/react-mobile-agents instead
 */
export interface LegacyAgent {
  id: string;
  name: string;
  avatar: string | React.ReactNode;
  description: string;
  systemInstruction: string;
  initialMessage: string;
  tags?: string[];
}
