import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdkServiceMocks = vi.hoisted(() => ({
  getFeed: vi.fn(),
  publish: vi.fn(),
  likeMoment: vi.fn(),
  commentMoment: vi.fn(),
}));

vi.mock('./MomentsSdkService', () => ({
  createMomentsSdkService: vi.fn(() => sdkServiceMocks),
}));

describe('MomentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sdkServiceMocks.getFeed.mockResolvedValue(null);
    sdkServiceMocks.publish.mockResolvedValue(null);
    sdkServiceMocks.likeMoment.mockResolvedValue(null);
    sdkServiceMocks.commentMoment.mockResolvedValue(null);
  });

  it('prefers sdk feed over local seed moments', async () => {
    sdkServiceMocks.getFeed.mockResolvedValue([
      {
        id: 'sdk_1',
        author: 'SDK Author',
        avatar: 'sdk-avatar',
        content: 'Remote moment',
        images: [],
        comments: [],
        likes: 3,
        hasLiked: false,
        createTime: Date.parse('2026-03-16T08:00:00.000Z'),
        updateTime: Date.parse('2026-03-16T08:00:00.000Z'),
      },
    ]);

    const { createMomentsService } = await import('./MomentsService');
    const service = createMomentsService();

    const result = await service.getFeed(1, 10);

    expect(sdkServiceMocks.getFeed).toHaveBeenCalledWith(1, 10);
    expect(result.moments[0]).toEqual(expect.objectContaining({
      id: 'sdk_1',
      author: 'SDK Author',
      content: 'Remote moment',
    }));
  });

  it('falls back to seeded local moments when sdk feed is unavailable', async () => {
    const { createMomentsService } = await import('./MomentsService');
    const service = createMomentsService();

    const result = await service.getFeed(1, 10);

    expect(result.moments.length).toBeGreaterThan(0);
    expect(result.moments[0]).toHaveProperty('displayTime');
  });
});
