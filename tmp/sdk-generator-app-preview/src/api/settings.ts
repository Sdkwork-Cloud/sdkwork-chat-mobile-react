import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { DataExportForm, LanguageSwitchForm, PasswordChangeForm, PlusApiResultAppConfigVO, PlusApiResultAppVersionVO, PlusApiResultDataExportVO, PlusApiResultMapStringBoolean, PlusApiResultMapStringObject, PlusApiResultPrivacySettingsVO, PlusApiResultSecuritySettingsVO, PlusApiResultTwoFactorSetupVO, PlusApiResultUISettingsVO, PlusApiResultVoid, PrivacySettingsUpdateForm, SecuritySettingsUpdateForm, SettingsUpdateForm, ThemeSwitchForm, TwoFactorToggleForm, UISettingsUpdateForm } from '../types';


export class SettingsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取模块设置 */
  async getModule(module: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/settings/${module}`));
  }

/** 更新模块设置 */
  async updateModule(module: string | number, body: SettingsUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/settings/${module}`), body);
  }

/** 重置模块设置 */
  async resetModule(module: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/settings/${module}`));
  }

/** 获取界面设置 */
  async getUi(): Promise<PlusApiResultUISettingsVO> {
    return this.client.get<PlusApiResultUISettingsVO>(appApiPath(`/settings/ui`));
  }

/** 更新界面设置 */
  async updateUi(body: UISettingsUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/settings/ui`), body);
  }

/** 切换主题 */
  async switchTheme(body: ThemeSwitchForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/settings/ui/theme`), body);
  }

/** 切换语言 */
  async switchLanguage(body: LanguageSwitchForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/settings/ui/language`), body);
  }

/** 获取安全设置 */
  async getSecurity(): Promise<PlusApiResultSecuritySettingsVO> {
    return this.client.get<PlusApiResultSecuritySettingsVO>(appApiPath(`/settings/security`));
  }

/** 更新安全设置 */
  async updateSecurity(body: SecuritySettingsUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/settings/security`), body);
  }

/** 修改密码 */
  async changePassword(body: PasswordChangeForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/settings/security/password`), body);
  }

/** 两步验证设置 */
  async toggleTwoFactor(body: TwoFactorToggleForm): Promise<PlusApiResultTwoFactorSetupVO> {
    return this.client.put<PlusApiResultTwoFactorSetupVO>(appApiPath(`/settings/security/2fa`), body);
  }

/** 获取隐私设置 */
  async getPrivacy(): Promise<PlusApiResultPrivacySettingsVO> {
    return this.client.get<PlusApiResultPrivacySettingsVO>(appApiPath(`/settings/privacy`));
  }

/** 更新隐私设置 */
  async updatePrivacy(body: PrivacySettingsUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/settings/privacy`), body);
  }

/** 导出用户数据 */
  async exportUserData(body: DataExportForm): Promise<PlusApiResultDataExportVO> {
    return this.client.post<PlusApiResultDataExportVO>(appApiPath(`/settings/data/export`), body);
  }

/** 获取所有设置 */
  async getAll(): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/settings`));
  }

/** 重置所有设置 */
  async resetAll(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/settings`));
  }

/** 获取版本信息 */
  async getAppVersion(params?: QueryParams): Promise<PlusApiResultAppVersionVO> {
    return this.client.get<PlusApiResultAppVersionVO>(appApiPath(`/settings/app/version`), params);
  }

/** 获取功能开关 */
  async getFeatureFlags(): Promise<PlusApiResultMapStringBoolean> {
    return this.client.get<PlusApiResultMapStringBoolean>(appApiPath(`/settings/app/features`));
  }

/** 获取应用配置 */
  async getAppConfig(): Promise<PlusApiResultAppConfigVO> {
    return this.client.get<PlusApiResultAppConfigVO>(appApiPath(`/settings/app/config`));
  }

/** 清除本地数据 */
  async clearLocalData(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/settings/data/local`));
  }

/** 清除缓存 */
  async clearCache(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/settings/cache`));
  }

/** 删除账户 */
  async deleteAccount(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/settings/account`));
  }
}

export function createSettingsApi(client: HttpClient): SettingsApi {
  return new SettingsApi(client);
}
