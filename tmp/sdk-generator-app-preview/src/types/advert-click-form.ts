/** 广告点击请求 */
export interface AdvertClickForm {
  advertId: string;
  positionId: string;
  clickTime?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}
