/** 批量实验分组请求 */
export interface BatchAssignmentForm {
  /** 实验标识列表 */
  experimentKeys: string[];
  /** 用户属性 */
  userAttributes?: Record<string, unknown>;
}
