/** 创建发票表单 */
export interface InvoiceCreateForm {
  /** 发票抬头 */
  title: string;
  /** 抬头类型: PERSONAL/COMPANY */
  titleType?: string;
  /** 纳税人识别号 */
  taxNo?: string;
  /** 发票类型 */
  type?: string;
  /** 总金额 */
  totalAmount?: number;
}
