import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { GenerationStyleCreateForm, GenerationStyleUpdateForm, PlusApiResultGenerationStyleDetailVO, PlusApiResultGenerationStyleVO, PlusApiResultListStyleTypeVO, PlusApiResultPageGenerationStyleVO, PlusApiResultStyleStatisticsVO, PlusApiResultVoid } from '../types';


export class StyleApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取风格详情 */
  async getStyle(styleId: string | number): Promise<PlusApiResultGenerationStyleDetailVO> {
    return this.client.get<PlusApiResultGenerationStyleDetailVO>(appApiPath(`/generation/style/${styleId}`));
  }

/** 更新风格 */
  async updateStyle(styleId: string | number, body: GenerationStyleUpdateForm): Promise<PlusApiResultGenerationStyleVO> {
    return this.client.put<PlusApiResultGenerationStyleVO>(appApiPath(`/generation/style/${styleId}`), body);
  }

/** 删除风格 */
  async deleteStyle(styleId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/style/${styleId}`));
  }

/** 创建风格 */
  async createStyle(body: GenerationStyleCreateForm): Promise<PlusApiResultGenerationStyleVO> {
    return this.client.post<PlusApiResultGenerationStyleVO>(appApiPath(`/generation/style`), body);
  }

/** 发布风格 */
  async publish(styleId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/generation/style/${styleId}/publish`));
  }

/** 取消发布 */
  async unpublish(styleId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/style/${styleId}/publish`));
  }

/** 停用风格 */
  async deactivate(styleId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/generation/style/${styleId}/deactivate`));
  }

/** 激活风格 */
  async activate(styleId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/generation/style/${styleId}/activate`));
  }

/** 获取风格类型列表 */
  async getStyleTypes(): Promise<PlusApiResultListStyleTypeVO> {
    return this.client.get<PlusApiResultListStyleTypeVO>(appApiPath(`/generation/style/types`));
  }

/** 获取风格统计 */
  async getStyleStatistics(): Promise<PlusApiResultStyleStatisticsVO> {
    return this.client.get<PlusApiResultStyleStatisticsVO>(appApiPath(`/generation/style/statistics`));
  }

/** 搜索风格 */
  async searchStyles(params?: QueryParams): Promise<PlusApiResultPageGenerationStyleVO> {
    return this.client.get<PlusApiResultPageGenerationStyleVO>(appApiPath(`/generation/style/search`), params);
  }

/** 获取公开风格 */
  async getPublicStyles(params?: QueryParams): Promise<PlusApiResultPageGenerationStyleVO> {
    return this.client.get<PlusApiResultPageGenerationStyleVO>(appApiPath(`/generation/style/public`), params);
  }

/** 获取热门风格 */
  async getPopularStyles(params?: QueryParams): Promise<PlusApiResultPageGenerationStyleVO> {
    return this.client.get<PlusApiResultPageGenerationStyleVO>(appApiPath(`/generation/style/popular`), params);
  }

/** 获取我的风格 */
  async getMyStyles(params?: QueryParams): Promise<PlusApiResultPageGenerationStyleVO> {
    return this.client.get<PlusApiResultPageGenerationStyleVO>(appApiPath(`/generation/style/my`), params);
  }
}

export function createStyleApi(client: HttpClient): StyleApi {
  return new StyleApi(client);
}
