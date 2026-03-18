import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps, ServiceStorageAdapter } from '@sdkwork/react-mobile-core';

import type { Agent, AgentConfig, AgentConversation, AgentMessage, AgentPromptTemplate, IAgentService } from '../types';
import { createAgentSdkService } from './AgentSdkService';
import type { IAgentSdkService } from './AgentSdkService';

// Memory storage fallback when runtime storage throws.
const memoryStorage: Map<string, unknown> = new Map();

const createSafeStorage = (storage: ServiceStorageAdapter): ServiceStorageAdapter => ({
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await Promise.resolve(storage.get<T>(key));
      return (value ?? null) as T | null;
    } catch {
      return (memoryStorage.get(key) as T | null) ?? null;
    }
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      await Promise.resolve(storage.set(key, value));
    } catch {
      memoryStorage.set(key, value);
    }
  },
  remove: async (key: string): Promise<void> => {
    try {
      await Promise.resolve(storage.remove(key));
    } catch {
      memoryStorage.delete(key);
    }
  },
});

const STORAGE_KEYS = {
  AGENTS: 'sys_agents_list_v1',
  CONVERSATIONS: 'sys_agents_conversations_v1',
  ARCHIVED_CHAT_CONVERSATIONS: 'sys_agents_archived_chat_conversations_v1',
  TEMPLATES: 'sys_agents_templates_v1',
  FAVORITES: 'sys_agents_favorites_v1',
  DEFAULT_AGENT: 'sys_agents_default_v1',
};

const AGENT_EVENTS = {
  DEFAULT_CHANGED: 'agent:default_changed',
  FAVORITE_TOGGLED: 'agent:favorite_toggled',
  CONFIG_UPDATED: 'agent:config_updated',
  CONVERSATION_CREATED: 'agent:conversation_created',
  CONVERSATION_DELETED: 'agent:conversation_deleted',
  CONVERSATION_PINNED: 'agent:conversation_pinned',
  CONVERSATION_ARCHIVED: 'agent:conversation_archived',
  MESSAGE_SENT: 'agent:message_sent',
} as const;

// Seed agents data
const SEED_AGENTS: Partial<Agent>[] = [
  {
    id: 'agent_gpt4',
    name: 'GPT-4 Assistant',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GPT4',
    description: 'Advanced AI assistant powered by GPT-4. Great for complex reasoning, coding, and creative tasks.',
    provider: 'OpenAI',
    model: 'gpt-4',
    capabilities: ['chat', 'code_assistant', 'writing', 'reasoning', 'creative'],
    status: 'active',
    isDefault: true,
    isFavorite: false,
    temperature: 0.7,
    maxTokens: 4096,
    tags: ['General', 'Coding', 'Writing'],
    usageCount: 0,
    rating: 4.9,
  },
  {
    id: 'agent_claude',
    name: 'Claude Assistant',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Claude',
    description: 'Anthropic\'s Claude AI. Excellent for long-form content, analysis, and thoughtful conversations.',
    provider: 'Anthropic',
    model: 'claude-3-opus',
    capabilities: ['chat', 'summarization', 'writing', 'reasoning', 'data_analysis'],
    status: 'active',
    isDefault: false,
    isFavorite: false,
    temperature: 0.7,
    maxTokens: 4096,
    tags: ['Analysis', 'Writing', 'Research'],
    usageCount: 0,
    rating: 4.8,
  },
  {
    id: 'agent_dalle',
    name: 'DALL-E Artist',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DALLE',
    description: 'AI image generation specialist. Creates stunning images from text descriptions.',
    provider: 'OpenAI',
    model: 'dall-e-3',
    capabilities: ['image_generation', 'creative'],
    status: 'active',
    isDefault: false,
    isFavorite: false,
    temperature: 0.8,
    maxTokens: 1000,
    tags: ['Image', 'Creative', 'Art'],
    usageCount: 0,
    rating: 4.7,
  },
  {
    id: 'agent_coder',
    name: 'Code Expert',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Coder',
    description: 'Specialized coding assistant. Helps with debugging, code review, and programming questions.',
    provider: 'OpenAI',
    model: 'gpt-4',
    capabilities: ['code_assistant', 'coding', 'reasoning'],
    status: 'active',
    isDefault: false,
    isFavorite: false,
    temperature: 0.3,
    maxTokens: 4096,
    tags: ['Coding', 'Development', 'Debugging'],
    usageCount: 0,
    rating: 4.8,
  },
  {
    id: 'agent_translator',
    name: 'Universal Translator',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Translator',
    description: 'Multilingual translation expert. Supports 100+ languages with natural, context-aware translations.',
    provider: 'OpenAI',
    model: 'gpt-4',
    capabilities: ['translation', 'chat'],
    status: 'active',
    isDefault: false,
    isFavorite: false,
    temperature: 0.5,
    maxTokens: 2048,
    tags: ['Translation', 'Language', 'Multilingual'],
    usageCount: 0,
    rating: 4.6,
  },
];

