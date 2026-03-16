import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPagePromptHistoryVO, PlusApiResultPagePromptVO, PlusApiResultPromptHistoryVO, PlusApiResultPromptVO, PlusApiResultVoid, PromptCreateForm, PromptUpdateForm } from '../types';


export class AiApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取提示语详情 */
  async getPromptDetail(id: string | number): Promise<PlusApiResultPromptVO> {
    return this.client.get<PlusApiResultPromptVO>(appApiPath(`/prompt/${id}`));
  }

/** 更新提示语 */
  async updatePrompt(id: string | number, body: PromptUpdateForm): Promise<PlusApiResultPromptVO> {
    return this.client.put<PlusApiResultPromptVO>(appApiPath(`/prompt/${id}`), body);
  }

/** 删除提示语 */
  async deletePrompt(id: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/prompt/${id}`));
  }

/** 创建提示语 */
  async createPrompt(body: PromptCreateForm): Promise<PlusApiResultPromptVO> {
    return this.client.post<PlusApiResultPromptVO>(appApiPath(`/prompt`), body);
  }

/** 使用提示语 */
  async usePrompt(id: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/prompt/${id}/use`));
  }

/** 收藏提示语 */
  async favoritePrompt(id: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/prompt/${id}/favorite`));
  }

/** 取消收藏提示语 */
  async unfavoritePrompt(id: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/prompt/${id}/favorite`));
  }

/** 获取热门提示语 */
  async getPopularPrompts(params?: QueryParams): Promise<PlusApiResultPagePromptVO> {
    return this.client.get<PlusApiResultPagePromptVO>(appApiPath(`/prompt/popular`), params);
  }

/** 获取最受欢迎提示语 */
  async getMostFavoritedPrompts(params?: QueryParams): Promise<PlusApiResultPagePromptVO> {
    return this.client.get<PlusApiResultPagePromptVO>(appApiPath(`/prompt/most-favorited`), params);
  }

/** 获取提示语列表 */
  async listPrompts(params?: QueryParams): Promise<PlusApiResultPagePromptVO> {
    return this.client.get<PlusApiResultPagePromptVO>(appApiPath(`/prompt/list`), params);
  }

/** 获取提示语历史详情 */
  async getPromptHistoryDetail(id: string | number): Promise<PlusApiResultPromptHistoryVO> {
    return this.client.get<PlusApiResultPromptHistoryVO>(appApiPath(`/prompt/history/${id}`));
  }

/** 删除提示语历史 */
  async deletePromptHistory(id: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/prompt/history/${id}`));
  }

/** 获取提示语使用历史 */
  async listPromptHistory(params?: QueryParams): Promise<PlusApiResultPagePromptHistoryVO> {
    return this.client.get<PlusApiResultPagePromptHistoryVO>(appApiPath(`/prompt/history/list`), params);
  }
}

export function createAiApi(client: HttpClient): AiApi {
  return new AiApi(client);
}
