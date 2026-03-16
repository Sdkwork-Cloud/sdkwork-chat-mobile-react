/** 创建标签请求 */
export interface TagCreateForm {
  /** 标签名称 */
  name: string;
  /** 标签编码 */
  code: string;
  /** 标签颜色 */
  color?: string;
  /** 标签描述 */
  description?: string;
  /** 状态：0-禁用，1-启用 */
  status?: number;
}
