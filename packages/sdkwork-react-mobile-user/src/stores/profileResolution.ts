import type { UserProfile } from '../types';
import type { UserCenterProfile } from '../services/UserCenterService';

const DEFAULT_USER_STATUS: UserProfile['status'] = {
  icon: 'online',
  text: 'Active',
  isActive: true,
};

const toTimestamp = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const buildInlineFallbackProfile = (cachedProfile: UserProfile | null, nowMs: number): UserProfile => {
  const fallbackId = cachedProfile?.id || `user_${nowMs.toString(36)}`;
  const fallbackName = (cachedProfile?.name || '').trim() || fallbackId.slice(-8);
  const fallbackWxid = (cachedProfile?.wxid || '').trim() || fallbackId;

  return {
    id: fallbackId,
    name: fallbackName,
    wxid: fallbackWxid,
    avatar: (cachedProfile?.avatar || '').trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackId}`,
    email: cachedProfile?.email?.trim() || undefined,
    phone: cachedProfile?.phone?.trim() || undefined,
    region: (cachedProfile?.region || '').trim(),
    status: cachedProfile?.status || DEFAULT_USER_STATUS,
    gender: cachedProfile?.gender || 'male',
    signature: (cachedProfile?.signature || '').trim(),
    createTime: cachedProfile?.createTime || nowMs,
    updateTime: nowMs,
  };
};

export const mapUserCenterProfileToUserProfile = (
  profile: UserCenterProfile,
  fallback: UserProfile | null,
  nowMs: number = Date.now()
): UserProfile => {
  const id = (profile.userId || '').trim() || fallback?.id || `user_${nowMs.toString(36)}`;
  const nickname = (profile.nickname || '').trim() || fallback?.name || 'User';
  const wxid = fallback?.wxid || profile.email || profile.phone || id;

  return {
    id,
    name: nickname,
    wxid,
    avatar: (profile.avatar || '').trim() || fallback?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    email: (profile.email || '').trim() || fallback?.email || undefined,
    phone: (profile.phone || '').trim() || fallback?.phone || undefined,
    region: (profile.region || '').trim() || fallback?.region || '',
    status: fallback?.status || DEFAULT_USER_STATUS,
    gender: profile.gender === 'female' ? 'female' : fallback?.gender || 'male',
    signature: (profile.bio || '').trim() || fallback?.signature || '',
    createTime: fallback?.createTime || toTimestamp(profile.createdAt, nowMs),
    updateTime: toTimestamp(profile.updatedAt, nowMs),
  };
};

interface ResolveProfileOptions {
  getRemoteProfile: () => Promise<UserCenterProfile | null>;
  getLocalProfile: () => Promise<UserProfile | null>;
  createLocalProfile: (userId: string, username: string) => Promise<UserProfile>;
  now?: () => number;
}

export const resolveProfileWithFallback = async (
  cachedProfile: UserProfile | null,
  options: ResolveProfileOptions
): Promise<UserProfile> => {
  const getNow = options.now || Date.now;
  const nowMs = getNow();
  let profile: UserProfile | null = null;

  try {
    const remoteProfile = await options.getRemoteProfile();
    if (remoteProfile) {
      profile = mapUserCenterProfileToUserProfile(remoteProfile, cachedProfile, nowMs);
    }
  } catch {
    // Remote profile failures should not block local fallback rendering.
  }

  if (!profile) {
    try {
      profile = await options.getLocalProfile();
    } catch {
      // Keep fallback chain running.
    }
  }

  if (!profile) {
    const fallbackId = cachedProfile?.id || `user_${nowMs.toString(36)}`;
    const fallbackName = (cachedProfile?.name || '').trim() || fallbackId.slice(-8);
    try {
      profile = await options.createLocalProfile(fallbackId, fallbackName);
    } catch {
      // Ignore and apply inline fallback.
    }
  }

  if (profile) {
    return profile;
  }
  return buildInlineFallbackProfile(cachedProfile, nowMs);
};

