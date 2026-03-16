/** 更新分类请求 */
export interface CategoryUpdateForm {
  /** 分类名称 */
  name?: string;
  /** 分类图标 */
  icon?: string;
  /** 分类描述 */
  description?: string;
  /** 排序值 */
  sort?: number;
  /** 状态：0-禁用，1-启用 */
  status?: number;
}
