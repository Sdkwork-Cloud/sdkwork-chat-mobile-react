/** 查询提示语请求 */
export interface PromptQueryForm {
  /** 搜索关键词 */
  keyword?: string;
  /** 提示语类型 */
  type?: 'DEFAULT' | 'SYSTEM' | 'ASSISTANT' | 'USER';
  /** 业务类型 */
  bizType?: 'DEFAULT' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'MUSIC' | 'AGENT' | 'VOICE_CLONE_WORDS';
  /** 是否启用 */
  enabled?: boolean;
  /** 适用模型 */
  model?: string;
  /** 是否公开 */
  isPublic?: boolean;
  /** 是否收藏 */
  isFavorite?: boolean;
  /** 分页页码 */
  page?: number;
  /** 分页大小 */
  size?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortDirection?: string;
}
