/** FAQ查询表单 */
export interface FaqQueryForm {
  /** 分类ID */
  categoryId?: string;
  /** 查询关键词 */
  keyword?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  size?: number;
}
