/** 创建生成风格表单 */
export interface GenerationStyleCreateForm {
  /** 风格名称 */
  name: string;
  /** 风格描述 */
  description?: string;
  /** 风格类型 */
  type: string;
  /** 配置参数 */
  configParams?: Record<string, unknown>;
  /** 是否公开 */
  isPublic?: boolean;
}
