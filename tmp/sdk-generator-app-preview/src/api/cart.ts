import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { AddCartItemForm, BatchSelectForm, PlusApiResultBoolean, PlusApiResultCartItemVO, PlusApiResultCartStatisticsVO, PlusApiResultListCartItemVO, PlusApiResultShoppingCartVO, PlusApiResultVoid, UpdateCartItemForm } from '../types';


export class CartApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 更新购物车商品数量 */
  async updateItemQuantity(itemId: string | number, body: UpdateCartItemForm): Promise<PlusApiResultCartItemVO> {
    return this.client.put<PlusApiResultCartItemVO>(appApiPath(`/cart/items/${itemId}`), body);
  }

/** 删除购物车商品 */
  async removeItem(itemId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/cart/items/${itemId}`));
  }

/** 更新商品选中状态 */
  async updateItemSelection(itemId: string | number, params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/cart/items/${itemId}/select`), undefined, params);
  }

/** 批量更新选中状态 */
  async batchUpdateSelection(body: BatchSelectForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/cart/items/select`), body);
  }

/** 获取购物车商品列表 */
  async getCartItems(): Promise<PlusApiResultListCartItemVO> {
    return this.client.get<PlusApiResultListCartItemVO>(appApiPath(`/cart/items`));
  }

/** 添加商品到购物车 */
  async addItem(body: AddCartItemForm): Promise<PlusApiResultCartItemVO> {
    return this.client.post<PlusApiResultCartItemVO>(appApiPath(`/cart/items`), body);
  }

/** 批量删除购物车商品 */
  async removeItems(params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/cart/items`), params);
  }

/** 获取当前用户购物车 */
  async getMy(): Promise<PlusApiResultShoppingCartVO> {
    return this.client.get<PlusApiResultShoppingCartVO>(appApiPath(`/cart`));
  }

/** 清空购物车 */
  async clear(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/cart`));
  }

/** 获取购物车统计 */
  async getCartStatistics(): Promise<PlusApiResultCartStatisticsVO> {
    return this.client.get<PlusApiResultCartStatisticsVO>(appApiPath(`/cart/statistics`));
  }

/** 获取选中的商品列表 */
  async getSelectedItems(): Promise<PlusApiResultListCartItemVO> {
    return this.client.get<PlusApiResultListCartItemVO>(appApiPath(`/cart/items/selected`));
  }

/** 检查商品是否在购物车中 */
  async checkItemIn(params?: QueryParams): Promise<PlusApiResultBoolean> {
    return this.client.get<PlusApiResultBoolean>(appApiPath(`/cart/check`), params);
  }
}

export function createCartApi(client: HttpClient): CartApi {
  return new CartApi(client);
}
