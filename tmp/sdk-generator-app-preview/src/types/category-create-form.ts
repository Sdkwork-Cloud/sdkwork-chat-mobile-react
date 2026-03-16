/** 创建分类请求 */
export interface CategoryCreateForm {
  /** 分类名称 */
  name: string;
  /** 分类类型: asset/note/feed/project */
  type: string;
  /** 分类编码 */
  code: string;
  /** 分类图标 */
  icon?: string;
  /** 分类描述 */
  description?: string;
  /** 父分类ID */
  parentId?: number;
  /** 排序值 */
  sort?: number;
  /** 状态：0-禁用，1-启用 */
  status?: number;
}
