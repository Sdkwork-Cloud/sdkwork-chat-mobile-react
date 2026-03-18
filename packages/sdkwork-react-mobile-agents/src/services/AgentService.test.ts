import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServiceFactoryDeps } from '@sdkwork/react-mobile-core';

const sdkServiceMocks = vi.hoisted(() => ({
  getAgents: vi.fn(),
  getAgentById: vi.fn(),
  getFavoriteAgents: vi.fn(),
  likeAgent: vi.fn(),
  unlikeAgent: vi.fn(),
  markAgentUsed: vi.fn(),
}));

const chatServiceMocks = vi.hoisted(() => ({
  getSessionList: vi.fn(),
  createSession: vi.fn(),
  addMessage: vi.fn(),
  deleteById: vi.fn(),
  togglePin: vi.fn(),
}));

vi.mock('./AgentSdkService', () => ({
  createAgentSdkService: vi.fn(() => sdkServiceMocks),
}));

const runtimeDeps = vi.hoisted(() => {
  const storageMap = new Map<string, unknown>();
  const eventHandlers = new Map<string, Set<(payload: unknown) => void>>();

  return {
    storageMap,
    deps: {
      storage: {
        get: vi.fn(async <T>(key: string) => (storageMap.has(key) ? (storageMap.get(key) as T) : null)),
        set: vi.fn(async <T>(key: string, value: T) => {
          storageMap.set(key, value);
        }),
        remove: vi.fn(async (key: string) => {
          storageMap.delete(key);
        }),
      },
      eventBus: {
        emit: vi.fn((event: string, payload: unknown) => {
          const handlers = eventHandlers.get(event);
          handlers?.forEach((handler) => handler(payload));
        }),
        on: vi.fn((event: string, handler: (payload: unknown) => void) => {
          const handlers = eventHandlers.get(event) || new Set<(payload: unknown) => void>();
          handlers.add(handler);
          eventHandlers.set(event, handlers);
          return () => handlers.delete(handler);
        }),
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
      },
      clock: {
        now: () => Date.parse('2026-03-16T10:00:00.000Z'),
      },
      idGenerator: {
        next: vi.fn((prefix: string) => `${prefix}_generated`),
      },
    },
    reset() {
      storageMap.clear();
      eventHandlers.clear();
    },
  };
});

vi.mock('@sdkwork/react-mobile-core', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@sdkwork/react-mobile-core');
  return {
    ...actual,
    resolveServiceFactoryRuntimeDeps: (deps?: Record<string, unknown>) => ({
      ...runtimeDeps.deps,
      ...(deps || {}),
    }),
  };
});

