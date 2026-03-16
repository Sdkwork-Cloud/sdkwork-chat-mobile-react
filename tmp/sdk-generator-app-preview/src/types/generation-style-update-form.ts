/** 更新生成风格表单 */
export interface GenerationStyleUpdateForm {
  /** 风格名称 */
  name?: string;
  /** 风格描述 */
  description?: string;
  /** 配置参数 */
  configParams?: Record<string, unknown>;
}
