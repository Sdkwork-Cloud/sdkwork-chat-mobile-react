import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  updateCurrentProfile: vi.fn(),
}));

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware');
  return {
    ...actual,
    persist: ((initializer: unknown) => initializer) as typeof actual.persist,
  };
});

vi.mock('../services/AppUserService', () => ({
  appUserService: serviceMocks,
}));

describe('userStore current user flow', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('starts with empty current user state', async () => {
    const { useUserStore } = await import('./userStore');

    expect(useUserStore.getState().profile).toBeNull();
    expect(useUserStore.getState().error).toBeNull();
    expect(useUserStore.getState().isLoading).toBe(false);
  });

  it('loads current user through ensureCurrentUser', async () => {
    serviceMocks.getCurrentProfile.mockResolvedValue({
      id: 'u_1',
      createTime: 1,
      updateTime: 2,
      name: 'System User',
      wxid: 'system',
      avatar: '',
      region: 'Shanghai',
      status: { icon: 'online', text: 'Active', isActive: true },
      gender: 'male',
      signature: '',
    });

    const { useUserStore } = await import('./userStore');

    await useUserStore.getState().ensureCurrentUser();

    expect(useUserStore.getState().profile).toMatchObject({
      id: 'u_1',
      name: 'System User',
    });
  });

  it('replaces state after current profile update', async () => {
    serviceMocks.updateCurrentProfile.mockResolvedValue({
      id: 'u_2',
      createTime: 1,
      updateTime: 3,
      name: 'Updated User',
      wxid: 'updated-user',
      avatar: '',
      region: 'Hangzhou',
      status: { icon: 'online', text: 'Active', isActive: true },
      gender: 'female',
      signature: 'Updated bio',
    });

    const { useUserStore } = await import('./userStore');

    await useUserStore.getState().updateCurrentUser({
      name: 'Updated User',
      region: 'Hangzhou',
      signature: 'Updated bio',
    });

    expect(useUserStore.getState().profile).toMatchObject({
      id: 'u_2',
      name: 'Updated User',
      region: 'Hangzhou',
      signature: 'Updated bio',
    });
  });

  it('clears current user state explicitly', async () => {
    const { useUserStore } = await import('./userStore');

    useUserStore.setState({
      ...useUserStore.getState(),
      profile: {
        id: 'u_3',
        createTime: 1,
        updateTime: 2,
        name: 'Demo User',
        wxid: 'demo',
        avatar: '',
        region: '',
        status: { icon: 'online', text: 'Active', isActive: true },
        gender: 'male',
        signature: '',
      },
      error: 'stale',
    });

    useUserStore.getState().clearCurrentUser();

    expect(useUserStore.getState().profile).toBeNull();
    expect(useUserStore.getState().error).toBeNull();
  });
});