describe('AgentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeDeps.reset();
    sdkServiceMocks.getAgents.mockResolvedValue(null);
    sdkServiceMocks.getAgentById.mockResolvedValue(null);
    sdkServiceMocks.getFavoriteAgents.mockResolvedValue(null);
    sdkServiceMocks.likeAgent.mockResolvedValue(null);
    sdkServiceMocks.unlikeAgent.mockResolvedValue(null);
    sdkServiceMocks.markAgentUsed.mockResolvedValue(null);
    chatServiceMocks.getSessionList.mockResolvedValue({ success: true, data: [] });
    chatServiceMocks.createSession.mockResolvedValue(null);
    chatServiceMocks.addMessage.mockResolvedValue({ success: true, data: null });
    chatServiceMocks.deleteById.mockResolvedValue(true);
    chatServiceMocks.togglePin.mockResolvedValue({ success: true });
    (globalThis as typeof globalThis & { __SDKWORK_CHAT_BRIDGE__?: unknown }).__SDKWORK_CHAT_BRIDGE__ = {
      chatService: chatServiceMocks,
    };
  });

  it('prefers sdk agents and decorates them with local default and favorites', async () => {
    runtimeDeps.storageMap.set('sys_agents_default_v1', 'sdk_agent');
    runtimeDeps.storageMap.set('sys_agents_favorites_v1', ['sdk_agent']);
    sdkServiceMocks.getAgents.mockResolvedValue([
      {
        id: 'sdk_agent',
        name: 'SDK Agent',
        description: 'Remote agent',
        provider: 'SDKWork',
        model: 'assistant',
        capabilities: ['chat'],
        status: 'active',
        isDefault: false,
        isFavorite: false,
        temperature: 0.7,
        maxTokens: 4096,
        tags: ['assistant'],
        usageCount: 12,
        rating: 4.8,
        createdAt: '2026-03-16T08:00:00.000Z',
        updatedAt: '2026-03-16T08:30:00.000Z',
      },
    ]);

    const { createAgentService } = await import('./AgentService');
    const service = createAgentService(runtimeDeps.deps as ServiceFactoryDeps);
    await service.initialize();

    const agents = await service.getAgents();

    expect(sdkServiceMocks.getAgents).toHaveBeenCalledTimes(1);
    expect(agents).toEqual([
      expect.objectContaining({
        id: 'sdk_agent',
        isDefault: true,
        isFavorite: true,
      }),
    ]);
  });

  it('calls sdk favorite mutation before updating local favorite state', async () => {
    runtimeDeps.storageMap.set('sys_agents_list_v1', [
      {
        id: 'sdk_agent',
        name: 'SDK Agent',
        description: 'Remote agent',
        provider: 'SDKWork',
        model: 'assistant',
        capabilities: ['chat'],
        status: 'active',
        isDefault: false,
        isFavorite: false,
        temperature: 0.7,
        maxTokens: 4096,
        tags: ['assistant'],
        usageCount: 12,
        rating: 4.8,
        createdAt: '2026-03-16T08:00:00.000Z',
        updatedAt: '2026-03-16T08:30:00.000Z',
      },
    ]);
    sdkServiceMocks.likeAgent.mockResolvedValue(true);

    const { createAgentService } = await import('./AgentService');
    const service = createAgentService(runtimeDeps.deps as ServiceFactoryDeps);

    await expect(service.toggleFavorite('sdk_agent')).resolves.toBe(true);
    expect(sdkServiceMocks.likeAgent).toHaveBeenCalledWith('sdk_agent');
    expect(runtimeDeps.storageMap.get('sys_agents_favorites_v1')).toEqual(['sdk_agent']);
  });

  it('bridges agent conversations to chat sessions so conversation state stays unified', async () => {
    runtimeDeps.storageMap.set('sys_agents_list_v1', [
      {
        id: 'agent_coder',
        name: 'Code Expert',
        description: 'Remote agent',
        avatar: 'https://example.com/coder.png',
        provider: 'SDKWork',
        model: 'gpt-4.1',
        capabilities: ['chat', 'coding'],
        status: 'active',
        isDefault: false,
        isFavorite: false,
        systemPrompt: 'Act like a production-grade coding copilot.',
        temperature: 0.3,
        maxTokens: 4096,
        tags: ['coding'],
        usageCount: 12,
        rating: 4.8,
        createdAt: '2026-03-16T08:00:00.000Z',
        updatedAt: '2026-03-16T08:30:00.000Z',
      },
    ]);
    chatServiceMocks.createSession.mockResolvedValue({
      success: true,
      data: {
        id: 'chat_session_1',
        type: 'agent',
        agentId: 'agent_coder',
        agentProfile: {
          id: 'agent_coder',
          behaviorId: 'agent_coder',
          sdkModelId: 'gpt-4.1',
          name: 'Code Expert',
          avatar: 'https://example.com/coder.png',
          description: 'Remote agent',
          systemInstruction: 'Act like a production-grade coding copilot.',
          tags: ['coding'],
        },
        messages: [],
        lastMessageTime: 1710573600000,
        createTime: 1710573600000,
        updateTime: 1710573600000,
        lastMessageContent: '',
        unreadCount: 0,
        isPinned: false,
      },
    });
    chatServiceMocks.addMessage.mockResolvedValue({
      success: true,
      data: {
        id: 'chat_session_1',
      },
    });
    chatServiceMocks.getSessionList.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'chat_session_1',
          type: 'agent',
          agentId: 'agent_coder',
          agentProfile: {
            id: 'agent_coder',
            name: 'Code Expert',
            avatar: 'https://example.com/coder.png',
          },
          messages: [
            {
              id: 'msg_1',
              sessionId: 'chat_session_1',
              role: 'user',
              content: 'Help me optimize this query',
              status: 'sent',
              createTime: 1710573600000,
              updateTime: 1710573600000,
            },
          ],
          lastMessageTime: 1710573600000,
          createTime: 1710573600000,
          updateTime: 1710573600000,
          lastMessageContent: 'Help me optimize this query',
          unreadCount: 0,
          isPinned: false,
        },
      ],
    });

    const { createAgentService } = await import('./AgentService');
    const service = createAgentService(runtimeDeps.deps as ServiceFactoryDeps);

    const conversation = await service.createConversation('agent_coder');
    const message = await service.sendMessage('chat_session_1', 'Help me optimize this query');
    const conversations = await service.getConversations('agent_coder');

    expect(chatServiceMocks.createSession).toHaveBeenCalledWith(
      'agent_coder',
      expect.objectContaining({
        behaviorId: 'agent_coder',
        sdkModelId: 'gpt-4.1',
        systemInstruction: 'Act like a production-grade coding copilot.',
      }),
      { reuseExisting: false },
    );
    expect(chatServiceMocks.addMessage).toHaveBeenCalledWith(
      'chat_session_1',
      expect.objectContaining({
        role: 'user',
        content: 'Help me optimize this query',
      }),
    );
    expect(conversation).toEqual(
      expect.objectContaining({
        id: 'chat_session_1',
        agentId: 'agent_coder',
        agentName: 'Code Expert',
      }),
    );
    expect(message).toEqual(
      expect.objectContaining({
        conversationId: 'chat_session_1',
        role: 'user',
        content: 'Help me optimize this query',
      }),
    );
    expect(conversations).toHaveLength(1);
    expect(conversations[0]).toEqual(
      expect.objectContaining({
        id: 'chat_session_1',
        agentId: 'agent_coder',
        messageCount: 1,
      }),
    );
  });

  it('passes custom thread titles through the chat bridge', async () => {
    runtimeDeps.storageMap.set('sys_agents_list_v1', [
      {
        id: 'agent_coder',
        name: 'Code Expert',
        description: 'Remote agent',
        avatar: 'https://example.com/coder.png',
        provider: 'SDKWork',
        model: 'gpt-4.1',
        capabilities: ['chat', 'coding'],
        status: 'active',
        isDefault: false,
        isFavorite: false,
        systemPrompt: 'Act like a production-grade coding copilot.',
        temperature: 0.3,
        maxTokens: 4096,
        tags: ['coding'],
        usageCount: 12,
        rating: 4.8,
        createdAt: '2026-03-16T08:00:00.000Z',
        updatedAt: '2026-03-16T08:30:00.000Z',
      },
    ]);
    chatServiceMocks.createSession.mockResolvedValue({
      success: true,
      data: {
        id: 'chat_session_2',
        type: 'agent',
        agentId: 'agent_coder',
        title: 'Sprint triage',
        agentProfile: {
          id: 'agent_coder',
          behaviorId: 'agent_coder',
          sdkModelId: 'gpt-4.1',
          name: 'Code Expert',
          avatar: 'https://example.com/coder.png',
          description: 'Remote agent',
          systemInstruction: 'Act like a production-grade coding copilot.',
          tags: ['coding'],
        },
        messages: [],
        lastMessageTime: 1710573600000,
        createTime: 1710573600000,
        updateTime: 1710573600000,
        lastMessageContent: '',
        unreadCount: 0,
        isPinned: false,
      },
    });

    const { createAgentService } = await import('./AgentService');
    const service = createAgentService(runtimeDeps.deps as ServiceFactoryDeps);

    const conversation = await service.createConversation('agent_coder', 'Sprint triage');

    expect(chatServiceMocks.createSession).toHaveBeenCalledWith(
      'agent_coder',
      expect.objectContaining({
        behaviorId: 'agent_coder',
        sdkModelId: 'gpt-4.1',
      }),
      { reuseExisting: false, title: 'Sprint triage' },
    );
    expect(conversation).toEqual(
      expect.objectContaining({
        id: 'chat_session_2',
        agentId: 'agent_coder',
        title: 'Sprint triage',
      }),
    );
  });
});
