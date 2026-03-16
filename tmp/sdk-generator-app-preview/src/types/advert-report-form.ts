/** 广告举报请求 */
export interface AdvertReportForm {
  advertId: string;
  reportType: string;
  reason: string;
  screenshotUrl?: string;
  deviceId?: string;
  ipAddress?: string;
}
