/** 创建货币表单 */
export interface CurrencyCreateForm {
  /** 货币代码 */
  code: string;
  /** 货币名称 */
  name: string;
  /** 货币符号 */
  symbol?: string;
  /** 货币类型 */
  currencyType: string;
  /** 小数位数 */
  precisionDigits?: number;
  /** 是否启用 */
  isActive?: boolean;
  /** 描述 */
  description?: string;
}
