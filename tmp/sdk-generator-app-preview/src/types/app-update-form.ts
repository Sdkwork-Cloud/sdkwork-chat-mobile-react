import type { AppConfig } from './app-config';
import type { AppInstallConfig } from './app-install-config';
import type { AppInstallSkill } from './app-install-skill';
import type { AppPlatforms } from './app-platforms';

/** 更新应用表单 */
export interface AppUpdateForm {
  /** 应用名称 */
  name?: string;
  /** 应用描述 */
  description?: string;
  /** 访问URL */
  accessUrl?: string;
  /** 应用版本 */
  version?: string;
  /** 应用图标URL */
  iconUrl?: string;
  /** 应用配置 */
  config?: AppConfig;
  /** 支持平台 */
  platforms?: AppPlatforms;
  /** 支持安装平台 */
  installPlatforms?: AppPlatforms;
  /** 安装技能 */
  installSkill?: AppInstallSkill;
  /** 安装配置 */
  installConfig?: AppInstallConfig;
  /** Android 包名 */
  packageName?: string;
  /** iOS Bundle ID */
  bundleId?: string;
  /** 商店URL */
  storeUrl?: string;
  /** 下载URL */
  downloadUrl?: string;
}
