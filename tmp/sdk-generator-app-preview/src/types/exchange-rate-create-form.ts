/** 创建汇率表单 */
export interface ExchangeRateCreateForm {
  /** 基础货币代码 */
  baseCurrencyCode: string;
  /** 目标货币代码 */
  targetCurrencyCode: string;
  /** 汇率 */
  rate: number;
  /** 生效日期 */
  effectiveDate?: string;
}
