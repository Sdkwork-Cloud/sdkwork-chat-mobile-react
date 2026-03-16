import type { AudioEffectGenerationInput } from './audio-effect-generation-input';
import type { AudioGenerationInput } from './audio-generation-input';
import type { BaseGenerationInput } from './base-generation-input';
import type { CharacterGenerationInput } from './character-generation-input';
import type { ImageGenerationInput } from './image-generation-input';
import type { MusicGenerationInput } from './music-generation-input';
import type { VideoGenerationInput } from './video-generation-input';
import type { VoiceSpeakerGenerationInput } from './voice-speaker-generation-input';

/** AI生成任务输入参数统一入口 */
export interface GenerationInput {
  /** 生成类型 */
  type?: 'DEFAULT' | 'IMAGE' | 'VIDEO' | 'SPEECH' | 'MUSIC' | 'MODEL_3D' | 'CODE' | 'DOCUMENT' | 'PPT' | 'VIDEO_AUTO_SLICE' | 'VOICE_SPEAKER' | 'CHARACTER' | 'AUDIO_EFFECT' | 'FILM' | 'OTHER';
  /** 图片生成参数 */
  image?: ImageGenerationInput;
  /** 视频生成参数 */
  video?: VideoGenerationInput;
  /** 音频生成参数 */
  audio?: AudioGenerationInput;
  /** 音乐生成参数 */
  music?: MusicGenerationInput;
  /** 角色生成参数 */
  character?: CharacterGenerationInput;
  /** 语音说话人生成参数 */
  voiceSpeaker?: VoiceSpeakerGenerationInput;
  /** 音效生成参数 */
  audioEffect?: AudioEffectGenerationInput;
  input?: BaseGenerationInput;
  prompt?: string;
}
