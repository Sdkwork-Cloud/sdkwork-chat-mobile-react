import type { VoiceItem } from './voice-item';

/** 语音列表响应 */
export interface VoiceListVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 语音列表 */
  voices?: VoiceItem[];
}
