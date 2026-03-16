/** 创建新闻表单 */
export interface NewsCreateForm {
  /** 标题 */
  title: string;
  /** 摘要 */
  summary?: string;
  /** URL */
  url?: string;
  /** 来源 */
  source?: string;
  /** 分类ID */
  categoryId?: number;
}
