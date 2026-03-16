import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultListShopVO, PlusApiResultPageShopVO, PlusApiResultShopDetailVO, PlusApiResultShopStatisticsVO, PlusApiResultShopVO, PlusApiResultVoid, ShopCreateForm, ShopUpdateForm } from '../types';


export class ShopsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取店铺详情 */
  async getShopDetail(shopId: string | number): Promise<PlusApiResultShopDetailVO> {
    return this.client.get<PlusApiResultShopDetailVO>(appApiPath(`/shops/${shopId}`));
  }

/** 更新店铺 */
  async updateShop(shopId: string | number, body: ShopUpdateForm): Promise<PlusApiResultShopVO> {
    return this.client.put<PlusApiResultShopVO>(appApiPath(`/shops/${shopId}`), body);
  }

/** 删除店铺 */
  async deleteShop(shopId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/shops/${shopId}`));
  }

/** 更新店铺状态 */
  async updateStatus(shopId: string | number, params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/shops/${shopId}/status`), undefined, params);
  }

/** 开店营业 */
  async openShop(shopId: string | number): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/shops/${shopId}/open`));
  }

/** 关店休息 */
  async closeShop(shopId: string | number): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/shops/${shopId}/close`));
  }

/** 获取店铺列表 */
  async listShops(params?: QueryParams): Promise<PlusApiResultPageShopVO> {
    return this.client.get<PlusApiResultPageShopVO>(appApiPath(`/shops`), params);
  }

/** 创建店铺 */
  async createShop(body: ShopCreateForm): Promise<PlusApiResultShopVO> {
    return this.client.post<PlusApiResultShopVO>(appApiPath(`/shops`), body);
  }

/** 获取店铺统计 */
  async getStatistics(): Promise<PlusApiResultShopStatisticsVO> {
    return this.client.get<PlusApiResultShopStatisticsVO>(appApiPath(`/shops/statistics`));
  }

/** 获取所有激活店铺 */
  async listAllActive(): Promise<PlusApiResultListShopVO> {
    return this.client.get<PlusApiResultListShopVO>(appApiPath(`/shops/all`));
  }
}

export function createShopsApi(client: HttpClient): ShopsApi {
  return new ShopsApi(client);
}
