import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { GetModelPricesRequest, PlusApiResultListModelPriceVO, PlusApiResultListModelTypeVO, PlusApiResultListString, PlusApiResultModelInfoDetailVO, PlusApiResultModelPriceVO, PlusApiResultModelStatisticsVO, PlusApiResultPageModelInfoVO } from '../types';


export class ModelApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Batch get model prices */
  async getModelPrices(body: GetModelPricesRequest): Promise<PlusApiResultListModelPriceVO> {
    return this.client.post<PlusApiResultListModelPriceVO>(appApiPath(`/models/prices/batch`), body);
  }

/** Get model detail */
  async getModelById(modelId: string | number): Promise<PlusApiResultModelInfoDetailVO> {
    return this.client.get<PlusApiResultModelInfoDetailVO>(appApiPath(`/models/${modelId}`));
  }

/** Get model types */
  async getModelTypes(): Promise<PlusApiResultListModelTypeVO> {
    return this.client.get<PlusApiResultListModelTypeVO>(appApiPath(`/models/types`));
  }

/** Get models by type */
  async getModelsByType(modelType: string | number, params?: QueryParams): Promise<PlusApiResultPageModelInfoVO> {
    return this.client.get<PlusApiResultPageModelInfoVO>(appApiPath(`/models/type/${modelType}`), params);
  }

/** Get model statistics */
  async getModelStatistics(): Promise<PlusApiResultModelStatisticsVO> {
    return this.client.get<PlusApiResultModelStatisticsVO>(appApiPath(`/models/statistics`));
  }

/** Search models */
  async searchModels(params?: QueryParams): Promise<PlusApiResultPageModelInfoVO> {
    return this.client.get<PlusApiResultPageModelInfoVO>(appApiPath(`/models/search`), params);
  }

/** Get model default price */
  async getModelPrice(model: string | number): Promise<PlusApiResultModelPriceVO> {
    return this.client.get<PlusApiResultModelPriceVO>(appApiPath(`/models/price/${model}`));
  }

/** Get model pricing rules */
  async getModelPriceRules(model: string | number, params?: QueryParams): Promise<PlusApiResultListModelPriceVO> {
    return this.client.get<PlusApiResultListModelPriceVO>(appApiPath(`/models/price-rules/${model}`), params);
  }

/** Get popular models */
  async getPopularModels(params?: QueryParams): Promise<PlusApiResultPageModelInfoVO> {
    return this.client.get<PlusApiResultPageModelInfoVO>(appApiPath(`/models/popular`), params);
  }

/** Get models by family */
  async getModelsByFamily(family: string | number, params?: QueryParams): Promise<PlusApiResultPageModelInfoVO> {
    return this.client.get<PlusApiResultPageModelInfoVO>(appApiPath(`/models/family/${family}`), params);
  }

/** Get all families */
  async getAllFamilies(): Promise<PlusApiResultListString> {
    return this.client.get<PlusApiResultListString>(appApiPath(`/models/families`));
  }

/** Get models by channel */
  async getModelsByChannel(channel: string | number, params?: QueryParams): Promise<PlusApiResultPageModelInfoVO> {
    return this.client.get<PlusApiResultPageModelInfoVO>(appApiPath(`/models/channel/${channel}`), params);
  }

/** Get model detail by alias */
  async getModelBy(model: string | number): Promise<PlusApiResultModelInfoDetailVO> {
    return this.client.get<PlusApiResultModelInfoDetailVO>(appApiPath(`/models/by-model/${model}`));
  }

/** Get active models */
  async getActiveModels(params?: QueryParams): Promise<PlusApiResultPageModelInfoVO> {
    return this.client.get<PlusApiResultPageModelInfoVO>(appApiPath(`/models/active`), params);
  }
}

export function createModelApi(client: HttpClient): ModelApi {
  return new ModelApi(client);
}
