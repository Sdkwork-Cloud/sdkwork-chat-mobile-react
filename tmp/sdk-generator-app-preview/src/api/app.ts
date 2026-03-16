import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { AppCreateForm, AppUpdateForm, PlusApiResultAccountSummaryVO, PlusApiResultAppDetailVO, PlusApiResultAppPublishReadinessVO, PlusApiResultAppStatisticsVO, PlusApiResultAppVO, PlusApiResultPageAppVO, PlusApiResultVoid } from '../types';


export class AppApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取应用详情 */
  async getApp(appId: string | number): Promise<PlusApiResultAppDetailVO> {
    return this.client.get<PlusApiResultAppDetailVO>(appApiPath(`/app/manage/${appId}`));
  }

/** 更新应用 */
  async updateApp(appId: string | number, body: AppUpdateForm): Promise<PlusApiResultAppVO> {
    return this.client.put<PlusApiResultAppVO>(appApiPath(`/app/manage/${appId}`), body);
  }

/** 删除应用 */
  async deleteApp(appId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/app/manage/${appId}`));
  }

/** 创建应用 */
  async createApp(body: AppCreateForm): Promise<PlusApiResultAppVO> {
    return this.client.post<PlusApiResultAppVO>(appApiPath(`/app/manage`), body);
  }

/** 停用应用 */
  async deactivate(appId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/app/manage/${appId}/deactivate`));
  }

/** 激活应用 */
  async activate(appId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/app/manage/${appId}/activate`));
  }

/** 检查发布就绪状态 */
  async checkPublishReadiness(appId: string | number): Promise<PlusApiResultAppPublishReadinessVO> {
    return this.client.get<PlusApiResultAppPublishReadinessVO>(appApiPath(`/app/manage/${appId}/publish/readiness`));
  }

/** 获取应用统计 */
  async getAppStatistics(): Promise<PlusApiResultAppStatisticsVO> {
    return this.client.get<PlusApiResultAppStatisticsVO>(appApiPath(`/app/manage/statistics`));
  }

/** 搜索应用 */
  async searchApps(params?: QueryParams): Promise<PlusApiResultPageAppVO> {
    return this.client.get<PlusApiResultPageAppVO>(appApiPath(`/app/manage/search`), params);
  }

/** 获取项目应用 */
  async getProjectApps(projectId: string | number, params?: QueryParams): Promise<PlusApiResultPageAppVO> {
    return this.client.get<PlusApiResultPageAppVO>(appApiPath(`/app/manage/project/${projectId}`), params);
  }

/** 获取我的应用 */
  async getMyApps(params?: QueryParams): Promise<PlusApiResultPageAppVO> {
    return this.client.get<PlusApiResultPageAppVO>(appApiPath(`/app/manage/my`), params);
  }

/** 获取账户余额汇总 */
  async getAccountSummary(): Promise<PlusApiResultAccountSummaryVO> {
    return this.client.get<PlusApiResultAccountSummaryVO>(appApiPath(`/account/summary`));
  }
}

export function createAppApi(client: HttpClient): AppApi {
  return new AppApi(client);
}
