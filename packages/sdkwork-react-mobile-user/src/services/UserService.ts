import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { UserProfile, IUserService } from '../types';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import { createUserSdkService } from './UserSdkService';
import type { IUserSdkService } from './UserSdkService';

const TAG = 'UserService';
const USER_EVENTS = {
  PROFILE_UPDATED: 'user:profile_updated',
  AVATAR_UPDATED: 'user:avatar_updated',
} as const;

/**
 * 用户服务实现
 */
class UserServiceImpl extends AbstractStorageService<UserProfile> implements IUserService {
  protected STORAGE_KEY = 'sys_user_profile_v3';
  private currentUserId: string | null = null;
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: IUserSdkService;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = createUserSdkService(deps);
  }

  /**
   * 设置当前用户ID
   */
  setCurrentUserId(id: string): void {
    this.currentUserId = id;
    this.deps.logger.info(TAG, 'Current user set', { userId: id });
  }

  /**
   * 创建用户资料
   */
  async createProfile(userId: string, username: string): Promise<UserProfile> {
    const now = this.deps.clock.now();
    const seed = this.deps.idGenerator.next('avatar');

    const newProfile: UserProfile = {
      id: userId,
      createTime: now,
      updateTime: now,
      name: `User_${username.slice(-4)}`,
      wxid: `wx_${username}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      region: 'China',
      gender: 'male',
      signature: 'Hello OpenChat!',
      status: { icon: 'online', text: 'Active', isActive: true },
    };

    await this.save(newProfile);
    this.currentUserId = userId;

    this.deps.logger.info(TAG, 'Profile created', { userId });
    return newProfile;
  }

  /**
   * 获取当前用户资料
   */
  async getProfile(): Promise<UserProfile | null> {
    const localProfile = this.currentUserId ? await this.findById(this.currentUserId) : null;
    const remoteProfile = await this.sdkService.fetchProfile({
      currentUserId: this.currentUserId,
      fallbackProfile: localProfile,
    });

    if (remoteProfile) {
      await this.save(remoteProfile, { silent: true });
      this.currentUserId = remoteProfile.id;
      return remoteProfile;
    }

    if (!this.currentUserId) {
      return null;
    }

    return localProfile || null;
  }

  /**
   * 根据ID获取用户资料
   */
  async getProfileById(id: string): Promise<UserProfile | null> {
    if (this.currentUserId === id) {
      return this.getProfile();
    }
    const profile = await this.findById(id);
    return profile || null;
  }

  /**
   * 更新用户资料
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    let profile = this.currentUserId ? await this.findById(this.currentUserId) : null;
    if (!profile) {
      const remoteProfile = await this.sdkService.fetchProfile({
        currentUserId: this.currentUserId,
      });
      if (remoteProfile) {
        profile = remoteProfile;
        this.currentUserId = remoteProfile.id;
        await this.save(remoteProfile, { silent: true });
      }
    }

    if (!this.currentUserId) {
      throw new Error('No active session');
    }

    if (!profile) {
      throw new Error('Profile not found');
    }

    const remoteUpdated = await this.sdkService.updateProfile(updates, {
      currentUserId: this.currentUserId,
      fallbackProfile: profile,
    });
    const updatedProfile = {
      ...(remoteUpdated || profile),
      ...updates,
      updateTime: this.deps.clock.now(),
    };

    await this.save(updatedProfile);

    this.deps.eventBus.emit(USER_EVENTS.PROFILE_UPDATED, { profile: updatedProfile });
    this.deps.logger.info(TAG, 'Profile updated', { userId: this.currentUserId, updates: Object.keys(updates) });
  }

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<string> {
    const remoteAvatarUrl = await this.sdkService.uploadAvatar(file);
    if (remoteAvatarUrl) {
      this.deps.logger.info(TAG, 'Avatar uploaded through SDK');
      return remoteAvatarUrl;
    }

    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 600));

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        this.deps.logger.info(TAG, 'Avatar uploaded');
        resolve(result);
      };
      reader.onerror = (error) => {
        this.deps.logger.error(TAG, 'Avatar upload failed', error);
        reject(error);
      };
    });
  }

  /**
   * 更新头像
   */
  async updateAvatar(avatarUrl: string): Promise<void> {
    await this.updateProfile({ avatar: avatarUrl });
    this.deps.eventBus.emit(USER_EVENTS.AVATAR_UPDATED, { avatar: avatarUrl });
  }
}

export function createUserService(_deps?: ServiceFactoryDeps): IUserService {
  return new UserServiceImpl(_deps);
}

export const userService: IUserService = createUserService();
