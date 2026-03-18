
import type { BaseEntity, Result } from '@sdkwork/react-mobile-core';
import type { Agent } from './config/agentRegistry';

export interface Message extends BaseEntity {
  id: string;
  createTime: number;
  updateTime: number;
  sessionId: string;
  role: 'user' | 'model' | 'system';
  content: string;
  isStreaming?: boolean;
  status?: 'sending' | 'sent' | 'error'; // Added status
  replyTo?: {
      id: string;
      name: string;
      content: string;
  };
}

export type SessionType = 'agent' | 'group' | 'dm';

export interface ChatSession extends BaseEntity {
  id: string;
  createTime: number;
  updateTime: number;
  type: SessionType;
  agentId: string;
  agentProfile?: Agent;
  title?: string;
  
  // Group Metadata
  groupName?: string;
  groupAnnouncement?: string;
  memberIds?: string[];
  
  lastMessageContent: string;
  lastMessageTime: number;
  unreadCount: number;
  isPinned: boolean;
  isMuted?: boolean; // New: Persistence for mute status
  messages: Message[]; 
  
  // Session Specific Configuration
  sessionConfig?: {
      showAvatar?: boolean;
      backgroundImage?: string; // New: Per-chat background override
  };
}

export interface ChatConfig {
  showUserAvatar: boolean;
  showModelAvatar: boolean;
}

export type ChatStreamStatus = 'loading' | 'idle' | 'error';
export interface ChatStatusChangePayload {
  status: ChatStreamStatus;
  message?: string;
}

export interface CreateChatSessionOptions {
  reuseExisting?: boolean;
  title?: string;
}

export interface IChatService {
  getSessionList(): Promise<Result<ChatSession[]>>;
  createSession(
    agentId: string,
    agentProfile?: Partial<Agent>,
    options?: CreateChatSessionOptions
  ): Promise<Result<ChatSession>>;
  addMessage(sessionId: string, messageData: Partial<Message>): Promise<Result<ChatSession>>;
  clearHistory(sessionId: string): Promise<Result<void>>;
  togglePin(sessionId: string): Promise<Result<void>>;
  deleteMessages(sessionId: string, messageIds: string[]): Promise<Result<void>>;
  updateMessage(sessionId: string, messageId: string, updates: Partial<Message>): Promise<Result<void>>;
  recallMessage(sessionId: string, messageId: string): Promise<Result<void>>;
  updateSessionConfig(
    sessionId: string,
    config: { showAvatar?: boolean; backgroundImage?: string }
  ): Promise<Result<void>>;
  markAsRead(sessionId: string): Promise<Result<void>>;
  setUnreadCount(sessionId: string, count: number): Promise<Result<void>>;
  toggleMute(sessionId: string): Promise<Result<void>>;
  clearAll(): Promise<Result<void>>;
  addMembers(sessionId: string, memberIds: string[]): Promise<Result<void>>;
  updateGroupInfo(
    sessionId: string,
    info: { groupName?: string; groupAnnouncement?: string }
  ): Promise<Result<void>>;
  createGroupSession(groupName: string, memberIds: string[]): Promise<Result<ChatSession>>;
  deleteById(id: string): Promise<boolean>;
  setForwardContent(content: string): Promise<Result<void>>;
  getForwardContent(): Promise<Result<string | null>>;
  clearForwardContent(): Promise<Result<void>>;
  emitStatusChange(payload: ChatStatusChangePayload): void;
  onStatusChange(handler: (payload: ChatStatusChangePayload) => void): () => void;
  onSessionDataChanged(handler: () => void): () => void;
}
