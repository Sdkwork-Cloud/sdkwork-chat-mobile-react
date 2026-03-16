import type { AssetMediaResource } from './asset-media-resource';

/** 音乐生成请求 */
export interface MusicGenerationForm {
  /** 任务标题 */
  title?: string;
  /** 提示词 */
  prompt: string;
  /** 反向提示词 */
  negativePrompt?: string;
  /** 模型标识 */
  model: string;
  /** 渠道标识 */
  channel?: string;
  /** 参考资源列表(支持图片/视频/音频等任意类型) */
  referenceAssets?: AssetMediaResource[];
  /** 生成数量 */
  n?: number;
  /** 随机种子 */
  seed?: number;
  /** 是否异步生成 */
  async?: boolean;
  /** 回调URL */
  callbackUrl?: string;
  /** 扩展参数 */
  extraParams?: Record<string, unknown>;
  /** 业务场景标识 */
  bizScene?: string;
  /** 关联业务ID */
  bizId?: number;
  /** 会话ID */
  conversationId?: number;
  /** 消息ID */
  messageId?: number;
  /** 歌词 */
  lyrics?: string;
  /** 音乐时长(秒) */
  duration?: number;
  /** 流派(pop/rock/jazz/classical/edm等) */
  genre?: string;
  /** 风格 */
  style?: string;
  /** 速度BPM */
  tempo?: number;
  /** 调式(C major/A minor等) */
  key?: string;
  /** 情绪(happy/sad/energetic/calm等) */
  mood?: string;
  /** 乐器 */
  instruments?: string;
  /** 输出格式(mp3/wav/flac) */
  format?: string;
  /** 生成类型 */
  type?: 'DEFAULT' | 'IMAGE' | 'VIDEO' | 'SPEECH' | 'MUSIC' | 'MODEL_3D' | 'CODE' | 'DOCUMENT' | 'PPT' | 'VIDEO_AUTO_SLICE' | 'VOICE_SPEAKER' | 'CHARACTER' | 'AUDIO_EFFECT' | 'FILM' | 'OTHER';
  referenceAssetCount?: number;
}
