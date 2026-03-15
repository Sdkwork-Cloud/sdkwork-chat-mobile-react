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
});