const SEED_TEMPLATES: Partial<AgentPromptTemplate>[] = [
  {
    id: 'tpl_code_review',
    name: 'Code Review',
    description: 'Review code for best practices and potential issues',
    content: 'Please review the following code and provide feedback on:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance optimizations\n4. Security considerations\n\nCode:\n```\n{{code}}\n```',
    category: 'Development',
    tags: ['Code', 'Review', 'Development'],
    variables: ['code'],
    isDefault: true,
  },
  {
    id: 'tpl_summarize',
    name: 'Summarize Text',
    description: 'Create a concise summary of long text',
    content: 'Please summarize the following text in a clear and concise manner. Highlight the key points:\n\n{{text}}',
    category: 'Writing',
    tags: ['Summary', 'Writing', 'Analysis'],
    variables: ['text'],
    isDefault: true,
  },
  {
    id: 'tpl_explain',
    name: 'Explain Like I\'m 5',
    description: 'Explain complex topics in simple terms',
    content: 'Explain the following topic as if I\'m 5 years old. Use simple language and analogies:\n\n{{topic}}',
    category: 'Education',
    tags: ['Explanation', 'Education', 'Simple'],
    variables: ['topic'],
    isDefault: true,
  },
];

const CHAT_AGENT_BEHAVIOR_MAP: Record<string, string> = {
  agent_gpt4: 'omni_core',
  agent_claude: 'agent_writer',
  agent_dalle: 'agent_image',
  agent_coder: 'agent_coder',
  agent_translator: 'agent_english',
};
const CHAT_BRIDGE_GLOBAL_KEY = '__SDKWORK_CHAT_BRIDGE__' as const;
const runtimeImport = new Function('specifier', 'return import(specifier);') as (specifier: string) => Promise<unknown>;

interface ChatBridgeAgentProfile {
  id?: string;
  behaviorId?: string;
  sdkModelId?: string;
  name?: string;
  avatar?: string;
  description?: string;
  systemInstruction?: string;
  tags?: string[];
}

interface ChatBridgeMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'model' | 'system';
  content: string;
  status?: 'sending' | 'sent' | 'error';
  isStreaming?: boolean;
  createTime: number;
  updateTime: number;
}

interface ChatBridgeSession {
  id: string;
  type: 'agent' | 'group' | 'dm';
  agentId: string;
  title?: string;
  agentProfile?: ChatBridgeAgentProfile;
  groupName?: string;
  messages: ChatBridgeMessage[];
  lastMessageContent: string;
  lastMessageTime: number;
  unreadCount: number;
  isPinned: boolean;
  createTime: number;
  updateTime: number;
}

interface ChatBridgeResult<T> {
  success: boolean;
  data?: T;
}

interface ChatBridgeService {
  getSessionList(): Promise<ChatBridgeResult<ChatBridgeSession[]>>;
  createSession(
    agentId: string,
    agentProfile?: ChatBridgeAgentProfile,
    options?: { reuseExisting?: boolean; title?: string }
  ): Promise<ChatBridgeResult<ChatBridgeSession>>;
  addMessage(sessionId: string, message: Partial<ChatBridgeMessage>): Promise<ChatBridgeResult<ChatBridgeSession>>;
  deleteById(id: string): Promise<boolean>;
  togglePin(sessionId: string): Promise<ChatBridgeResult<void>>;
}

