/** 举报查询表单 */
export interface ReportQueryForm {
  /** 举报类型 */
  type?: string;
  /** 状态 */
  status?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  size?: number;
}
