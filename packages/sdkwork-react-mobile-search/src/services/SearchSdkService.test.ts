import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdkMocks = vi.hoisted(() => {
  const global = vi.fn();
  const getSearchHistory = vi.fn();
  const addSearchHistory = vi.fn();
  const clearSearchHistory = vi.fn();

  return {
    createAppSdkCoreConfigMock: vi.fn(() => ({ baseUrl: 'https://api.example.com' })),
    getAppSdkCoreClientWithSessionMock: vi.fn(async () => ({
      search: { global, getSearchHistory, addSearchHistory, clearSearchHistory },
    })),
    globalMock: global,
    getSearchHistoryMock: getSearchHistory,
    addSearchHistoryMock: addSearchHistory,
    clearSearchHistoryMock: clearSearchHistory,
    runtimeDeps: {
      storage: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
      logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn(), trace: vi.fn() },
      clock: { now: () => Date.parse('2026-03-16T10:00:00.000Z') },
      idGenerator: { next: vi.fn((prefix: string) => `${prefix}_generated`) },
    },
  };
});

vi.mock('@sdkwork/react-mobile-core', () => ({
  APP_SDK_AUTH_TOKEN_STORAGE_KEY: 'sdkwork_token',
  createAppSdkCoreConfig: sdkMocks.createAppSdkCoreConfigMock,
  getAppSdkCoreClientWithSession: sdkMocks.getAppSdkCoreClientWithSessionMock,
  resolveServiceFactoryRuntimeDeps: (deps?: Record<string, unknown>) => ({
    ...sdkMocks.runtimeDeps,
    ...(deps || {}),
  }),
}));

import { createSearchSdkService } from './SearchSdkService';

describe('SearchSdkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps global sdk search results into others groups', async () => {
    sdkMocks.globalMock.mockResolvedValue({
      code: '2000',
      data: {
        assets: [{ id: 'file_1', name: 'Roadmap.pdf', type: 'pdf' }],
        notes: [{ id: 2, title: 'Release notes', summary: 'SDK upgrade plan' }],
        projects: [{ id: 'proj_1', name: 'Mobile Search', description: 'Search evolution' }],
      },
    });

    const service = createSearchSdkService();
    const result = await service.searchContent('search');

    expect(result).toEqual([
      expect.objectContaining({ id: 'file_1', type: 'file', title: 'Roadmap.pdf' }),
      expect.objectContaining({ id: '2', type: 'article', title: 'Release notes' }),
      expect.objectContaining({ id: 'proj_1', type: 'creation', title: 'Mobile Search' }),
    ]);
  });
});
