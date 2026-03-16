import type { AssetMediaResource } from './asset-media-resource';

/** 图片生成请求 */
export interface ImageGenerationForm {
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
  /** 图片宽度(像素) */
  width?: number;
  /** 图片高度(像素) */
  height?: number;
  /** 图片尺寸预设 */
  size?: string;
  /** 图片质量(standard/hd) */
  quality?: string;
  /** 图片风格(vivid/natural) */
  style?: string;
  /** 输出格式(png/jpg/webp) */
  format?: string;
  /** CFG Scale/Guidance Scale */
  cfgScale?: number;
  /** 推理步数 */
  steps?: number;
  /** 采样器类型 */
  sampler?: string;
  /** 图生图强度(0.0-1.0) */
  strength?: number;
  /** 蒙版资源列表(用于局部重绘) */
  maskAssets?: AssetMediaResource[];
  /** 是否启用安全检查 */
  safetyChecker?: boolean;
  /** 宽高比(16:9/9:16/1:1等) */
  aspectRatio?: string;
  /** 生成类型 */
  type?: 'DEFAULT' | 'IMAGE' | 'VIDEO' | 'SPEECH' | 'MUSIC' | 'MODEL_3D' | 'CODE' | 'DOCUMENT' | 'PPT' | 'VIDEO_AUTO_SLICE' | 'VOICE_SPEAKER' | 'CHARACTER' | 'AUDIO_EFFECT' | 'FILM' | 'OTHER';
  referenceAssetCount?: number;
}
