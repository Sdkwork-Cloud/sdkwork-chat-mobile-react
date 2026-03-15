import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdkMocks = vi.hoisted(() => {
  const getFeedList = vi.fn();
  const create = vi.fn();
  const like = vi.fn();
  const unlike = vi.fn();
  const createComment = vi.fn();

  return {
    createAppSdkCoreConfigMock: vi.fn(() => ({ baseUrl: 'https://api.example.com' })),
    getAppSdkCoreClientWithSessionMock: vi.fn(async () => ({
      feed: { getFeedList, create, like, unlike },
      comment: { createComment },
    })),
    getFeedListMock: getFeedList,
    createMock: create,
    likeMock: like,
    unlikeMock: unlike,
    createCommentMock: createComment,
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

import { createMomentsSdkService } from './MomentsSdkService';

describe('MomentsSdkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps remote feed items into moments', async () => {
    sdkMocks.getFeedListMock.mockResolvedValue({
      code: '2000',
      data: [
        {
          id: 101,
          content: 'Remote moment',
          coverImage: 'https://cdn.sdkwork.com/feed.png',
          likeCount: 12,
          isLiked: true,
          createdAt: '2026-03-16T08:00:00.000Z',
          updatedAt: '2026-03-16T08:30:00.000Z',
          author: {
            nickname: 'SDK Author',
            avatar: 'sdk-avatar',
          },
        },
      ],
    });

    const service = createMomentsSdkService();
    const result = await service.getFeed(1, 10);

    expect(result).toEqual([
      expect.objectContaining({
        id: '101',
        author: 'SDK Author',
        avatar: 'sdk-avatar',
        content: 'Remote moment',
        images: ['https://cdn.sdkwork.com/feed.png'],
        likes: 12,
        hasLiked: true,
      }),
    ]);
  });

  it('returns mapped created moment on publish', async () => {
    sdkMocks.createMock.mockResolvedValue({
      code: '2000',
      data: {
        id: 102,
        content: 'Published remotely',
        likeCount: 0,
        isLiked: false,
        createdAt: '2026-03-16T09:00:00.000Z',
        updatedAt: '2026-03-16T09:00:00.000Z',
        author: { nickname: 'SDK User', avatar: 'sdk-user' },
      },
    });

    const service = createMomentsSdkService();
    const result = await service.publish('Published remotely', []);

    expect(result).toEqual(expect.objectContaining({
      id: '102',
      author: 'SDK User',
      content: 'Published remotely',
    }));
  });
});
