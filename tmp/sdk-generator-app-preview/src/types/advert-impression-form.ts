/** 广告展示请求 */
export interface AdvertImpressionForm {
  advertId: string;
  positionId: string;
  impressionTime?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  screenSize?: string;
}
