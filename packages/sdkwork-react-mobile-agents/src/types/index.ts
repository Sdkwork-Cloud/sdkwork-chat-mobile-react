// ============================================
// Agent Types
// ============================================

export type AgentStatus = 'active' | 'inactive' | 'busy' | 'offline';
export type AgentCapability = 
  | 'chat' 
  | 'image_generation' 
  | 'code_assistant' 
  | 'translation' 
  | 'summarization'
  | 'data_analysis'
  | 'writing'
  | 'coding'
  | 'reasoning'
  | 'creative';

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  provider: string;
  model: string;
  capabilities: AgentCapability[];
  status: AgentStatus;
  isDefault: boolean;
  isFavorite: boolean;
  systemPrompt?: string;
  temperature: number;
  maxTokens: number;
  tags: string[];
  usageCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt?: string;
}

// ============================================
// Conversation Types
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error' | 'streaming';

export interface AgentMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  attachments?: MessageAttachment[];
  status: MessageStatus;
  tokensUsed?: number;
  latency?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'code';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface AgentConversation {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  title: string;
  messages: AgentMessage[];
  messageCount: number;
  totalTokens: number;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Session Types
// ============================================

export interface AgentSession {
  id: string;
  agentId: string;
  conversationId: string;
  status: 'active' | 'paused' | 'ended';
  startTime: string;
  endTime?: string;
  totalMessages: number;
  totalTokens: number;
  cost?: number;
}

// ============================================
// Usage Types
// ============================================

export interface AgentUsage {
  date: string;
  agentId: string;
  requestCount: number;
  tokenCount: number;
  cost: number;
}

export interface AgentStats {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  favoriteAgentId?: string;
  dailyUsage: AgentUsage[];
}

// ============================================
// Template Types
// ============================================

export interface AgentPromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  usageCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Tool Types
// ============================================

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  icon?: string;
  parameters: ToolParameter[];
  isEnabled: boolean;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: unknown;
}

// ============================================
// API Types
// ============================================

export interface StreamChunk {
  id: string;
  content: string;
  isDone: boolean;
  tokensUsed?: number;
}

export interface AgentRequest {
  agentId: string;
  message: string;
  conversationId?: string;
  attachments?: MessageAttachment[];
  stream?: boolean;
}

export interface AgentResponse {
  message: AgentMessage;
  conversationId: string;
  tokensUsed: number;
  latency: number;
}

// ============================================
// Service Contracts
// ============================================

export interface IAgentService {
  initialize(): Promise<void>;
  getAgents(): Promise<Agent[]>;
  getAgentById(id: string): Promise<Agent | null>;
  getDefaultAgent(): Promise<Agent | null>;
  setDefaultAgent(agentId: string): Promise<void>;
  toggleFavorite(agentId: string): Promise<boolean>;
  getFavoriteAgents(): Promise<Agent[]>;
  updateAgentConfig(agentId: string, config: Partial<AgentConfig>): Promise<Agent | null>;
  getConversations(agentId?: string): Promise<AgentConversation[]>;
  getConversationById(id: string): Promise<AgentConversation | null>;
  createConversation(agentId: string, title?: string): Promise<AgentConversation>;
  deleteConversation(id: string): Promise<void>;
  pinConversation(id: string, isPinned: boolean): Promise<void>;
  archiveConversation(id: string): Promise<void>;
  sendMessage(conversationId: string, content: string, role?: MessageRole): Promise<AgentMessage>;
  getTemplates(): Promise<AgentPromptTemplate[]>;
  getTemplatesByCategory(category: string): Promise<AgentPromptTemplate[]>;
  useTemplate(templateId: string): Promise<void>;
  onDefaultAgentChanged(handler: (agentId: string) => void): () => void;
  onFavoriteToggled(handler: (payload: { agentId: string; isFavorite: boolean }) => void): () => void;
  onConfigUpdated(handler: (agent: Agent) => void): () => void;
  onConversationCreated(handler: (conversation: AgentConversation) => void): () => void;
  onConversationDeleted(handler: (conversationId: string) => void): () => void;
  onConversationPinned(handler: (payload: { id: string; isPinned: boolean }) => void): () => void;
  onConversationArchived(handler: (conversationId: string) => void): () => void;
}
