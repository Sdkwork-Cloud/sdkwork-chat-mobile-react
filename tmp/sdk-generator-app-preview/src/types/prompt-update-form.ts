/** 更新提示语请求 */
export interface PromptUpdateForm {
  /** 提示语标题 */
  title?: string;
  /** 提示语内容 */
  content?: string;
  /** 提示语描述 */
  description?: string;
  /** 分类ID */
  cateId?: number;
  /** 是否启用 */
  enabled?: boolean;
  /** 排序 */
  sort?: number;
  /** 参数定义 */
  parameters?: Record<string, unknown>;
  /** 适用模型 */
  model?: string;
  /** 是否公开 */
  isPublic?: boolean;
}
