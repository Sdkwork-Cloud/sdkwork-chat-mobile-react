import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps, ServiceStorageAdapter } from '@sdkwork/react-mobile-core';
import type { Agent, AgentConfig, AgentConversation, AgentMessage, AgentPromptTemplate, IAgentService } from '../types';

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

class AgentServiceImpl implements IAgentService {
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly storage: ServiceStorageAdapter;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.storage = createSafeStorage(this.deps.storage);
  }

  private nowIso(): string {
    return new Date(this.deps.clock.now()).toISOString();
  }

  async initialize(): Promise<void> {
    const storage = this.storage;
    
    const existingAgents = await storage.get(STORAGE_KEYS.AGENTS);
    if (!existingAgents) {
      const agents: Agent[] = SEED_AGENTS.map(a => ({
        ...a,
        createdAt: this.nowIso(),
        updatedAt: this.nowIso(),
      })) as Agent[];
      await storage.set(STORAGE_KEYS.AGENTS, agents);
      
      // Set default agent
      await storage.set(STORAGE_KEYS.DEFAULT_AGENT, 'agent_gpt4');
    }

    const existingTemplates = await storage.get(STORAGE_KEYS.TEMPLATES);
    if (!existingTemplates) {
      const templates: AgentPromptTemplate[] = SEED_TEMPLATES.map(t => ({
        ...t,
        usageCount: 0,
        createdAt: this.nowIso(),
        updatedAt: this.nowIso(),
      })) as AgentPromptTemplate[];
      await storage.set(STORAGE_KEYS.TEMPLATES, templates);
    }
  }

  async getAgents(): Promise<Agent[]> {
    const storage = this.storage;
    return await storage.get<Agent[]>(STORAGE_KEYS.AGENTS) || [];
  }

  async getAgentById(id: string): Promise<Agent | null> {
    const storage = this.storage;
    const agents = await storage.get<Agent[]>(STORAGE_KEYS.AGENTS) || [];
    return agents.find(a => a.id === id) || null;
  }

  async getDefaultAgent(): Promise<Agent | null> {
    const storage = this.storage;
    const defaultId = await storage.get<string>(STORAGE_KEYS.DEFAULT_AGENT);
    if (!defaultId) return null;
    return this.getAgentById(defaultId);
  }

  async setDefaultAgent(agentId: string): Promise<void> {
    const storage = this.storage;
    
    // Update agents
    const agents = await storage.get<Agent[]>(STORAGE_KEYS.AGENTS) || [];
    agents.forEach(a => {
      a.isDefault = a.id === agentId;
      a.updatedAt = this.nowIso();
    });
    await storage.set(STORAGE_KEYS.AGENTS, agents);
    
    // Save default
    await storage.set(STORAGE_KEYS.DEFAULT_AGENT, agentId);
    
    this.deps.eventBus.emit(AGENT_EVENTS.DEFAULT_CHANGED, agentId);
  }

  async toggleFavorite(agentId: string): Promise<boolean> {
    const storage = this.storage;
    
    const agents = await storage.get<Agent[]>(STORAGE_KEYS.AGENTS) || [];
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return false;

    agent.isFavorite = !agent.isFavorite;
    agent.updatedAt = this.nowIso();
    await storage.set(STORAGE_KEYS.AGENTS, agents);

    // Update favorites list
    let favorites = await storage.get<string[]>(STORAGE_KEYS.FAVORITES) || [];
    if (agent.isFavorite) {
      favorites = [...new Set([...favorites, agentId])];
    } else {
      favorites = favorites.filter(id => id !== agentId);
    }
    await storage.set(STORAGE_KEYS.FAVORITES, favorites);

    this.deps.eventBus.emit(AGENT_EVENTS.FAVORITE_TOGGLED, { agentId, isFavorite: agent.isFavorite });
    return agent.isFavorite;
  }

  async getFavoriteAgents(): Promise<Agent[]> {
    const storage = this.storage;
    const favoriteIds = await storage.get<string[]>(STORAGE_KEYS.FAVORITES) || [];
    const agents = await storage.get<Agent[]>(STORAGE_KEYS.AGENTS) || [];
    return agents.filter(a => favoriteIds.includes(a.id));
  }

  async updateAgentConfig(agentId: string, config: Partial<AgentConfig>): Promise<Agent | null> {
    const storage = this.storage;
    
    const agents = await storage.get<Agent[]>(STORAGE_KEYS.AGENTS) || [];
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return null;

    Object.assign(agent, config, { updatedAt: this.nowIso() });
    await storage.set(STORAGE_KEYS.AGENTS, agents);

    this.deps.eventBus.emit(AGENT_EVENTS.CONFIG_UPDATED, agent);
    return agent;
  }

  async getConversations(agentId?: string): Promise<AgentConversation[]> {
    const storage = this.storage;
    const conversations = await storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    
    if (agentId) {
      return conversations.filter(c => c.agentId === agentId);
    }
    
    // Sort by last message date, pinned first
    return conversations.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }

  async getConversationById(id: string): Promise<AgentConversation | null> {
    const storage = this.storage;
    const conversations = await storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    return conversations.find(c => c.id === id) || null;
  }

  async createConversation(agentId: string, title?: string): Promise<AgentConversation> {
    const storage = this.storage;
    const agent = await this.getAgentById(agentId);
    if (!agent) throw new Error('Agent not found');

    const conversations = await storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    
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
    await storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);

    this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_CREATED, conversation);
    return conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    const storage = this.storage;
    const conversations = await storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const filtered = conversations.filter(c => c.id !== id);
    await storage.set(STORAGE_KEYS.CONVERSATIONS, filtered);
    
    this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_DELETED, id);
  }

  async pinConversation(id: string, isPinned: boolean): Promise<void> {
    const storage = this.storage;
    const conversations = await storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      conversation.isPinned = isPinned;
      conversation.updatedAt = this.nowIso();
      await storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
      
      this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_PINNED, { id, isPinned });
    }
  }

  async archiveConversation(id: string): Promise<void> {
    const storage = this.storage;
    const conversations = await storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      conversation.isArchived = true;
      conversation.updatedAt = this.nowIso();
      await storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
      
      this.deps.eventBus.emit(AGENT_EVENTS.CONVERSATION_ARCHIVED, id);
    }
  }

  async sendMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'assistant' = 'user'
  ): Promise<AgentMessage> {
    const storage = this.storage;
    const conversations = await storage.get<AgentConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [];
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) throw new Error('Conversation not found');

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

    await storage.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    
    this.deps.eventBus.emit(AGENT_EVENTS.MESSAGE_SENT, { conversationId, message });
    return message;
  }

  async getTemplates(): Promise<AgentPromptTemplate[]> {
    const storage = this.storage;
    return await storage.get<AgentPromptTemplate[]>(STORAGE_KEYS.TEMPLATES) || [];
  }

  async getTemplatesByCategory(category: string): Promise<AgentPromptTemplate[]> {
    const templates = await this.getTemplates();
    return templates.filter(t => t.category === category);
  }

  async useTemplate(templateId: string): Promise<void> {
    const storage = this.storage;
    const templates = await storage.get<AgentPromptTemplate[]>(STORAGE_KEYS.TEMPLATES) || [];
    const template = templates.find(t => t.id === templateId);
    if (template) {
      template.usageCount++;
      template.updatedAt = this.nowIso();
      await storage.set(STORAGE_KEYS.TEMPLATES, templates);
    }
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



