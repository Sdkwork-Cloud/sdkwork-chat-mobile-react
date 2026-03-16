import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { MusicCreateForm, MusicExtendForm, MusicGenerationForm, MusicRemixForm, MusicSimilarForm, MusicUpdateForm, PlusApiResultGenerationTaskVO, PlusApiResultMusicDetailVO, PlusApiResultMusicStatisticsVO, PlusApiResultMusicStylesVO, PlusApiResultMusicVO, PlusApiResultPageGenerationTaskVO, PlusApiResultPageMusicVO, PlusApiResultVoid } from '../types';


export class MusicApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取音乐详情 */
  async getMusic(musicId: string | number): Promise<PlusApiResultMusicDetailVO> {
    return this.client.get<PlusApiResultMusicDetailVO>(appApiPath(`/music/${musicId}`));
  }

/** 更新音乐 */
  async updateMusic(musicId: string | number, body: MusicUpdateForm): Promise<PlusApiResultMusicVO> {
    return this.client.put<PlusApiResultMusicVO>(appApiPath(`/music/${musicId}`), body);
  }

/** 删除音乐 */
  async deleteMusic(musicId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/music/${musicId}`));
  }

/** 上传音乐 */
  async createMusic(body: MusicCreateForm): Promise<PlusApiResultMusicVO> {
    return this.client.post<PlusApiResultMusicVO>(appApiPath(`/music`), body);
  }

/** 发布音乐 */
  async publish(musicId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/music/${musicId}/publish`));
  }

/** 取消发布 */
  async unpublish(musicId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/music/${musicId}/publish`));
  }

/** 点赞音乐 */
  async like(musicId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/music/${musicId}/like`));
  }

/** 取消点赞 */
  async unlike(musicId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/music/${musicId}/like`));
  }

/** 收藏音乐 */
  async favorite(musicId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/music/${musicId}/favorite`));
  }

/** 取消收藏 */
  async unfavorite(musicId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/music/${musicId}/favorite`));
  }

/** 记录下载 */
  async recordDownload(musicId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/music/${musicId}/download`));
  }

/** 创建音乐生成任务 */
  async createGeneration(body: MusicGenerationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/music`), body);
  }

/** 相似音乐生成 */
  async generateSimilar(body: MusicSimilarForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/music/similar`), body);
  }

/** 音乐混音 */
  async remix(body: MusicRemixForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/music/remix`), body);
  }

/** 音乐续写 */
  async extend(body: MusicExtendForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/music/extend`), body);
  }

/** 获取音乐统计 */
  async getMusicStatistics(): Promise<PlusApiResultMusicStatisticsVO> {
    return this.client.get<PlusApiResultMusicStatisticsVO>(appApiPath(`/music/statistics`));
  }

/** 搜索音乐 */
  async search(params?: QueryParams): Promise<PlusApiResultPageMusicVO> {
    return this.client.get<PlusApiResultPageMusicVO>(appApiPath(`/music/search`), params);
  }

/** 获取公开音乐 */
  async getPublic(params?: QueryParams): Promise<PlusApiResultPageMusicVO> {
    return this.client.get<PlusApiResultPageMusicVO>(appApiPath(`/music/public`), params);
  }

/** 获取热门音乐 */
  async getPopular(params?: QueryParams): Promise<PlusApiResultPageMusicVO> {
    return this.client.get<PlusApiResultPageMusicVO>(appApiPath(`/music/popular`), params);
  }

/** 获取最受喜爱音乐 */
  async getMostLiked(params?: QueryParams): Promise<PlusApiResultPageMusicVO> {
    return this.client.get<PlusApiResultPageMusicVO>(appApiPath(`/music/liked`), params);
  }

/** 获取收藏音乐 */
  async getFavorite(params?: QueryParams): Promise<PlusApiResultPageMusicVO> {
    return this.client.get<PlusApiResultPageMusicVO>(appApiPath(`/music/favorites`), params);
  }

/** 获取任务列表 */
  async listTasks(params?: QueryParams): Promise<PlusApiResultPageGenerationTaskVO> {
    return this.client.get<PlusApiResultPageGenerationTaskVO>(appApiPath(`/generation/music/tasks`), params);
  }

/** 获取任务状态 */
  async getTaskStatus(taskId: string | number): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.get<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/music/tasks/${taskId}`));
  }

/** 取消任务 */
  async cancelTask(taskId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/music/tasks/${taskId}`));
  }

/** 获取音乐风格列表 */
  async getMusicStyles(params?: QueryParams): Promise<PlusApiResultMusicStylesVO> {
    return this.client.get<PlusApiResultMusicStylesVO>(appApiPath(`/generation/music/styles`), params);
  }
}

export function createMusicApi(client: HttpClient): MusicApi {
  return new MusicApi(client);
}
