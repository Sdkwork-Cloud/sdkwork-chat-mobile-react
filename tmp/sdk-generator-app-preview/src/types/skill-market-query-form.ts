/** 技能市场查询参数 */
export interface SkillMarketQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 分类ID */
  categoryId?: number;
  /** 分包ID */
  packageId?: number;
  /** 关键词，匹配技能名称/简介/描述 */
  keyword?: string;
  /** 排序方式，支持 newest/popular/rating/recommended */
  sortBy?: string;
  size?: number;
  page?: number;
}
