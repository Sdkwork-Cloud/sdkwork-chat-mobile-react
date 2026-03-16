/** 视频完成请求 */
export interface VideoCompleteForm {
  advertId: string;
  videoId: string;
  completeTime?: string;
  duration?: string;
  deviceId?: string;
  ipAddress?: string;
}
