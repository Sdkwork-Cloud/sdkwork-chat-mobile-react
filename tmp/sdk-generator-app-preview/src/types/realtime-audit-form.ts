/** 实时内容审核请求 */
export interface RealtimeAuditForm {
  /** 流ID */
  streamId: string;
  /** 流URL */
  streamUrl?: string;
  /** 流类型 */
  streamType?: 'live' | 'rtc' | 'conference';
  /** 房间ID */
  roomId?: string;
  /** 主播/发布者ID */
  publisherId?: string;
  /** 检测类型 */
  checkTypes?: string[];
  /** 回调地址 */
  callbackUrl?: string;
  /** 音频检测 */
  checkAudio?: boolean;
  /** 视频检测 */
  checkVideo?: boolean;
}
