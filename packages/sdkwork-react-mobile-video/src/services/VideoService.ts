import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { Video, VideoType, IVideoService } from '../types';

const TAG = 'VideoService';

class VideoServiceImpl extends AbstractStorageService<Video> implements IVideoService {
  protected STORAGE_KEY = 'sys_video_content_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  protected async onInitialize() {
    const list = this.cache || [];
    if (list.length === 0) {
      const now = this.deps.clock.now();
      const mockVideos: Video[] = [
        {
          id: 'vid_1',
          type: 'short',
          title: 'AI Highlights',
          thumbnail: 'https://picsum.photos/400/600?random=1',
          url: 'https://example.com/video1.mp4',
          author: 'AIAssistant',
          authorAvatar: 'https://picsum.photos/100/100?random=1',
          views: 1000,
          likes: 128,
          duration: 60,
          createTime: now - 86400000,
          updateTime: now - 86400000,
        },
        {
          id: 'vid_2',
          type: 'live',
          title: 'Live Session',
          thumbnail: 'https://picsum.photos/400/600?random=2',
          url: 'https://example.com/live1.m3u8',
          author: 'OpenChat Live',
          authorAvatar: 'https://picsum.photos/100/100?random=2',
          views: 2000,
          likes: 256,
          duration: 3600,
          createTime: now - 172800000,
          updateTime: now - 172800000,
        },
      ];
      list.push(...mockVideos);
      this.cache = list;
      await this.commit();
      this.deps.logger.info(TAG, 'Mock videos initialized');
    }
  }

  async getVideos(type?: VideoType): Promise<Video[]> {
    const list = await this.findAll({
      sort: { field: 'createTime', order: 'desc' },
    });

    if (type) {
      return (list.content || []).filter((v) => v.type === type);
    }
    return list.content || [];
  }

  async likeVideo(id: string): Promise<void> {
    const video = await this.findById(id);
    if (video) {
      video.likes += 1;
      video.updateTime = this.deps.clock.now();
      await this.save(video);
      this.deps.logger.info(TAG, 'Video liked', { id });
    }
  }
}

export function createVideoService(_deps?: ServiceFactoryDeps): IVideoService {
  return new VideoServiceImpl(_deps);
}

export const videoService: IVideoService = createVideoService();
