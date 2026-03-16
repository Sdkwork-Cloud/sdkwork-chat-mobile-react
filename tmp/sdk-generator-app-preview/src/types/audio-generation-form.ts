import type { AssetMediaResource } from './asset-media-resource';

/** 语音合成请求(TTS) */
export interface AudioGenerationForm {
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
  /** 待转换文本 */
  text: string;
  /** 语音标识 */
  voice?: string;
  /** 语言代码 */
  language?: string;
  /** 语速(0.25-4.0) */
  speed?: number;
  /** 音调(0.5-2.0) */
  pitch?: number;
  /** 音量(0-100) */
  volume?: number;
  /** 输出格式(mp3/wav/ogg/pcm) */
  format?: string;
  /** 情感类型(neutral/happy/sad/angry等) */
  emotion?: string;
  /** 生成类型 */
  type?: 'DEFAULT' | 'IMAGE' | 'VIDEO' | 'SPEECH' | 'MUSIC' | 'MODEL_3D' | 'CODE' | 'DOCUMENT' | 'PPT' | 'VIDEO_AUTO_SLICE' | 'VOICE_SPEAKER' | 'CHARACTER' | 'AUDIO_EFFECT' | 'FILM' | 'OTHER';
  referenceAssetCount?: number;
}
