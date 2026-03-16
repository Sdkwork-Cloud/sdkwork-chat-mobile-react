/** 创建产品属性请求 */
export interface ProductAttributeCreateRequest {
  /** 属性名称 */
  name?: string;
  /** 属性值列表 */
  values?: string[];
  /** 是否可搜索 */
  searchable?: boolean;
  /** 是否可筛选 */
  filterable?: boolean;
  /** 排序 */
  sort?: number;
}
