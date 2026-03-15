import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

vi.mock('./UserCenterService', () => ({
  userCenterService: serviceMocks,
}));

describe('appUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetching current profile returns mapped user model', async () => {
    serviceMocks.getUserProfile.mockResolvedValue({
      userId: 'u_1',
      nickname: 'System User',
      avatar: 'https://cdn.sdkwork.com/avatar.png',
      email: 'system@sdkwork.com',
      phone: '13800138000',
      region: 'Shanghai',
      bio: 'Hello',
      gender: 'female',
      createdAt: '2026-03-15T10:00:00.000Z',
      updatedAt: '2026-03-15T11:00:00.000Z',
    });

    const { appUserService } = await import('./appUserService');

    await expect(appUserService.getCurrentProfile()).resolves.toMatchObject({
      id: 'u_1',
      name: 'System User',
      avatar: 'https://cdn.sdkwork.com/avatar.png',
      email: 'system@sdkwork.com',
      phone: '13800138000',
      region: 'Shanghai',
      signature: 'Hello',
      gender: 'female',
    });
  });

  it('updating profile returns refreshed mapped user model', async () => {
    serviceMocks.updateUserProfile.mockResolvedValue({
      userId: 'u_2',
      nickname: 'Updated User',
      avatar: '',
      email: 'updated@sdkwork.com',
      phone: '',
      region: 'Hangzhou',
      bio: 'Updated bio',
      gender: 'male',
      createdAt: '2026-03-15T09:00:00.000Z',
      updatedAt: '2026-03-15T12:00:00.000Z',
    });

    const { appUserService } = await import('./appUserService');

    await expect(
      appUserService.updateCurrentProfile({
        name: 'Updated User',
        region: 'Hangzhou',
        signature: 'Updated bio',
      }),
    ).resolves.toMatchObject({
      id: 'u_2',
      name: 'Updated User',
      region: 'Hangzhou',
      signature: 'Updated bio',
    });
  });

  it('classifies sdk failures into app-facing error categories', async () => {
    serviceMocks.getUserProfile.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), { status: 401 }),
    );

    const { appUserService } = await import('./appUserService');

    await expect(appUserService.getCurrentProfile()).rejects.toMatchObject({
      type: 'auth_expired',
      message: 'Unauthorized',
    });
  });
});
