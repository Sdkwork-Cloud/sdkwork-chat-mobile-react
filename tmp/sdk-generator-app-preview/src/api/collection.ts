import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CollectionCreateForm, CollectionItemAddForm, CollectionItemPositionForm, CollectionUpdateForm, PlusApiResultCollectionDetailVO, PlusApiResultCollectionItemVO, PlusApiResultCollectionVO, PlusApiResultListCollectionItemVO, PlusApiResultListCollectionTreeVO, PlusApiResultListCollectionVO, PlusApiResultPageCollectionVO, PlusApiResultVoid } from '../types';


export class CollectionApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取合集详情 */
  async getCollection(collectionId: string | number): Promise<PlusApiResultCollectionDetailVO> {
    return this.client.get<PlusApiResultCollectionDetailVO>(appApiPath(`/collection/${collectionId}`));
  }

/** 更新合集 */
  async updateCollection(collectionId: string | number, body: CollectionUpdateForm): Promise<PlusApiResultCollectionVO> {
    return this.client.put<PlusApiResultCollectionVO>(appApiPath(`/collection/${collectionId}`), body);
  }

/** 删除合集 */
  async deleteCollection(collectionId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/collection/${collectionId}`));
  }

/** 更新内容排序 */
  async updateItemPositions(collectionId: string | number, body: CollectionItemPositionForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/collection/${collectionId}/items/positions`), body);
  }

/** 创建合集 */
  async createCollection(body: CollectionCreateForm): Promise<PlusApiResultCollectionVO> {
    return this.client.post<PlusApiResultCollectionVO>(appApiPath(`/collection`), body);
  }

/** 获取合集内容列表 */
  async getCollectionItems(collectionId: string | number, params?: QueryParams): Promise<PlusApiResultListCollectionItemVO> {
    return this.client.get<PlusApiResultListCollectionItemVO>(appApiPath(`/collection/${collectionId}/items`), params);
  }

/** 添加内容到合集 */
  async addItem(collectionId: string | number, body: CollectionItemAddForm): Promise<PlusApiResultCollectionItemVO> {
    return this.client.post<PlusApiResultCollectionItemVO>(appApiPath(`/collection/${collectionId}/items`), body);
  }

/** 置顶内容 */
  async pinItem(collectionId: string | number, itemId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/collection/${collectionId}/items/${itemId}/pin`));
  }

/** 取消置顶 */
  async unpinItem(collectionId: string | number, itemId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/collection/${collectionId}/items/${itemId}/pin`));
  }

/** 获取合集路径 */
  async getCollectionPath(collectionId: string | number): Promise<PlusApiResultListCollectionVO> {
    return this.client.get<PlusApiResultListCollectionVO>(appApiPath(`/collection/${collectionId}/path`));
  }

/** 获取合集树 */
  async getCollectionTree(params?: QueryParams): Promise<PlusApiResultListCollectionTreeVO> {
    return this.client.get<PlusApiResultListCollectionTreeVO>(appApiPath(`/collection/tree`), params);
  }

/** 搜索合集 */
  async searchCollections(params?: QueryParams): Promise<PlusApiResultPageCollectionVO> {
    return this.client.get<PlusApiResultPageCollectionVO>(appApiPath(`/collection/search`), params);
  }

/** 获取我的合集 */
  async getMyCollections(params?: QueryParams): Promise<PlusApiResultPageCollectionVO> {
    return this.client.get<PlusApiResultPageCollectionVO>(appApiPath(`/collection/my`), params);
  }

/** 从合集移除内容 */
  async removeItem(collectionId: string | number, contentId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/collection/${collectionId}/items/${contentId}`));
  }
}

export function createCollectionApi(client: HttpClient): CollectionApi {
  return new CollectionApi(client);
}
