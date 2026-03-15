import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createAppSdkCoreConfigMock,
  getAppSdkCoreClientWithSessionMock,
  getPopularCharactersMock,
  getMyCharactersMock,
  getMostLikedCharactersMock,
  getCharacterMock,
  loggerWarnMock,
  runtimeDeps,
} = vi.hoisted(() => {
  const getPopularCharacters = vi.fn();
  const getMyCharacters = vi.fn();
  const getMostLikedCharacters = vi.fn();
  const getCharacter = vi.fn();
  const loggerWarn = vi.fn();

  return {
    createAppSdkCoreConfigMock: vi.fn(() => ({ baseUrl: 'https://api.example.com' })),
    getAppSdkCoreClientWithSessionMock: vi.fn(async () => ({
      character: {
        getPopularCharacters,
        getMyCharacters,
        getMostLikedCharacters,
        getCharacter,
        like: vi.fn(),
        unlike: vi.fn(),
        use: vi.fn(),
      },
    })),
    getPopularCharactersMock: getPopularCharacters,
    getMyCharactersMock: getMyCharacters,
    getMostLikedCharactersMock: getMostLikedCharacters,
    getCharacterMock: getCharacter,
    loggerWarnMock: loggerWarn,
    runtimeDeps: {
      storage: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
      logger: { warn: loggerWarn },
      clock: { now: () => Date.parse('2026-03-16T10:00:00.000Z') },
      idGenerator: { next: vi.fn((prefix: string) => `${prefix}_generated`) },
    },
  };
});

vi.mock('@sdkwork/react-mobile-core', () => ({
  APP_SDK_AUTH_TOKEN_STORAGE_KEY: 'sdkwork_token',
  createAppSdkCoreConfig: createAppSdkCoreConfigMock,
  getAppSdkCoreClientWithSession: getAppSdkCoreClientWithSessionMock,
  resolveServiceFactoryRuntimeDeps: (deps?: Record<string, unknown>) => ({
    ...runtimeDeps,
    ...(deps || {}),
  }),
}));

import { createAgentSdkService } from './AgentSdkService';

describe('AgentSdkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMostLikedCharactersMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: { content: [] },
    });
    getMyCharactersMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: { content: [] },
    });
  });

  it('maps remote characters into agent cards', async () => {
    getPopularCharactersMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        content: [
          {
            characterId: 'c_1',
            name: 'SDK Planner',
            type: 'assistant',
            description: 'Reasoning and writing helper',
            status: 'active',
            likeCount: 120,
            usageCount: 23,
            avatar: { url: 'https://cdn.sdkwork.com/a.png' },
            createdAt: '2026-03-15T08:00:00.000Z',
            updatedAt: '2026-03-16T08:00:00.000Z',
          },
        ],
      },
    });

    const service = createAgentSdkService();
    const result = await service.getAgents();

    expect(result).toEqual([
      expect.objectContaining({
        id: 'c_1',
        name: 'SDK Planner',
        avatar: 'https://cdn.sdkwork.com/a.png',
        provider: 'SDKWork',
        status: 'active',
      }),
    ]);
  });

  it('marks liked characters as favorite agents', async () => {
    getMostLikedCharactersMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        content: [
          {
            characterId: 'c_like',
            name: 'Favorite Agent',
            description: 'Creative image helper',
            type: 'image',
            status: 'active',
          },
        ],
      },
    });
    getPopularCharactersMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        content: [
          {
            characterId: 'c_like',
            name: 'Favorite Agent',
            description: 'Creative image helper',
            type: 'image',
            status: 'active',
          },
        ],
      },
    });

    const service = createAgentSdkService();
    const result = await service.getAgents();

    expect(result?.[0]).toEqual(expect.objectContaining({
      id: 'c_like',
      isFavorite: true,
      capabilities: expect.arrayContaining(['chat', 'image_generation']),
    }));
  });

  it('loads agent detail through character detail api', async () => {
    getCharacterMock.mockResolvedValue({
      code: '2000',
      msg: 'ok',
      data: {
        characterId: 'c_detail',
        name: 'Detail Agent',
        description: 'Code and analysis specialist',
        type: 'developer',
        interactionSettings: 'System prompt',
        status: 'busy',
      },
    });

    const service = createAgentSdkService();
    const result = await service.getAgentById('c_detail');

    expect(result).toEqual(expect.objectContaining({
      id: 'c_detail',
      status: 'busy',
      systemPrompt: 'System prompt',
    }));
  });

  it('returns null and records lastError on business failure', async () => {
    getPopularCharactersMock.mockResolvedValue({
      code: '5001',
      msg: 'agent unavailable',
      data: { content: [] },
    });

    const service = createAgentSdkService();
    const result = await service.getAgents();

    expect(result).toBeNull();
    expect(service.getLastError()).toEqual({
      code: '5001',
      message: 'agent unavailable',
    });
    expect(loggerWarnMock).toHaveBeenCalled();
  });
});
