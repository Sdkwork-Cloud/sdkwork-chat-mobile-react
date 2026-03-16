/** 货币兑换表单 */
export interface CurrencyConvertForm {
  /** 基础货币代码 */
  baseCurrencyCode: string;
  /** 目标货币代码 */
  targetCurrencyCode: string;
  /** 金额 */
  amount: number;
}
