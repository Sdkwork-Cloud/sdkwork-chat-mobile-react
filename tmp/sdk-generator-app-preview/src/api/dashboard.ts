import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultAchievementRewardVO, PlusApiResultChartDataVO, PlusApiResultGenerationStatisticsVO, PlusApiResultHomeDashboardVO, PlusApiResultListAchievementVO, PlusApiResultListRecentActivityVO, PlusApiResultListRecommendationVO, PlusApiResultListShortcutVO, PlusApiResultListTodoItemVO, PlusApiResultListTrendingItemVO, PlusApiResultMapStringObject, PlusApiResultStorageStatisticsVO, PlusApiResultUsageStatisticsVO, PlusApiResultUserLevelVO, PlusApiResultUserStatisticsVO, PlusApiResultVipStatisticsVO, PlusApiResultVoid, ShortcutsUpdateForm } from '../types';


export class DashboardApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 完成待办 */
  async completeTodoItem(todoId: string | number): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/dashboard/todos/${todoId}/complete`));
  }

/** 快捷入口 */
  async getShortcuts(): Promise<PlusApiResultListShortcutVO> {
    return this.client.get<PlusApiResultListShortcutVO>(appApiPath(`/dashboard/shortcuts`));
  }

/** 更新快捷入口 */
  async updateShortcuts(body: ShortcutsUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/dashboard/shortcuts`), body);
  }

/** 领取成就奖励 */
  async claimAchievementReward(achievementId: string | number): Promise<PlusApiResultAchievementRewardVO> {
    return this.client.post<PlusApiResultAchievementRewardVO>(appApiPath(`/dashboard/achievements/${achievementId}/claim`));
  }

/** 今日热点 */
  async getTrendingItems(params?: QueryParams): Promise<PlusApiResultListTrendingItemVO> {
    return this.client.get<PlusApiResultListTrendingItemVO>(appApiPath(`/dashboard/trending`), params);
  }

/** 待办事项 */
  async getTodoItems(): Promise<PlusApiResultListTodoItemVO> {
    return this.client.get<PlusApiResultListTodoItemVO>(appApiPath(`/dashboard/todos`));
  }

/** 用户统计 */
  async getUserStatistics(): Promise<PlusApiResultUserStatisticsVO> {
    return this.client.get<PlusApiResultUserStatisticsVO>(appApiPath(`/dashboard/statistics`));
  }

/** 会员统计 */
  async getVipStatistics(): Promise<PlusApiResultVipStatisticsVO> {
    return this.client.get<PlusApiResultVipStatisticsVO>(appApiPath(`/dashboard/statistics/vip`));
  }

/** 使用统计 */
  async getUsageStatistics(params?: QueryParams): Promise<PlusApiResultUsageStatisticsVO> {
    return this.client.get<PlusApiResultUsageStatisticsVO>(appApiPath(`/dashboard/statistics/usage`), params);
  }

/** 存储统计 */
  async getStorageStatistics(): Promise<PlusApiResultStorageStatisticsVO> {
    return this.client.get<PlusApiResultStorageStatisticsVO>(appApiPath(`/dashboard/statistics/storage`));
  }

/** 生成统计 */
  async getGenerationStatistics(params?: QueryParams): Promise<PlusApiResultGenerationStatisticsVO> {
    return this.client.get<PlusApiResultGenerationStatisticsVO>(appApiPath(`/dashboard/statistics/generations`), params);
  }

/** 推荐内容 */
  async getRecommendations(params?: QueryParams): Promise<PlusApiResultListRecommendationVO> {
    return this.client.get<PlusApiResultListRecommendationVO>(appApiPath(`/dashboard/recommendations`), params);
  }

/** 数据概览 */
  async getDataOverview(): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/dashboard/overview`));
  }

/** 用户等级 */
  async getUserLevel(): Promise<PlusApiResultUserLevelVO> {
    return this.client.get<PlusApiResultUserLevelVO>(appApiPath(`/dashboard/level`));
  }

/** 首页数据 */
  async getHome(): Promise<PlusApiResultHomeDashboardVO> {
    return this.client.get<PlusApiResultHomeDashboardVO>(appApiPath(`/dashboard/home`));
  }

/** 图表数据 */
  async getChartData(chartType: string | number, params?: QueryParams): Promise<PlusApiResultChartDataVO> {
    return this.client.get<PlusApiResultChartDataVO>(appApiPath(`/dashboard/charts/${chartType}`), params);
  }

/** 最近活动 */
  async getRecentActivities(params?: QueryParams): Promise<PlusApiResultListRecentActivityVO> {
    return this.client.get<PlusApiResultListRecentActivityVO>(appApiPath(`/dashboard/activities`), params);
  }

/** 成就列表 */
  async getAchievements(): Promise<PlusApiResultListAchievementVO> {
    return this.client.get<PlusApiResultListAchievementVO>(appApiPath(`/dashboard/achievements`));
  }
}

export function createDashboardApi(client: HttpClient): DashboardApi {
  return new DashboardApi(client);
}
