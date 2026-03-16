/** 更新发票表单 */
export interface InvoiceUpdateForm {
  /** 发票抬头 */
  title?: string;
  /** 纳税人识别号 */
  taxNo?: string;
  /** 开户银行 */
  bankName?: string;
  /** 银行账号 */
  bankAccount?: string;
  /** 注册地址 */
  registerAddress?: string;
  /** 注册电话 */
  registerPhone?: string;
}
