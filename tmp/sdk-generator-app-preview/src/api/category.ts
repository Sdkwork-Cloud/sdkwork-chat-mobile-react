import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CategoryCreateForm, CategoryMoveForm, CategorySortForm, CategoryUpdateForm, PlusApiResultCategoryDetailVO, PlusApiResultCategoryVO, PlusApiResultListCategoryTreeVO, PlusApiResultListCategoryTypeVO, PlusApiResultListCategoryVO, PlusApiResultListTagVO, PlusApiResultTagVO, PlusApiResultVoid, TagCreateForm } from '../types';


export class CategoryApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取分类详情 */
  async getCategoryDetail(categoryId: string | number): Promise<PlusApiResultCategoryDetailVO> {
    return this.client.get<PlusApiResultCategoryDetailVO>(appApiPath(`/category/${categoryId}`));
  }

/** 更新分类 */
  async updateCategory(categoryId: string | number, body: CategoryUpdateForm): Promise<PlusApiResultCategoryVO> {
    return this.client.put<PlusApiResultCategoryVO>(appApiPath(`/category/${categoryId}`), body);
  }

/** 删除分类 */
  async deleteCategory(categoryId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/category/${categoryId}`));
  }

/** 更新分类状态 */
  async updateCategoryStatus(categoryId: string | number, params?: QueryParams): Promise<PlusApiResultCategoryVO> {
    return this.client.put<PlusApiResultCategoryVO>(appApiPath(`/category/${categoryId}/status`), undefined, params);
  }

/** 移动分类 */
  async move(categoryId: string | number, body: CategoryMoveForm): Promise<PlusApiResultCategoryVO> {
    return this.client.put<PlusApiResultCategoryVO>(appApiPath(`/category/${categoryId}/move`), body);
  }

/** 排序分类 */
  async sortCategories(body: CategorySortForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/category/sort`), body);
  }

/** 获取分类列表 */
  async listCategories(params?: QueryParams): Promise<PlusApiResultListCategoryVO> {
    return this.client.get<PlusApiResultListCategoryVO>(appApiPath(`/category`), params);
  }

/** 创建分类 */
  async createCategory(body: CategoryCreateForm): Promise<PlusApiResultCategoryVO> {
    return this.client.post<PlusApiResultCategoryVO>(appApiPath(`/category`), body);
  }

/** 获取标签列表 */
  async listTags(params?: QueryParams): Promise<PlusApiResultListTagVO> {
    return this.client.get<PlusApiResultListTagVO>(appApiPath(`/category/tags`), params);
  }

/** 创建标签 */
  async createTag(body: TagCreateForm): Promise<PlusApiResultTagVO> {
    return this.client.post<PlusApiResultTagVO>(appApiPath(`/category/tags`), body);
  }

/** 获取分类路径 */
  async getCategoryPath(categoryId: string | number): Promise<PlusApiResultListCategoryVO> {
    return this.client.get<PlusApiResultListCategoryVO>(appApiPath(`/category/${categoryId}/path`));
  }

/** 获取子分类 */
  async getChildren(categoryId: string | number): Promise<PlusApiResultListCategoryVO> {
    return this.client.get<PlusApiResultListCategoryVO>(appApiPath(`/category/${categoryId}/children`));
  }

/** 获取分类类型 */
  async getCategoryTypes(): Promise<PlusApiResultListCategoryTypeVO> {
    return this.client.get<PlusApiResultListCategoryTypeVO>(appApiPath(`/category/types`));
  }

/** 获取分类树 */
  async getCategoryTree(params?: QueryParams): Promise<PlusApiResultListCategoryTreeVO> {
    return this.client.get<PlusApiResultListCategoryTreeVO>(appApiPath(`/category/tree`), params);
  }

/** 删除标签 */
  async deleteTag(tagId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/category/tags/${tagId}`));
  }
}

export function createCategoryApi(client: HttpClient): CategoryApi {
  return new CategoryApi(client);
}
