import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { AccountDeactivateForm, PasswordChangeForm, PlusApiResultListUserAddressVO, PlusApiResultMapStringString, PlusApiResultPageMapStringObject, PlusApiResultUserAddressVO, PlusApiResultUserProfileVO, PlusApiResultUserSettingsVO, PlusApiResultVoid, ThirdPartyBindForm, UploadAvatarRequest, UserAddressCreateForm, UserAddressUpdateForm, UserProfileUpdateForm, UserSettingsUpdateForm } from '../types';


export class UserApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取用户设置 */
  async getUserSettings(): Promise<PlusApiResultUserSettingsVO> {
    return this.client.get<PlusApiResultUserSettingsVO>(appApiPath(`/user/settings`));
  }

/** 更新用户设置 */
  async updateUserSettings(body: UserSettingsUpdateForm): Promise<PlusApiResultUserSettingsVO> {
    return this.client.put<PlusApiResultUserSettingsVO>(appApiPath(`/user/settings`), body);
  }

/** 获取用户信息 */
  async getUserProfile(): Promise<PlusApiResultUserProfileVO> {
    return this.client.get<PlusApiResultUserProfileVO>(appApiPath(`/user/profile`));
  }

/** 更新用户信息 */
  async updateUserProfile(body: UserProfileUpdateForm): Promise<PlusApiResultUserProfileVO> {
    return this.client.put<PlusApiResultUserProfileVO>(appApiPath(`/user/profile`), body);
  }

/** 修改密码 */
  async changePassword(body: PasswordChangeForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/user/password`), body);
  }

/** 获取地址详情 */
  async getAddressDetail(addressId: string | number): Promise<PlusApiResultUserAddressVO> {
    return this.client.get<PlusApiResultUserAddressVO>(appApiPath(`/user/address/${addressId}`));
  }

/** 更新地址 */
  async updateAddress(addressId: string | number, body: UserAddressUpdateForm): Promise<PlusApiResultUserAddressVO> {
    return this.client.put<PlusApiResultUserAddressVO>(appApiPath(`/user/address/${addressId}`), body);
  }

/** 删除地址 */
  async deleteAddress(addressId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/user/address/${addressId}`));
  }

/** 设置默认地址 */
  async setDefaultAddress(addressId: string | number): Promise<PlusApiResultUserAddressVO> {
    return this.client.put<PlusApiResultUserAddressVO>(appApiPath(`/user/address/${addressId}/default`));
  }

/** 注销账号 */
  async deactivateAccount(body: AccountDeactivateForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/user/deactivate`), body);
  }

/** 绑定第三方账号 */
  async bindThirdPartyAccount(platform: string | number, body: ThirdPartyBindForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/user/bind/${platform}`), body);
  }

/** 解绑第三方账号 */
  async unbindThirdPartyAccount(platform: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/user/bind/${platform}`));
  }

/** 上传头像 */
  async uploadAvatar(body?: UploadAvatarRequest): Promise<PlusApiResultMapStringString> {
    return this.client.post<PlusApiResultMapStringString>(appApiPath(`/user/avatar`), body);
  }

/** 获取地址列表 */
  async listAddresses(): Promise<PlusApiResultListUserAddressVO> {
    return this.client.get<PlusApiResultListUserAddressVO>(appApiPath(`/user/address`));
  }

/** 创建地址 */
  async createAddress(body: UserAddressCreateForm): Promise<PlusApiResultUserAddressVO> {
    return this.client.post<PlusApiResultUserAddressVO>(appApiPath(`/user/address`), body);
  }

/** 获取登录历史 */
  async getLoginHistory(params?: QueryParams): Promise<PlusApiResultPageMapStringObject> {
    return this.client.get<PlusApiResultPageMapStringObject>(appApiPath(`/user/history/login`), params);
  }

/** 获取生成历史 */
  async getGenerationHistory(params?: QueryParams): Promise<PlusApiResultPageMapStringObject> {
    return this.client.get<PlusApiResultPageMapStringObject>(appApiPath(`/user/history/generations`), params);
  }

/** 获取默认地址 */
  async getDefaultAddress(): Promise<PlusApiResultUserAddressVO> {
    return this.client.get<PlusApiResultUserAddressVO>(appApiPath(`/user/address/default`));
  }
}

export function createUserApi(client: HttpClient): UserApi {
  return new UserApi(client);
}
