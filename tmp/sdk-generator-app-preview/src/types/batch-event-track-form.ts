import type { EventTrackForm } from './event-track-form';

/** 批量事件追踪请求 */
export interface BatchEventTrackForm {
  /** 事件列表 */
  events: EventTrackForm[];
  /** 设备ID */
  deviceId?: string;
  /** 用户ID */
  userId?: string;
  /** 批量提交时间 */
  submitTime?: string;
}
