import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { ImageCreateForm, ImageEditForm, ImageGenerationForm, ImageUpdateForm, ImageUpscaleForm, ImageVariationForm, PlusApiResultGenerationTaskVO, PlusApiResultImageDetailVO, PlusApiResultImageStatisticsVO, PlusApiResultImageVO, PlusApiResultPageGenerationTaskVO, PlusApiResultPageImageVO, PlusApiResultVoid } from '../types';


export class ImageApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取图片详情 */
  async getImage(imageId: string | number): Promise<PlusApiResultImageDetailVO> {
    return this.client.get<PlusApiResultImageDetailVO>(appApiPath(`/image/${imageId}`));
  }

/** 更新图片 */
  async updateImage(imageId: string | number, body: ImageUpdateForm): Promise<PlusApiResultImageVO> {
    return this.client.put<PlusApiResultImageVO>(appApiPath(`/image/${imageId}`), body);
  }

/** 删除图片 */
  async deleteImage(imageId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/image/${imageId}`));
  }

/** 上传图片 */
  async createImage(body: ImageCreateForm): Promise<PlusApiResultImageVO> {
    return this.client.post<PlusApiResultImageVO>(appApiPath(`/image`), body);
  }

/** 点赞图片 */
  async like(imageId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/image/${imageId}/like`));
  }

/** 取消点赞 */
  async unlike(imageId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/image/${imageId}/like`));
  }

/** 收藏图片 */
  async favorite(imageId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/image/${imageId}/favorite`));
  }

/** 取消收藏 */
  async unfavorite(imageId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/image/${imageId}/favorite`));
  }

/** 记录下载 */
  async recordDownload(imageId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/image/${imageId}/download`));
  }

/** 创建图片生成任务 */
  async createGeneration(body: ImageGenerationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/image`), body);
  }

/** 生成变体 */
  async createVariation(body: ImageVariationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/image/variations`), body);
  }

/** 图片放大 */
  async upscale(body: ImageUpscaleForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/image/upscale`), body);
  }

/** 图片编辑 */
  async edit(body: ImageEditForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/image/edits`), body);
  }

/** 获取图片统计 */
  async getImageStatistics(): Promise<PlusApiResultImageStatisticsVO> {
    return this.client.get<PlusApiResultImageStatisticsVO>(appApiPath(`/image/statistics`));
  }

/** 搜索图片 */
  async searchImages(params?: QueryParams): Promise<PlusApiResultPageImageVO> {
    return this.client.get<PlusApiResultPageImageVO>(appApiPath(`/image/search`), params);
  }

/** 获取公开图片 */
  async getPublicImages(params?: QueryParams): Promise<PlusApiResultPageImageVO> {
    return this.client.get<PlusApiResultPageImageVO>(appApiPath(`/image/public`), params);
  }

/** 获取热门图片 */
  async getPopularImages(params?: QueryParams): Promise<PlusApiResultPageImageVO> {
    return this.client.get<PlusApiResultPageImageVO>(appApiPath(`/image/popular`), params);
  }

/** 获取最受喜爱图片 */
  async getMostLikedImages(params?: QueryParams): Promise<PlusApiResultPageImageVO> {
    return this.client.get<PlusApiResultPageImageVO>(appApiPath(`/image/liked`), params);
  }

/** 获取收藏图片 */
  async getFavoriteImages(params?: QueryParams): Promise<PlusApiResultPageImageVO> {
    return this.client.get<PlusApiResultPageImageVO>(appApiPath(`/image/favorites`), params);
  }

/** 获取任务列表 */
  async listTasks(params?: QueryParams): Promise<PlusApiResultPageGenerationTaskVO> {
    return this.client.get<PlusApiResultPageGenerationTaskVO>(appApiPath(`/generation/image/tasks`), params);
  }

/** 获取任务状态 */
  async getTaskStatus(taskId: string | number): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.get<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/image/tasks/${taskId}`));
  }

/** 取消任务 */
  async cancelTask(taskId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/image/tasks/${taskId}`));
  }
}

export function createImageApi(client: HttpClient): ImageApi {
  return new ImageApi(client);
}
