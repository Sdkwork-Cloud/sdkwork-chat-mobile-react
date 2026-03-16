import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultBoolean, PlusApiResultListSkuVO, PlusApiResultPageSkuVO, PlusApiResultSkuDetailVO, PlusApiResultSkuStatisticsVO, PlusApiResultSkuStockVO, PlusApiResultSkuVO } from '../types';


export class SkuApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取SKU详情 */
  async getSkuDetail(skuId: string | number): Promise<PlusApiResultSkuDetailVO> {
    return this.client.get<PlusApiResultSkuDetailVO>(appApiPath(`/skus/${skuId}`));
  }

/** 获取SKU库存 */
  async getSkuStock(skuId: string | number): Promise<PlusApiResultSkuStockVO> {
    return this.client.get<PlusApiResultSkuStockVO>(appApiPath(`/skus/${skuId}/stock`));
  }

/** 检查SKU库存 */
  async checkSkuStock(skuId: string | number, params?: QueryParams): Promise<PlusApiResultBoolean> {
    return this.client.get<PlusApiResultBoolean>(appApiPath(`/skus/${skuId}/check-stock`), params);
  }

/** 获取产品的SKU列表 */
  async getSkuByProduct(productId: string | number, params?: QueryParams): Promise<PlusApiResultPageSkuVO> {
    return this.client.get<PlusApiResultPageSkuVO>(appApiPath(`/skus/product/${productId}`), params);
  }

/** 获取产品SKU统计 */
  async getSkuStatistics(productId: string | number): Promise<PlusApiResultSkuStatisticsVO> {
    return this.client.get<PlusApiResultSkuStatisticsVO>(appApiPath(`/skus/product/${productId}/statistics`));
  }

/** 检查SKU编码是否存在 */
  async checkSkuCodeExists(params?: QueryParams): Promise<PlusApiResultBoolean> {
    return this.client.get<PlusApiResultBoolean>(appApiPath(`/skus/exists`), params);
  }

/** 按编码获取SKU */
  async getSkuByCode(skuCode: string | number): Promise<PlusApiResultSkuVO> {
    return this.client.get<PlusApiResultSkuVO>(appApiPath(`/skus/code/${skuCode}`));
  }

/** 批量获取SKU */
  async batchGetSkus(params?: QueryParams): Promise<PlusApiResultListSkuVO> {
    return this.client.get<PlusApiResultListSkuVO>(appApiPath(`/skus/batch`), params);
  }
}

export function createSkuApi(client: HttpClient): SkuApi {
  return new SkuApi(client);
}
