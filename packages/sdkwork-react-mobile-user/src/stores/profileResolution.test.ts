import { describe, expect, it, vi } from 'vitest';
import type { UserProfile } from '../types';
import type { UserCenterProfile } from '../services/UserCenterService';
import { resolveProfileWithFallback } from './profileResolution';

const LOCAL_PROFILE: UserProfile = {
  id: 'local_user_1',
  name: 'Local User',
  wxid: 'wx_local_user_1',
  avatar: 'https://example.com/local-avatar.png',
  email: 'local@example.com',
  phone: '13800138000',
  region: 'Shanghai',
  status: { icon: 'online', text: 'Active', isActive: true },
  gender: 'male',
  signature: 'Hello',
  createTime: 1710000000000,
  updateTime: 1710000000000,
};

describe('resolveProfileWithFallback', () => {
  it('falls back to local profile when remote profile request fails', async () => {
    const getRemoteProfile = vi.fn<() => Promise<UserCenterProfile | null>>().mockRejectedValue(new Error('network'));
    const getLocalProfile = vi.fn<() => Promise<UserProfile | null>>().mockResolvedValue(LOCAL_PROFILE);
    const createLocalProfile = vi.fn<() => Promise<UserProfile>>().mockResolvedValue(LOCAL_PROFILE);

    const profile = await resolveProfileWithFallback(null, {
      getRemoteProfile,
      getLocalProfile,
      createLocalProfile,
      now: () => 1710000000123,
    });

    expect(profile).toEqual(LOCAL_PROFILE);
    expect(getRemoteProfile).toHaveBeenCalledTimes(1);
    expect(getLocalProfile).toHaveBeenCalledTimes(1);
    expect(createLocalProfile).not.toHaveBeenCalled();
  });

  it('creates a deterministic fallback profile when all data sources fail', async () => {
    const getRemoteProfile = vi.fn<() => Promise<UserCenterProfile | null>>().mockRejectedValue(new Error('network'));
    const getLocalProfile = vi.fn<() => Promise<UserProfile | null>>().mockResolvedValue(null);
    const createLocalProfile = vi.fn<() => Promise<UserProfile>>().mockRejectedValue(new Error('offline'));

    const profile = await resolveProfileWithFallback(null, {
      getRemoteProfile,
      getLocalProfile,
      createLocalProfile,
      now: () => 1710000000456,
    });

    expect(profile.id.startsWith('user_')).toBe(true);
    expect(profile.name).toBeTruthy();
    expect(profile.wxid).toBe(profile.id);
    expect(profile.avatar.includes(profile.id)).toBe(true);
  });
});
