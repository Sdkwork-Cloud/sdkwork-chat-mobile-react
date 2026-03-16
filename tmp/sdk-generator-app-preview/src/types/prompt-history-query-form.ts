/** 查询提示语历史记录请求 */
export interface PromptHistoryQueryForm {
  /** 提示语ID */
  promptId?: number;
  /** 搜索关键词 */
  keyword?: string;
  /** AI模型 */
  model?: string;
  /** 是否成功 */
  success?: boolean;
  /** 分页页码 */
  page?: number;
  /** 分页大小 */
  size?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortDirection?: string;
}