type ChatBridgeGlobal = typeof globalThis & {
  [CHAT_BRIDGE_GLOBAL_KEY]?: {
    chatService?: ChatBridgeService;
  };
};

const resolveChatBehaviorId = (agentId: string): string => {
  const normalized = (agentId || '').trim();
  if (!normalized) return 'omni_core';
  return CHAT_AGENT_BEHAVIOR_MAP[normalized] || normalized;
};

const toIso = (value?: number): string => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  return new Date(0).toISOString();
};

const mapChatRoleToAgentRole = (role: ChatBridgeMessage['role']): AgentMessage['role'] => {
  if (role === 'model') return 'assistant';
  return role;
};

const mapAgentRoleToChatRole = (role: AgentMessage['role']): ChatBridgeMessage['role'] => {
  if (role === 'assistant') return 'model';
  return role;
};

const mapChatMessageToAgentMessage = (message: ChatBridgeMessage): AgentMessage => ({
  id: message.id,
  conversationId: message.sessionId,
  role: mapChatRoleToAgentRole(message.role),
  content: message.content,
  status: message.isStreaming ? 'streaming' : message.status || 'sent',
  createdAt: toIso(message.createTime),
  updatedAt: toIso(message.updateTime),
});

const mapChatSessionToAgentConversation = (session: ChatBridgeSession): AgentConversation => {
  const messages = Array.isArray(session.messages) ? session.messages.map(mapChatMessageToAgentMessage) : [];
  return {
    id: session.id,
    agentId: session.agentId,
    agentName: session.agentProfile?.name || session.groupName || session.agentId,
    agentAvatar: session.agentProfile?.avatar,
    title: session.title || session.agentProfile?.name || session.groupName || session.agentId,
    messages,
    messageCount: messages.length,
    totalTokens: 0,
    isPinned: Boolean(session.isPinned),
    isArchived: false,
    lastMessageAt: toIso(session.lastMessageTime),
    createdAt: toIso(session.createTime),
    updatedAt: toIso(session.updateTime),
  };
};

