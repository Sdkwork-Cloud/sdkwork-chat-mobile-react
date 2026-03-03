import type { BaseEntity } from '@sdkwork/react-mobile-core';

export type VideoType = 'short' | 'channel' | 'live';

export interface Video extends BaseEntity {
  title: string;
  thumbnail: string;
  url: string;
  author: string;
  authorAvatar: string;
  views: number;
  likes: number;
  duration: number;
  type: VideoType;
}

export interface VideoState {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
}

export interface IVideoService {
  getVideos(type?: VideoType): Promise<Video[]>;
  likeVideo(id: string): Promise<void>;
}
