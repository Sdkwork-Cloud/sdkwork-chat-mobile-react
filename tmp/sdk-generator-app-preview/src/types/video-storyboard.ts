import type { AudioMediaResource } from './audio-media-resource';
import type { VideoMediaResource } from './video-media-resource';
import type { VideoShotItem } from './video-shot-item';
import type { VoiceSpeakerInfo } from './voice-speaker-info';

/** Video storyboard */
export interface VideoStoryboard {
  /** Video shots list */
  shots?: VideoShotItem[];
  /** Final rendered video from the storyboard */
  finalVideo?: VideoMediaResource;
  /** Final audio track for the storyboard */
  finalAudio?: AudioMediaResource;
  /** Storyboard title */
  title?: string;
  /** Storyboard description */
  description?: string;
  /** Video style */
  style?: string;
  /** Video aspect ratio */
  aspectRatio?: string;
  /** Video generation prompt */
  prompt?: string;
  /** Total video duration in seconds */
  duration?: number;
  /** Speaker */
  speaker?: VoiceSpeakerInfo;
}
