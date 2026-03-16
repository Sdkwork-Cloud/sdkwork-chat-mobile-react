/** 创建合集表单 */
export interface CollectionCreateForm {
  /** 合集名称 */
  name: string;
  /** 合集描述 */
  description?: string;
  /** 合集类型 */
  type?: string;
  /** 父级ID */
  parentId?: number;
}
