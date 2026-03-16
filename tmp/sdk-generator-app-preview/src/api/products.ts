import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultBoolean, PlusApiResultInteger, PlusApiResultListProductAttributeVO, PlusApiResultListProductCategoryVO, PlusApiResultListProductVO, PlusApiResultListSkuVO, PlusApiResultPageProductVO, PlusApiResultProductAttributeVO, PlusApiResultProductCategoryVO, PlusApiResultProductDetailVO, PlusApiResultProductManageVO, PlusApiResultProductStatisticsVO, PlusApiResultProductStockAdjustVO, PlusApiResultProductStockLogPageVO, PlusApiResultProductVO, PlusApiResultVoid, ProductAttributeCreateRequest, ProductAttributeUpdateRequest, ProductCategoryCreateRequest, ProductCategoryUpdateRequest, ProductCreateForm, ProductStatusUpdateForm, ProductStockAdjustForm, ProductUpdateForm } from '../types';


export class ProductsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 更新商品属性 */
  async updateProductAttribute(productId: string | number, attributeId: string | number, body: ProductAttributeUpdateRequest): Promise<PlusApiResultProductAttributeVO> {
    return this.client.put<PlusApiResultProductAttributeVO>(appApiPath(`/products/${productId}/attributes/${attributeId}`), body);
  }

/** 删除商品属性 */
  async deleteProductAttribute(productId: string | number, attributeId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/products/${productId}/attributes/${attributeId}`));
  }

/** 更新商品分类 */
  async updateProductCategory(categoryId: string | number, body: ProductCategoryUpdateRequest): Promise<PlusApiResultProductCategoryVO> {
    return this.client.put<PlusApiResultProductCategoryVO>(appApiPath(`/products/categories/${categoryId}`), body);
  }

/** 删除商品分类 */
  async deleteProductCategory(categoryId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/products/categories/${categoryId}`));
  }

/** 获取商品属性 */
  async listProductAttributes(productId: string | number): Promise<PlusApiResultListProductAttributeVO> {
    return this.client.get<PlusApiResultListProductAttributeVO>(appApiPath(`/products/${productId}/attributes`));
  }

/** 创建商品属性 */
  async createProductAttribute(productId: string | number, body: ProductAttributeCreateRequest): Promise<PlusApiResultProductAttributeVO> {
    return this.client.post<PlusApiResultProductAttributeVO>(appApiPath(`/products/${productId}/attributes`), body);
  }

/** 获取商品分类列表 */
  async listProductCategories(params?: QueryParams): Promise<PlusApiResultListProductCategoryVO> {
    return this.client.get<PlusApiResultListProductCategoryVO>(appApiPath(`/products/categories`), params);
  }

/** 创建商品分类 */
  async createProductCategory(body: ProductCategoryCreateRequest): Promise<PlusApiResultProductCategoryVO> {
    return this.client.post<PlusApiResultProductCategoryVO>(appApiPath(`/products/categories`), body);
  }

/** 获取商品列表 */
  async getProducts(params?: QueryParams): Promise<PlusApiResultPageProductVO> {
    return this.client.get<PlusApiResultPageProductVO>(appApiPath(`/products`), params);
  }

/** Create product */
  async createProduct(body: ProductCreateForm): Promise<PlusApiResultProductManageVO> {
    return this.client.post<PlusApiResultProductManageVO>(appApiPath(`/products`), body);
  }

/** 获取商品详情 */
  async getProductDetail(productId: string | number): Promise<PlusApiResultProductDetailVO> {
    return this.client.get<PlusApiResultProductDetailVO>(appApiPath(`/products/${productId}`));
  }

/** Update product */
  async updateProduct(productId: string | number, body: ProductUpdateForm): Promise<PlusApiResultProductManageVO> {
    return this.client.put<PlusApiResultProductManageVO>(appApiPath(`/products/${productId}`), body);
  }

