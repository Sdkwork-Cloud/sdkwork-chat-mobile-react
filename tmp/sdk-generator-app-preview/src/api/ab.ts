import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { BatchAssignmentForm, BatchFeatureCheckForm, ExperimentConversionForm, ExperimentEventForm, ExperimentExposureForm, ExperimentFeedbackForm, PlusApiResultAlgorithmConfigVO, PlusApiResultExperimentAssignmentVO, PlusApiResultExperimentDetailVO, PlusApiResultExperimentReportVO, PlusApiResultExperimentResultsVO, PlusApiResultFeatureFlagVO, PlusApiResultListExperimentVO, PlusApiResultListFeatureFlagVO, PlusApiResultListRolloutConfigVO, PlusApiResultMapStringExperimentAssignmentVO, PlusApiResultMapStringFeatureFlagVO, PlusApiResultMapStringObject, PlusApiResultRolloutCheckVO, PlusApiResultUiConfigVO, PlusApiResultVoid } from '../types';


export class AbApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 实验反馈 */
  async submitExperimentFeedback(experimentId: string | number, body: ExperimentFeedbackForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/abtest/${experimentId}/feedback`), body);
  }

/** 退出实验 */
  async exitExperiment(experimentId: string | number, params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/abtest/${experimentId}/exit`), undefined, params);
  }

/** 所有特性开关 */
  async listFeatureFlags(): Promise<PlusApiResultListFeatureFlagVO> {
    return this.client.get<PlusApiResultListFeatureFlagVO>(appApiPath(`/abtest/features`));
  }

/** 批量特性开关 */
  async batchCheckFeatures(body: BatchFeatureCheckForm): Promise<PlusApiResultMapStringFeatureFlagVO> {
    return this.client.post<PlusApiResultMapStringFeatureFlagVO>(appApiPath(`/abtest/features`), body);
  }

/** 上报实验曝光 */
  async trackExperimentExposure(body: ExperimentExposureForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/abtest/exposure`), body);
  }

/** 上报实验事件 */
  async trackExperimentEvent(body: ExperimentEventForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/abtest/events`), body);
  }

/** 上报实验转化 */
  async trackExperimentConversion(body: ExperimentConversionForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/abtest/conversion`), body);
  }

/** 批量获取分组 */
  async batchGetAssignments(body: BatchAssignmentForm): Promise<PlusApiResultMapStringExperimentAssignmentVO> {
    return this.client.post<PlusApiResultMapStringExperimentAssignmentVO>(appApiPath(`/abtest/assignments`), body);
  }

/** 实验结果 */
  async getExperimentResults(experimentId: string | number): Promise<PlusApiResultExperimentResultsVO> {
    return this.client.get<PlusApiResultExperimentResultsVO>(appApiPath(`/abtest/${experimentId}/results`));
  }

/** 实验报告 */
  async getExperimentReport(experimentId: string | number): Promise<PlusApiResultExperimentReportVO> {
    return this.client.get<PlusApiResultExperimentReportVO>(appApiPath(`/abtest/${experimentId}/report`));
  }

/** UI配置 */
  async getUiConfig(): Promise<PlusApiResultUiConfigVO> {
    return this.client.get<PlusApiResultUiConfigVO>(appApiPath(`/abtest/ui-config`));
  }

/** 灰度配置 */
  async listRolloutConfigs(): Promise<PlusApiResultListRolloutConfigVO> {
    return this.client.get<PlusApiResultListRolloutConfigVO>(appApiPath(`/abtest/rollouts`));
  }

/** 灰度发布 */
  async checkRollout(rolloutKey: string | number): Promise<PlusApiResultRolloutCheckVO> {
    return this.client.get<PlusApiResultRolloutCheckVO>(appApiPath(`/abtest/rollout/${rolloutKey}`));
  }

/** 特性开关 */
  async checkFeatureFlag(featureKey: string | number): Promise<PlusApiResultFeatureFlagVO> {
    return this.client.get<PlusApiResultFeatureFlagVO>(appApiPath(`/abtest/features/${featureKey}`));
  }

/** 可用实验 */
  async listAvailableExperiments(): Promise<PlusApiResultListExperimentVO> {
    return this.client.get<PlusApiResultListExperimentVO>(appApiPath(`/abtest/experiments`));
  }

/** 实验详情 */
  async getExperimentDetail(experimentId: string | number): Promise<PlusApiResultExperimentDetailVO> {
    return this.client.get<PlusApiResultExperimentDetailVO>(appApiPath(`/abtest/experiments/${experimentId}`));
  }

/** 个性化配置 */
  async getPersonalizedConfig(): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/abtest/config`));
  }

/** 获取实验分组 */
  async getExperimentAssignment(params?: QueryParams): Promise<PlusApiResultExperimentAssignmentVO> {
    return this.client.get<PlusApiResultExperimentAssignmentVO>(appApiPath(`/abtest/assignment`), params);
  }

/** 算法配置 */
  async getAlgorithmConfig(): Promise<PlusApiResultAlgorithmConfigVO> {
    return this.client.get<PlusApiResultAlgorithmConfigVO>(appApiPath(`/abtest/algorithm-config`));
  }
}

export function createAbApi(client: HttpClient): AbApi {
  return new AbApi(client);
}
