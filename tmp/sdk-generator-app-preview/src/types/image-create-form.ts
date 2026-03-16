/** 创建图片表单 */
export interface ImageCreateForm {
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** URL */
  url: string;
  /** 格式 */
  format?: string;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
}