/** 获取商品库存 */
  async getProductStock(productId: string | number): Promise<PlusApiResultInteger> {
    return this.client.get<PlusApiResultInteger>(appApiPath(`/products/${productId}/stock`));
  }

/** 获取商品统计 */
  async getProductStatistics(productId: string | number): Promise<PlusApiResultProductStatisticsVO> {
    return this.client.get<PlusApiResultProductStatisticsVO>(appApiPath(`/products/${productId}/statistics`));
  }

/** 获取SPU详情 */
  async getSpuDetail(productId: string | number): Promise<PlusApiResultProductDetailVO> {
    return this.client.get<PlusApiResultProductDetailVO>(appApiPath(`/products/${productId}/spu`));
  }

/** 获取商品SKU列表 */
  async getProductSkus(productId: string | number, params?: QueryParams): Promise<PlusApiResultListSkuVO> {
    return this.client.get<PlusApiResultListSkuVO>(appApiPath(`/products/${productId}/skus`), params);
  }

/** 检查商品库存 */
  async checkProductStock(productId: string | number, params?: QueryParams): Promise<PlusApiResultBoolean> {
    return this.client.get<PlusApiResultBoolean>(appApiPath(`/products/${productId}/check-stock`), params);
  }

/** 搜索商品 */
  async search(params?: QueryParams): Promise<PlusApiResultPageProductVO> {
    return this.client.get<PlusApiResultPageProductVO>(appApiPath(`/products/search`), params);
  }

/** 获取最新商品 */
  async getLatest(params?: QueryParams): Promise<PlusApiResultListProductVO> {
    return this.client.get<PlusApiResultListProductVO>(appApiPath(`/products/latest`), params);
  }

/** 获取热门商品 */
  async getHot(params?: QueryParams): Promise<PlusApiResultListProductVO> {
    return this.client.get<PlusApiResultListProductVO>(appApiPath(`/products/hot`), params);
  }

/** 按编码获取商品 */
  async getProductByCode(code: string | number): Promise<PlusApiResultProductVO> {
    return this.client.get<PlusApiResultProductVO>(appApiPath(`/products/code/${code}`));
  }

/** 按分类获取商品 */
  async getProductsByCategory(categoryId: string | number, params?: QueryParams): Promise<PlusApiResultPageProductVO> {
    return this.client.get<PlusApiResultPageProductVO>(appApiPath(`/products/category/${categoryId}`), params);
  }

/** 获取分类属性 */
  async listCategoryAttributes(categoryId: string | number): Promise<PlusApiResultListProductAttributeVO> {
    return this.client.get<PlusApiResultListProductAttributeVO>(appApiPath(`/products/categories/${categoryId}/attributes`));
  }

/** 获取商品分类树 */
  async getProductCategoryTree(): Promise<PlusApiResultListProductCategoryVO> {
    return this.client.get<PlusApiResultListProductCategoryVO>(appApiPath(`/products/categories/tree`));
  }

/** Update product status */
  async updateProductStatus(productId: string | number, body: ProductStatusUpdateForm): Promise<PlusApiResultProductManageVO> {
    return this.client.put<PlusApiResultProductManageVO>(appApiPath(`/products/${productId}/status`), body);
  }

/** Adjust product stock */
  async adjustStock(productId: string | number, body: ProductStockAdjustForm): Promise<PlusApiResultProductStockAdjustVO> {
    return this.client.post<PlusApiResultProductStockAdjustVO>(appApiPath(`/products/${productId}/stock/adjust`), body);
  }

/** List product stock logs */
  async listStockLogs(productId: string | number, params?: QueryParams): Promise<PlusApiResultProductStockLogPageVO> {
    return this.client.get<PlusApiResultProductStockLogPageVO>(appApiPath(`/products/${productId}/stock/logs`), params);
  }
}

export function createProductsApi(client: HttpClient): ProductsApi {
  return new ProductsApi(client);
}
