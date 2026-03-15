import { mapSdkUserProfile, type AppSdkUserProfileDto } from '@sdkwork/react-mobile-core';

import { userCenterService, type UserCenterProfile } from './UserCenterService';
import type { UserProfile } from '../types';

const FALLBACK_USER_ID = 'user_local';
const FALLBACK_USER_NAME = 'User';
const FALLBACK_TIMESTAMP = Date.parse('2026-01-01T00:00:00.000Z');

export type AppUserErrorType =
  | 'auth_expired'
  | 'network_error'
  | 'validation_error'
  | 'server_error'
  | 'unknown_error';

export class AppUserServiceError extends Error {
  readonly type: AppUserErrorType;

  constructor(type: AppUserErrorType, message: string) {
    super(message);
    this.name = 'AppUserServiceError';
    this.type = type;
  }
}

export interface AppUserService {
  getCurrentProfile(): Promise<UserProfile | null>;
  updateCurrentProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
}

function toSdkUserProfileDto(profile: UserCenterProfile): AppSdkUserProfileDto {
  return {
    userId: profile.userId,
    nickname: profile.nickname,
    avatar: profile.avatar,
    email: profile.email,
    phone: profile.phone,
  };
}

function toTimestamp(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function mapToUserProfile(profile: UserCenterProfile): UserProfile {
  const base = mapSdkUserProfile(toSdkUserProfileDto(profile));
  const fallbackId = (profile.userId || '').trim() || base.id || FALLBACK_USER_ID;
  const fallbackName = base.displayName || profile.nickname || FALLBACK_USER_NAME;

  return {
    id: fallbackId,
    name: fallbackName,
    wxid: base.username || base.id || profile.userId || fallbackId,
    avatar: base.avatarUrl,
    email: base.email || undefined,
    phone: base.phone || undefined,
    region: (profile.region || '').trim(),
    status: {
      icon: 'online',
      text: 'Active',
      isActive: true,
    },
    gender: profile.gender === 'female' ? 'female' : 'male',
    signature: (profile.bio || '').trim(),
    createTime: toTimestamp(profile.createdAt, FALLBACK_TIMESTAMP),
    updateTime: toTimestamp(profile.updatedAt, FALLBACK_TIMESTAMP),
  };
}

function classifyUserServiceError(error: unknown): AppUserServiceError {
  if (error instanceof AppUserServiceError) {
    return error;
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const status = Number(record.status || 0);
    const message = String(record.message || 'Unknown user service error');

    if (status === 401 || status === 403) {
      return new AppUserServiceError('auth_expired', message);
    }
    if (status === 400 || status === 422) {
      return new AppUserServiceError('validation_error', message);
    }
    if (status >= 500) {
      return new AppUserServiceError('server_error', message);
    }
    if (message.toLowerCase().includes('network')) {
      return new AppUserServiceError('network_error', message);
    }
    return new AppUserServiceError('unknown_error', message);
  }

  return new AppUserServiceError('unknown_error', 'Unknown user service error');
}

function toUserCenterUpdateInput(updates: Partial<UserProfile>) {
  return {
    nickname: updates.name?.trim() || undefined,
    avatar: updates.avatar?.trim() || undefined,
    email: updates.email?.trim() || undefined,
    phone: updates.phone?.trim() || undefined,
    region: updates.region?.trim() || undefined,
    bio: updates.signature?.trim() || undefined,
    gender: updates.gender,
  };
}

export const appUserService: AppUserService = {
  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const profile = await userCenterService.getUserProfile();
      return profile ? mapToUserProfile(profile) : null;
    } catch (error) {
      throw classifyUserServiceError(error);
    }
  },

  async updateCurrentProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const profile = await userCenterService.updateUserProfile(toUserCenterUpdateInput(updates));
      return mapToUserProfile(profile);
    } catch (error) {
      throw classifyUserServiceError(error);
    }
  },
};

export { classifyUserServiceError, mapToUserProfile };
