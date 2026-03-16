import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultGenerationTaskVO, PlusApiResultPageGenerationTaskVO, PlusApiResultSoundEffectCategoriesVO, PlusApiResultSoundEffectGenerationVO, PlusApiResultVoid, SoundEffectGenerationForm } from '../types';


export class SoundEffectApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 创建音效生成任务 */
  async createGeneration(body: SoundEffectGenerationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/sound-effect`), body);
  }

/** 获取音效详情 */
  async getEffectDetail(effectId: string | number): Promise<PlusApiResultSoundEffectGenerationVO> {
    return this.client.get<PlusApiResultSoundEffectGenerationVO>(appApiPath(`/generation/sound-effect/${effectId}`));
  }

/** 获取任务列表 */
  async listTasks(params?: QueryParams): Promise<PlusApiResultPageGenerationTaskVO> {
    return this.client.get<PlusApiResultPageGenerationTaskVO>(appApiPath(`/generation/sound-effect/tasks`), params);
  }

/** 获取任务状态 */
  async getTaskStatus(taskId: string | number): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.get<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/sound-effect/tasks/${taskId}`));
  }

/** 取消任务 */
  async cancelTask(taskId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/sound-effect/tasks/${taskId}`));
  }

/** 获取音效类别 */
  async getCategories(params?: QueryParams): Promise<PlusApiResultSoundEffectCategoriesVO> {
    return this.client.get<PlusApiResultSoundEffectCategoriesVO>(appApiPath(`/generation/sound-effect/categories`), params);
  }
}

export function createSoundEffectApi(client: HttpClient): SoundEffectApi {
  return new SoundEffectApi(client);
}
