import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAppImSdk: vi.fn(),
  getAppImSessionIdentity: vi.fn(),
  listByUser: vi.fn(),
}));

vi.mock('@sdkwork/react-mobile-core/im', () => ({
  getAppImSdk: mocks.getAppImSdk,
  getAppImSessionIdentity: mocks.getAppImSessionIdentity,
}));

vi.mock('@sdkwork/react-mobile-core', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@sdkwork/react-mobile-core');
  return {
    ...actual,
  };
});

describe('callService IM rtc integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listByUser.mockResolvedValue([]);
    mocks.getAppImSdk.mockReturnValue({
      rtc: {
        records: {
          listByUser: mocks.listByUser,
        },
      },
    });
  });

  it('prefers remote rtc video records when IM session is ready', async () => {
    mocks.getAppImSessionIdentity.mockReturnValue({
      userId: 'user-1',
      username: 'neo',
      displayName: 'Neo',
      authToken: 'auth-token',
    });
    mocks.listByUser.mockResolvedValue({
      data: [
        {
          id: 'rtc-record-1',
          startTime: '2026-03-25T00:00:00.000Z',
          endTime: '2026-03-25T00:02:05.000Z',
          metadata: {
            contactName: 'Alice',
            contactAvatar: 'https://example.com/alice.png',
            callType: 'video',
            direction: 'incoming',
          },
        },
      ],
    });

    const { createCallService } = await import('./CallService');
    const service = createCallService();

    await expect(service.getCallRecords()).resolves.toEqual([
      expect.objectContaining({
        id: 'rtc-record-1',
        contactName: 'Alice',
        contactAvatar: 'https://example.com/alice.png',
        type: 'video',
        status: 'received',
        duration: 125,
        timestamp: Date.parse('2026-03-25T00:00:00.000Z'),
      }),
    ]);

    expect(mocks.listByUser).toHaveBeenCalledWith('user-1');
  });

  it('falls back to local seeded records when remote rtc loading fails', async () => {
    mocks.getAppImSessionIdentity.mockReturnValue({
      userId: 'user-2',
      username: 'trinity',
      displayName: 'Trinity',
      authToken: 'auth-token',
    });
    mocks.listByUser.mockRejectedValue(new Error('network down'));

    const { createCallService } = await import('./CallService');
    const service = createCallService({
      clock: {
        now: () => Date.parse('2026-03-25T08:00:00.000Z'),
      },
    });

    const records = await service.getCallRecords();

    expect(records).toHaveLength(3);
    expect(records[0]).toEqual(
      expect.objectContaining({
        contactName: 'Alice',
        type: 'video',
      }),
    );
  });
});
