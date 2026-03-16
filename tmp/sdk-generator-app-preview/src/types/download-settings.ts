/** 下载设置 */
export interface DownloadSettings {
  /** 下载路径 */
  downloadPath?: string;
  /** 仅WiFi下载 */
  wifiOnly?: boolean;
  /** 自动下载 */
  autoDownload?: boolean;
  /** 最大并发数 */
  maxConcurrent?: number;
}
