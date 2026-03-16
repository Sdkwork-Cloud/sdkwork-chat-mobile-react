import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { BrowseHistoryAddForm, PlusApiResultBrowseStatisticsVO, PlusApiResultHistoryStatisticsVO, PlusApiResultListGenerationHistoryVO, PlusApiResultListOperationHistoryVO, PlusApiResultListSessionInfoVO, PlusApiResultPageBrowseHistoryVO, PlusApiResultPageGenerationHistoryVO, PlusApiResultPageLoginHistoryVO, PlusApiResultPageOperationHistoryVO, PlusApiResultSessionInfoVO, PlusApiResultVoid } from '../types';


export class HistoryApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 浏览历史 */
  async listBrowse(params?: QueryParams): Promise<PlusApiResultPageBrowseHistoryVO> {
    return this.client.get<PlusApiResultPageBrowseHistoryVO>(appApiPath(`/history/browse`), params);
  }

/** 添加浏览记录 */
  async addBrowse(body: BrowseHistoryAddForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/history/browse`), body);
  }

/** 清空浏览历史 */
  async clearBrowse(params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/history/browse`), params);
  }

/** 历史统计 */
  async getHistoryStatistics(): Promise<PlusApiResultHistoryStatisticsVO> {
    return this.client.get<PlusApiResultHistoryStatisticsVO>(appApiPath(`/history/statistics`));
  }

/** 浏览统计 */
  async getBrowseStatistics(): Promise<PlusApiResultBrowseStatisticsVO> {
    return this.client.get<PlusApiResultBrowseStatisticsVO>(appApiPath(`/history/statistics/browse`));
  }

/** 所有会话 */
  async listSessions(): Promise<PlusApiResultListSessionInfoVO> {
    return this.client.get<PlusApiResultListSessionInfoVO>(appApiPath(`/history/sessions`));
  }

/** 当前会话 */
  async getCurrentSession(): Promise<PlusApiResultSessionInfoVO> {
    return this.client.get<PlusApiResultSessionInfoVO>(appApiPath(`/history/sessions/current`));
  }

/** 操作历史 */
  async listOperation(params?: QueryParams): Promise<PlusApiResultPageOperationHistoryVO> {
    return this.client.get<PlusApiResultPageOperationHistoryVO>(appApiPath(`/history/operations`), params);
  }

/** 最近操作 */
  async getRecentOperations(params?: QueryParams): Promise<PlusApiResultListOperationHistoryVO> {
    return this.client.get<PlusApiResultListOperationHistoryVO>(appApiPath(`/history/operations/recent`), params);
  }

/** 登录历史 */
  async listLogin(params?: QueryParams): Promise<PlusApiResultPageLoginHistoryVO> {
    return this.client.get<PlusApiResultPageLoginHistoryVO>(appApiPath(`/history/logins`), params);
  }

/** 生成历史 */
  async listGeneration(params?: QueryParams): Promise<PlusApiResultPageGenerationHistoryVO> {
    return this.client.get<PlusApiResultPageGenerationHistoryVO>(appApiPath(`/history/generations`), params);
  }

/** 清空生成历史 */
  async clearGeneration(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/history/generations`));
  }

/** 最近生成 */
  async getRecentGenerations(params?: QueryParams): Promise<PlusApiResultListGenerationHistoryVO> {
    return this.client.get<PlusApiResultListGenerationHistoryVO>(appApiPath(`/history/generations/recent`), params);
  }

/** 终止会话 */
  async terminateSession(sessionId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/history/sessions/${sessionId}`));
  }

/** 终止其他会话 */
  async terminateOtherSessions(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/history/sessions/others`));
  }

/** 删除生成历史 */
  async deleteGeneration(historyId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/history/generations/${historyId}`));
  }

/** 删除浏览记录 */
  async deleteBrowse(historyId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/history/browse/${historyId}`));
  }

/** 批量删除浏览记录 */
  async batchDeleteBrowse(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/history/browse/batch`));
  }
}

export function createHistoryApi(client: HttpClient): HistoryApi {
  return new HistoryApi(client);
}
