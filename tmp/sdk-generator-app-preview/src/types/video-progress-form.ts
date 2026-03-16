/** 视频进度请求 */
export interface VideoProgressForm {
  advertId: string;
  videoId: string;
  progress: number;
  timestamp?: string;
  deviceId?: string;
  ipAddress?: string;
}
