/** 广告关闭请求 */
export interface AdvertCloseForm {
  advertId: string;
  positionId: string;
  closeTime?: string;
  duration?: string;
  deviceId?: string;
  ipAddress?: string;
}
