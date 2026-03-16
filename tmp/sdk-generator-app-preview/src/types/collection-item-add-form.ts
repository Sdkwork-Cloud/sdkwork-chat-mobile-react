/** 添加内容到合集表单 */
export interface CollectionItemAddForm {
  /** 内容类型 */
  contentType: string;
  /** 内容ID */
  contentId: number;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 排序位置 */
  position?: number;
}
