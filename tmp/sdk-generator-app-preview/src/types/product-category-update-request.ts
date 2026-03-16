export interface ProductCategoryUpdateRequest {
  /** 分类名称 */
  name?: string;
  /** 父分类ID */
  parentId?: string;
  /** 分类描述 */
  description?: string;
  /** 分类图标 */
  icon?: string;
  /** 排序 */
  sort?: number;
  /** 是否启用 */
  enabled?: boolean;
}
