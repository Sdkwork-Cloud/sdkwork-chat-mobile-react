import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { BatchEventTrackForm, ErrorTrackForm, EventTrackForm, PageViewTrackForm, PlusApiResultAiUsageStatsVO, PlusApiResultChannelAnalysisVO, PlusApiResultConversionPathVO, PlusApiResultDeviceDistributionVO, PlusApiResultEventStatsVO, PlusApiResultEventTrendVO, PlusApiResultExportResultVO, PlusApiResultFunnelAnalysisVO, PlusApiResultListRealtimeEventVO, PlusApiResultListReportTypeVO, PlusApiResultListTopEventVO, PlusApiResultPathAnalysisVO, PlusApiResultRealtimeOnlineVO, PlusApiResultRetentionAnalysisVO, PlusApiResultUserActivityVO, PlusApiResultUserUsageStatsVO, PlusApiResultVoid, StatsExportForm } from '../types';


export class AnalyticsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 上报页面访问 */
  async trackPageView(body: PageViewTrackForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/analytics/pageview`), body);
  }

/** 导出统计 */
  async exportStats(body: StatsExportForm): Promise<PlusApiResultExportResultVO> {
    return this.client.post<PlusApiResultExportResultVO>(appApiPath(`/analytics/export`), body);
  }

/** 上报事件 */
  async trackEvent(body: EventTrackForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/analytics/events`), body);
  }

/** 批量上报事件 */
  async batchTrackEvents(body: BatchEventTrackForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/analytics/events/batch`), body);
  }

/** 上报错误 */
  async trackError(body: ErrorTrackForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/analytics/errors`), body);
  }

/** 使用统计 */
  async getUserUsageStats(): Promise<PlusApiResultUserUsageStatsVO> {
    return this.client.get<PlusApiResultUserUsageStatsVO>(appApiPath(`/analytics/usage`));
  }

/** 留存分析 */
  async getRetentionAnalysis(params?: QueryParams): Promise<PlusApiResultRetentionAnalysisVO> {
    return this.client.get<PlusApiResultRetentionAnalysisVO>(appApiPath(`/analytics/retention`), params);
  }

/** 报表列表 */
  async listReportTypes(): Promise<PlusApiResultListReportTypeVO> {
    return this.client.get<PlusApiResultListReportTypeVO>(appApiPath(`/analytics/reports`));
  }

/** 实时在线 */
  async getRealtimeOnline(): Promise<PlusApiResultRealtimeOnlineVO> {
    return this.client.get<PlusApiResultRealtimeOnlineVO>(appApiPath(`/analytics/realtime/online`));
  }

/** 实时事件 */
  async getRealtimeEvents(params?: QueryParams): Promise<PlusApiResultListRealtimeEventVO> {
    return this.client.get<PlusApiResultListRealtimeEventVO>(appApiPath(`/analytics/realtime/events`), params);
  }

/** 路径分析 */
  async getPathAnalysis(params?: QueryParams): Promise<PlusApiResultPathAnalysisVO> {
    return this.client.get<PlusApiResultPathAnalysisVO>(appApiPath(`/analytics/path`), params);
  }

/** 漏斗分析 */
  async getFunnelAnalysis(params?: QueryParams): Promise<PlusApiResultFunnelAnalysisVO> {
    return this.client.get<PlusApiResultFunnelAnalysisVO>(appApiPath(`/analytics/funnel`), params);
  }

/** 事件趋势 */
  async getEventTrend(params?: QueryParams): Promise<PlusApiResultEventTrendVO> {
    return this.client.get<PlusApiResultEventTrendVO>(appApiPath(`/analytics/events/trend`), params);
  }

/** 热门事件 */
  async getTopEvents(params?: QueryParams): Promise<PlusApiResultListTopEventVO> {
    return this.client.get<PlusApiResultListTopEventVO>(appApiPath(`/analytics/events/top`), params);
  }

/** 事件统计 */
  async getEventStats(params?: QueryParams): Promise<PlusApiResultEventStatsVO> {
    return this.client.get<PlusApiResultEventStatsVO>(appApiPath(`/analytics/events/stats`), params);
  }

/** 设备分布 */
  async getDeviceDistribution(): Promise<PlusApiResultDeviceDistributionVO> {
    return this.client.get<PlusApiResultDeviceDistributionVO>(appApiPath(`/analytics/devices`));
  }

/** 转化路径 */
  async getConversionPath(params?: QueryParams): Promise<PlusApiResultConversionPathVO> {
    return this.client.get<PlusApiResultConversionPathVO>(appApiPath(`/analytics/conversion-path`), params);
  }

/** 渠道分析 */
  async getChannelAnalysis(params?: QueryParams): Promise<PlusApiResultChannelAnalysisVO> {
    return this.client.get<PlusApiResultChannelAnalysisVO>(appApiPath(`/analytics/channels`), params);
  }

/** AI使用统计 */
  async getAiUsageStats(params?: QueryParams): Promise<PlusApiResultAiUsageStatsVO> {
    return this.client.get<PlusApiResultAiUsageStatsVO>(appApiPath(`/analytics/ai-usage`), params);
  }

/** 活跃度统计 */
  async getUserActivity(params?: QueryParams): Promise<PlusApiResultUserActivityVO> {
    return this.client.get<PlusApiResultUserActivityVO>(appApiPath(`/analytics/activity`), params);
  }
}

export function createAnalyticsApi(client: HttpClient): AnalyticsApi {
  return new AnalyticsApi(client);
}
