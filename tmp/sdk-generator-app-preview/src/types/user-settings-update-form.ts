import type { DownloadSettings } from './download-settings';
import type { NotificationSettings } from './notification-settings';
import type { PrivacySettings } from './privacy-settings';

/** 用户设置更新请求 */
export interface UserSettingsUpdateForm {
  /** 通知设置 */
  notificationSettings?: NotificationSettings;
  /** 隐私设置 */
  privacySettings?: PrivacySettings;
  /** 语言设置 */
  language?: string;
  /** 主题设置：light/dark/system */
  theme?: string;
  /** 自动播放设置 */
  autoPlay?: boolean;
  /** 高质量模式 */
  highQuality?: boolean;
  /** 流量节省模式 */
  dataSaver?: boolean;
  /** 下载设置 */
  downloadSettings?: DownloadSettings;
}
