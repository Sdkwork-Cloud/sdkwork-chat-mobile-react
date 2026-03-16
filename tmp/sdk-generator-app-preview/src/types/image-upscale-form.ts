import type { AssetMediaResource } from './asset-media-resource';

/** 图片放大请求 */
export interface ImageUpscaleForm {
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
  /** 放大倍数(2/4) */
  scale?: number;
  /** 目标宽度(像素) */
  targetWidth?: number;
  /** 目标高度(像素) */
  targetHeight?: number;
  /** 输出格式(png/jpg/webp) */
  format?: string;
  /** 生成类型 */
  type?: 'DEFAULT' | 'IMAGE' | 'VIDEO' | 'SPEECH' | 'MUSIC' | 'MODEL_3D' | 'CODE' | 'DOCUMENT' | 'PPT' | 'VIDEO_AUTO_SLICE' | 'VOICE_SPEAKER' | 'CHARACTER' | 'AUDIO_EFFECT' | 'FILM' | 'OTHER';
  referenceAssetCount?: number;
}