class AgentServiceImpl implements IAgentService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly storage: ServiceStorageAdapter;
  private readonly sdkService: IAgentSdkService;
  private chatServicePromise: Promise<ChatBridgeService | null> | null = null;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.storage = createSafeStorage(this.deps.storage);
    this.sdkService = createAgentSdkService(deps);
  }

  private nowIso(): string {
    return new Date(this.deps.clock.now()).toISOString();
  }

  private async readStoredAgents(): Promise<Agent[]> {
    return await this.storage.get<Agent[]>(STORAGE_KEYS.AGENTS) || [];
  }

  private async writeStoredAgents(agents: Agent[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.AGENTS, agents);
  }

  private async readFavoriteIds(): Promise<string[]> {
    return await this.storage.get<string[]>(STORAGE_KEYS.FAVORITES) || [];
  }

  private async writeFavoriteIds(ids: string[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.FAVORITES, [...new Set(ids)]);
  }

  private async readArchivedChatConversationIds(): Promise<string[]> {
    return await this.storage.get<string[]>(STORAGE_KEYS.ARCHIVED_CHAT_CONVERSATIONS) || [];
  }

  private async writeArchivedChatConversationIds(ids: string[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.ARCHIVED_CHAT_CONVERSATIONS, [...new Set(ids)]);
  }

  private async removeArchivedChatConversationId(id: string): Promise<void> {
    const archivedIds = await this.readArchivedChatConversationIds();
    if (!archivedIds.includes(id)) return;
    await this.writeArchivedChatConversationIds(archivedIds.filter((item) => item !== id));
  }

  private async getChatService(): Promise<ChatBridgeService | null> {
    if (!this.chatServicePromise) {
      const injectedChatService = (globalThis as ChatBridgeGlobal)[CHAT_BRIDGE_GLOBAL_KEY]?.chatService;
      if (injectedChatService) {
        this.chatServicePromise = Promise.resolve(injectedChatService);
      } else {
        this.chatServicePromise = runtimeImport('@sdkwork/react-mobile-chat')
          .then((module) => ((module as { chatService?: ChatBridgeService }).chatService ?? null))
          .catch(() => null);
      }
    }

    return this.chatServicePromise;
  }

  private async listChatConversations(agentId?: string): Promise<AgentConversation[] | null> {
    const chatService = await this.getChatService();
    if (!chatService) return null;

    const [result, archivedIds] = await Promise.all([
      chatService.getSessionList(),
      this.readArchivedChatConversationIds(),
    ]);

    if (!result.success || !Array.isArray(result.data)) {
      return [];
    }

    const archivedSet = new Set(archivedIds);
    return result.data
      .filter((session) => session.type === 'agent')
      .filter((session) => !archivedSet.has(session.id))
      .filter((session) => !agentId || session.agentId === agentId)
      .map(mapChatSessionToAgentConversation);
  }

  private async getChatConversationById(id: string): Promise<AgentConversation | null> {
    const conversations = await this.listChatConversations();
    if (!conversations) return null;
    return conversations.find((conversation) => conversation.id === id) || null;
  }

  private async createChatConversation(agentId: string, title?: string): Promise<AgentConversation | null> {
    const chatService = await this.getChatService();
    if (!chatService) return null;

    const agent = await this.getAgentById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const result = await chatService.createSession(agentId, {
      behaviorId: resolveChatBehaviorId(agentId),
      sdkModelId: (agent.model || '').trim() || agentId,
      name: agent.name,
      avatar: agent.avatar,
      description: agent.description,
      systemInstruction: agent.systemPrompt,
      tags: agent.tags,
    }, {
      reuseExisting: false,
      ...(title ? { title } : {}),
    });

    const session = result.success ? result.data : undefined;
    if (!session) return null;

    await this.removeArchivedChatConversationId(session.id);
    return mapChatSessionToAgentConversation(session);
  }

  private async decorateAgents(agents: Agent[]): Promise<Agent[]> {
    const [defaultId, favoriteIds] = await Promise.all([
      this.storage.get<string>(STORAGE_KEYS.DEFAULT_AGENT),
      this.readFavoriteIds(),
    ]);
    const favoriteSet = new Set(favoriteIds);

    return agents.map((agent) => ({
      ...agent,
      isDefault: agent.id === defaultId,
      isFavorite: favoriteSet.has(agent.id),
    }));
  }

  private async syncRemoteAgents(
    remoteAgents: Agent[],
    options?: { preserveLocalOnly?: boolean },
  ): Promise<Agent[]> {
    const storedAgents = await this.readStoredAgents();
    const storedMap = new Map(storedAgents.map((agent) => [agent.id, agent]));

    const merged = remoteAgents.map((agent) => {
      const previous = storedMap.get(agent.id);
      return {
        ...previous,
        ...agent,
        updatedAt: agent.updatedAt || this.nowIso(),
      };
    });

    const remoteIds = new Set(remoteAgents.map((agent) => agent.id));
    const preservedLocalOnly = options?.preserveLocalOnly
      ? storedAgents.filter((agent) => !remoteIds.has(agent.id))
      : [];
    const decorated = await this.decorateAgents([...merged, ...preservedLocalOnly]);
    await this.writeStoredAgents(decorated);
    return decorated;
  }

  async initialize(): Promise<void> {
    const existingAgents = await this.storage.get(STORAGE_KEYS.AGENTS);
    if (!existingAgents) {
      const agents: Agent[] = SEED_AGENTS.map((agent) => ({
        ...agent,
        createdAt: this.nowIso(),
        updatedAt: this.nowIso(),
      })) as Agent[];
      await this.writeStoredAgents(agents);
      const existingDefaultAgent = await this.storage.get<string>(STORAGE_KEYS.DEFAULT_AGENT);
      if (!existingDefaultAgent) {
        await this.storage.set(STORAGE_KEYS.DEFAULT_AGENT, 'agent_gpt4');
      }
    }

    const existingTemplates = await this.storage.get(STORAGE_KEYS.TEMPLATES);
    if (!existingTemplates) {
      const templates: AgentPromptTemplate[] = SEED_TEMPLATES.map((template) => ({
        ...template,
        usageCount: 0,
        createdAt: this.nowIso(),
        updatedAt: this.nowIso(),
      })) as AgentPromptTemplate[];
      await this.storage.set(STORAGE_KEYS.TEMPLATES, templates);
    }
  }

  async getAgents(): Promise<Agent[]> {
    const remoteAgents = await this.sdkService.getAgents();
    if (remoteAgents) {
      return this.syncRemoteAgents(remoteAgents);
    }

    return this.decorateAgents(await this.readStoredAgents());
  }

  async getAgentById(id: string): Promise<Agent | null> {
    const remoteAgent = await this.sdkService.getAgentById(id);
    if (remoteAgent) {
      const synced = await this.syncRemoteAgents([remoteAgent], { preserveLocalOnly: true });
      return synced.find((agent) => agent.id === id) || null;
    }

    const agents = await this.decorateAgents(await this.readStoredAgents());
    return agents.find((agent) => agent.id === id) || null;
  }

  async getDefaultAgent(): Promise<Agent | null> {
    const defaultId = await this.storage.get<string>(STORAGE_KEYS.DEFAULT_AGENT);
    if (!defaultId) {
      const agents = await this.getAgents();
      return agents.find((agent) => agent.isDefault) || null;
    }
    return this.getAgentById(defaultId);
  }

  async setDefaultAgent(agentId: string): Promise<void> {
    const agents = await this.decorateAgents(await this.readStoredAgents());
    const nextAgents = agents.map((agent) => ({
      ...agent,
      isDefault: agent.id === agentId,
      updatedAt: this.nowIso(),
    }));
    await this.writeStoredAgents(nextAgents);
    await this.storage.set(STORAGE_KEYS.DEFAULT_AGENT, agentId);
    void this.sdkService.markAgentUsed(agentId);
    this.deps.eventBus.emit(AGENT_EVENTS.DEFAULT_CHANGED, agentId);
  }

  async toggleFavorite(agentId: string): Promise<boolean> {
    const agents = await this.decorateAgents(await this.readStoredAgents());
    const agent = agents.find((item) => item.id === agentId);
    if (!agent) {
      return false;
    }

    const nextFavorite = !agent.isFavorite;
    const sdkResult = nextFavorite
      ? await this.sdkService.likeAgent(agentId)
      : await this.sdkService.unlikeAgent(agentId);
    if (sdkResult === false) {
      throw new Error(`Failed to ${nextFavorite ? 'favorite' : 'unfavorite'} agent`);
    }

    const nextAgents = agents.map((item) => item.id === agentId
      ? { ...item, isFavorite: nextFavorite, updatedAt: this.nowIso() }
      : item);
    await this.writeStoredAgents(nextAgents);

    const favoriteIds = await this.readFavoriteIds();
    const nextFavoriteIds = nextFavorite
      ? [...favoriteIds, agentId]
      : favoriteIds.filter((id) => id !== agentId);
    await this.writeFavoriteIds(nextFavoriteIds);

    this.deps.eventBus.emit(AGENT_EVENTS.FAVORITE_TOGGLED, { agentId, isFavorite: nextFavorite });
    return nextFavorite;
  }

  async getFavoriteAgents(): Promise<Agent[]> {
    const remoteFavorites = await this.sdkService.getFavoriteAgents();
    if (remoteFavorites) {
      await this.writeFavoriteIds(remoteFavorites.map((agent) => agent.id));
      const synced = await this.syncRemoteAgents(remoteFavorites.map((agent) => ({ ...agent, isFavorite: true })));
      return synced.filter((agent) => agent.isFavorite);
    }

    const favoriteIds = new Set(await this.readFavoriteIds());
    const agents = await this.decorateAgents(await this.readStoredAgents());
    return agents.filter((agent) => favoriteIds.has(agent.id));
  }

  async updateAgentConfig(agentId: string, config: Partial<AgentConfig>): Promise<Agent | null> {
    const agents = await this.readStoredAgents();
    const agent = agents.find((item) => item.id === agentId);
    if (!agent) {
      return null;
    }

    const nextAgent: Agent = {
      ...agent,
      ...config,
      updatedAt: this.nowIso(),
    };
    const nextAgents = agents.map((item) => item.id === agentId ? nextAgent : item);
    await this.writeStoredAgents(nextAgents);

    this.deps.eventBus.emit(AGENT_EVENTS.CONFIG_UPDATED, nextAgent);
    return nextAgent;
  }

  async getConversations(agentId?: string): Promise<AgentConversation[]> {
    const chatConversations = await this.listChatConversations(agentId);
    if (chatConversations) {
      return chatConversations.sort((left, right) => {
        if (left.isPinned !== right.isPinned) {
          return left.isPinned ? -1 : 1;
        }
        return new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime();
      });
    }

    const conversations = await this.storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];

    if (agentId) {
      return conversations.filter((conversation) => conversation.agentId === agentId);
    }

    return conversations.sort((left, right) => {
      if (left.isPinned !== right.isPinned) {
        return left.isPinned ? -1 : 1;
      }
      return new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime();
    });
  }

  async getConversationById(id: string): Promise<AgentConversation | null> {
    const chatConversation = await this.getChatConversationById(id);
    if (chatConversation) {
      return chatConversation;
    }

    const conversations = await this.storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    return conversations.find((conversation) => conversation.id === id) || null;
  }

  async createConversation(agentId: string, title?: string): Promise<AgentConversation> {
    const chatConversation = await this.createChatConversation(agentId, title);
    if (chatConversation) {
      this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_CREATED, chatConversation);
      return chatConversation;
    }

    const agent = await this.getAgentById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const conversations = await this.storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const conversation: AgentConversation = {
      id: this.deps.idGenerator.next('conv'),
      agentId,
      agentName: agent.name,
      agentAvatar: agent.avatar,
      title: title || `Chat with ${agent.name}`,
      messages: [],
      messageCount: 0,
      totalTokens: 0,
      isPinned: false,
      isArchived: false,
      lastMessageAt: this.nowIso(),
      createdAt: this.nowIso(),
      updatedAt: this.nowIso(),
    };

    conversations.unshift(conversation);
    await this.storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_CREATED, conversation);
    return conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    const chatService = await this.getChatService();
    if (chatService) {
      await chatService.deleteById(id);
      await this.removeArchivedChatConversationId(id);
      this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_DELETED, id);
      return;
    }

    const conversations = await this.storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    await this.storage.set(STORAGE_KEYS.CONVERSATIONS, conversations.filter((conversation) => conversation.id !== id));
    this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_DELETED, id);
  }

  async pinConversation(id: string, isPinned: boolean): Promise<void> {
    const chatService = await this.getChatService();
    if (chatService) {
      const conversation = await this.getChatConversationById(id);
      if (conversation && conversation.isPinned !== isPinned) {
        await chatService.togglePin(id);
      }
      this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_PINNED, { id, isPinned });
      return;
    }

    const conversations = await this.storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const conversation = conversations.find((item) => item.id === id);
    if (!conversation) {
      return;
    }

    conversation.isPinned = isPinned;
    conversation.updatedAt = this.nowIso();
    await this.storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_PINNED, { id, isPinned });
  }

  async archiveConversation(id: string): Promise<void> {
    const chatService = await this.getChatService();
    if (chatService) {
      const archivedIds = await this.readArchivedChatConversationIds();
      if (!archivedIds.includes(id)) {
        await this.writeArchivedChatConversationIds([...archivedIds, id]);
      }
      this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_ARCHIVED, id);
      return;
    }

    const conversations = await this.storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const conversation = conversations.find((item) => item.id === id);
    if (!conversation) {
      return;
    }

    conversation.isArchived = true;
    conversation.updatedAt = this.nowIso();
    await this.storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_ARCHIVED, id);
  }

  async sendMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'assistant' = 'user',
  ): Promise<AgentMessage> {
    const chatService = await this.getChatService();
    if (chatService) {
      const result = await chatService.addMessage(conversationId, {
        role: mapAgentRoleToChatRole(role),
        content,
        status: 'sent',
      });

      const lastMessage = result.data?.messages?.[result.data.messages.length - 1];
      const message = lastMessage
        ? mapChatMessageToAgentMessage(lastMessage)
        : {
            id: this.deps.idGenerator.next('msg'),
            conversationId,
            role,
            content,
            status: 'sent' as const,
            createdAt: this.nowIso(),
            updatedAt: this.nowIso(),
          };

      this.deps.eventBus.emit(AGENT_EVENTS.MESSAGE_SENT, { conversationId, message });
      return message;
    }

    const conversations = await this.storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message: AgentMessage = {
      id: this.deps.idGenerator.next('msg'),
      conversationId,
      role,
      content,
      status: 'sent',
      createdAt: this.nowIso(),
      updatedAt: this.nowIso(),
    };

    conversation.messages.push(message);
    conversation.messageCount = conversation.messages.length;
    conversation.lastMessageAt = message.createdAt;
    conversation.updatedAt = message.createdAt;

    await this.storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    this.deps.eventBus.emit(AGENT_EVENTS.MESSAGE_SENT, { conversationId, message });
    return message;
  }

  async getTemplates(): Promise<AgentPromptTemplate[]> {
    return await this.storage.get<AgentPromptTemplate[]>(STORAGE_KEYS.TEMPLATES) || [];
  }

  async getTemplatesByCategory(category: string): Promise<AgentPromptTemplate[]> {
    const templates = await this.getTemplates();
    return templates.filter((template) => template.category === category);
  }

  async useTemplate(templateId: string): Promise<void> {
    const templates = await this.storage.get<AgentPromptTemplate[]>(STORAGE_KEYS.TEMPLATES) || [];
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    template.usageCount += 1;
    template.updatedAt = this.nowIso();
    await this.storage.set(STORAGE_KEYS.TEMPLATES, templates);
  }

  onDefaultAgentChanged(handler: (agentId: string) => void): () => void {
    return this.deps.eventBus.on(AGENT_EVENTS.DEFAULT_CHANGED, handler);
  }

  onFavoriteToggled(handler: (payload: { agentId: string; isFavorite: boolean }) => void): () => void {
    return this.deps.eventBus.on(AGENT_EVENTS.FAVORITE_TOGGLED, handler);
  }

  onConfigUpdated(handler: (agent: Agent) => void): () => void {
    return this.deps.eventBus.on(AGENT_EVENTS.CONFIG_UPDATED, handler);
  }

  onConversationCreated(handler: (conversation: AgentConversation) => void): () => void {
    return this.deps.eventBus.on(AGENT_EVENTS.CONVERSATION_CREATED, handler);
  }

  onConversationDeleted(handler: (conversationId: string) => void): () => void {
    return this.deps.eventBus.on(AGENT_EVENTS.CONVERSATION_DELETED, handler);
  }

  onConversationPinned(handler: (payload: { id: string; isPinned: boolean }) => void): () => void {
    return this.deps.eventBus.on(AGENT_EVENTS.CONVERSATION_PINNED, handler);
  }

  onConversationArchived(handler: (conversationId: string) => void): () => void {
    return this.deps.eventBus.on(AGENT_EVENTS.CONVERSATION_ARCHIVED, handler);
  }
}

export function createAgentService(_deps?: ServiceFactoryDeps): IAgentService {
  return new AgentServiceImpl(_deps);
}

export const agentService: IAgentService = createAgentService();
