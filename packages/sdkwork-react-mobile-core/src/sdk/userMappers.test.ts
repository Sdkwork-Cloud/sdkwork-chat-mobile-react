import { describe, expect, it } from 'vitest';

import { mapSdkUserProfile, type AppSdkUserProfile } from './userMappers';

describe('userMappers', () => {
  it('maps a complete sdk dto into a stable app user profile', () => {
    const result = mapSdkUserProfile({
      id: 1001,
      username: 'system',
      nickname: 'System User',
      avatar: 'https://cdn.sdkwork.com/avatar.png',
      email: 'system@sdkwork.com',
      phone: '13800138000',
    });

    expect(result).toEqual<AppSdkUserProfile>({
      id: '1001',
      username: 'system',
      displayName: 'System User',
      avatarUrl: 'https://cdn.sdkwork.com/avatar.png',
      email: 'system@sdkwork.com',
      phone: '13800138000',
    });
  });

  it('uses safe fallbacks for sparse dto variants', () => {
    const result = mapSdkUserProfile({
      userId: 2002,
      name: 'Fallback Name',
      headImgUrl: 'https://cdn.sdkwork.com/alt-avatar.png',
    });

    expect(result).toEqual<AppSdkUserProfile>({
      id: '2002',
      username: '2002',
      displayName: 'Fallback Name',
      avatarUrl: 'https://cdn.sdkwork.com/alt-avatar.png',
      email: '',
      phone: '',
    });
  });
});
