import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { ImageToVideoForm, PlusApiResultGenerationTaskVO, PlusApiResultPageGenerationTaskVO, PlusApiResultPageVideoVO, PlusApiResultVideoDetailVO, PlusApiResultVideoStatisticsVO, PlusApiResultVideoVO, PlusApiResultVoid, VideoCreateForm, VideoExtendForm, VideoGenerationForm, VideoStyleTransferForm, VideoUpdateForm } from '../types';


export class VideoApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取视频详情 */
  async getVideo(videoId: string | number): Promise<PlusApiResultVideoDetailVO> {
    return this.client.get<PlusApiResultVideoDetailVO>(appApiPath(`/video/${videoId}`));
  }

/** 更新视频 */
  async updateVideo(videoId: string | number, body: VideoUpdateForm): Promise<PlusApiResultVideoVO> {
    return this.client.put<PlusApiResultVideoVO>(appApiPath(`/video/${videoId}`), body);
  }

/** 删除视频 */
  async deleteVideo(videoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/video/${videoId}`));
  }

/** 上传视频 */
  async createVideo(body: VideoCreateForm): Promise<PlusApiResultVideoVO> {
    return this.client.post<PlusApiResultVideoVO>(appApiPath(`/video`), body);
  }

/** 发布视频 */
  async publish(videoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/video/${videoId}/publish`));
  }

/** 取消发布 */
  async unpublish(videoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/video/${videoId}/publish`));
  }

/** 点赞视频 */
  async like(videoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/video/${videoId}/like`));
  }

/** 取消点赞 */
  async unlike(videoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/video/${videoId}/like`));
  }

/** 收藏视频 */
  async favorite(videoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/video/${videoId}/favorite`));
  }

/** 取消收藏 */
  async unfavorite(videoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/video/${videoId}/favorite`));
  }

/** 记录下载 */
  async recordDownload(videoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/video/${videoId}/download`));
  }

/** 创建视频生成任务 */
  async createGeneration(body: VideoGenerationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/video`), body);
  }

/** 视频风格转换 */
  async styleTransfer(body: VideoStyleTransferForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/video/style-transfer`), body);
  }

/** 图生视频 */
  async imageTo(body: ImageToVideoForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/video/image-to-video`), body);
  }

/** 视频延长 */
  async extend(body: VideoExtendForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/video/extend`), body);
  }

/** 获取视频统计 */
  async getVideoStatistics(): Promise<PlusApiResultVideoStatisticsVO> {
    return this.client.get<PlusApiResultVideoStatisticsVO>(appApiPath(`/video/statistics`));
  }

/** 搜索视频 */
  async searchVideos(params?: QueryParams): Promise<PlusApiResultPageVideoVO> {
    return this.client.get<PlusApiResultPageVideoVO>(appApiPath(`/video/search`), params);
  }

/** 获取公开视频 */
  async getPublicVideos(params?: QueryParams): Promise<PlusApiResultPageVideoVO> {
    return this.client.get<PlusApiResultPageVideoVO>(appApiPath(`/video/public`), params);
  }

/** 获取热门视频 */
  async getPopularVideos(params?: QueryParams): Promise<PlusApiResultPageVideoVO> {
    return this.client.get<PlusApiResultPageVideoVO>(appApiPath(`/video/popular`), params);
  }

/** 获取最受喜爱视频 */
  async getMostLikedVideos(params?: QueryParams): Promise<PlusApiResultPageVideoVO> {
    return this.client.get<PlusApiResultPageVideoVO>(appApiPath(`/video/liked`), params);
  }

/** 获取收藏视频 */
  async getFavoriteVideos(params?: QueryParams): Promise<PlusApiResultPageVideoVO> {
    return this.client.get<PlusApiResultPageVideoVO>(appApiPath(`/video/favorites`), params);
  }

/** 获取任务列表 */
  async listTasks(params?: QueryParams): Promise<PlusApiResultPageGenerationTaskVO> {
    return this.client.get<PlusApiResultPageGenerationTaskVO>(appApiPath(`/generation/video/tasks`), params);
  }

/** 获取任务状态 */
  async getTaskStatus(taskId: string | number): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.get<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/video/tasks/${taskId}`));
  }

/** 取消任务 */
  async cancelTask(taskId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/video/tasks/${taskId}`));
  }
}

export function createVideoApi(client: HttpClient): VideoApi {
  return new VideoApi(client);
}
