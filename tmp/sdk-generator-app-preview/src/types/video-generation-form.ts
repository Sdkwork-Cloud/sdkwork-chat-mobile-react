import type { AssetMediaResource } from './asset-media-resource';

/** 视频生成请求 */
export interface VideoGenerationForm {
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
  /** 视频宽度(像素) */
  width?: number;
  /** 视频高度(像素) */
  height?: number;
  /** 视频时长(秒) */
  duration?: number;
  /** 帧率(FPS) */
  fps?: number;
  /** 输出格式(mp4/mov/webm) */
  format?: string;
  /** 视频风格(cinematic/anime/realistic等) */
  style?: string;
  /** 宽高比(16:9/9:16/1:1等) */
  aspectRatio?: string;
  /** 运动强度(1-255) */
  motionStrength?: number;
  /** 摄像机运动类型(zoom_in/zoom_out/pan_left/pan_right等) */
  cameraMotion?: string;
  /** 是否循环视频 */
  loop?: boolean;
  /** 是否高清 */
  hd?: boolean;
  /** 背景音乐URL列表 */
  audioUrls?: string[];
  /** 生成类型 */
  type?: 'DEFAULT' | 'IMAGE' | 'VIDEO' | 'SPEECH' | 'MUSIC' | 'MODEL_3D' | 'CODE' | 'DOCUMENT' | 'PPT' | 'VIDEO_AUTO_SLICE' | 'VOICE_SPEAKER' | 'CHARACTER' | 'AUDIO_EFFECT' | 'FILM' | 'OTHER';
  referenceAssetCount?: number;
}
