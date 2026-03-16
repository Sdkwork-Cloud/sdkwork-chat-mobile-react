/** 更新用户地址请求 */
export interface UserAddressUpdateForm {
  /** 收货人姓名 */
  name?: string;
  /** 收货人手机号 */
  phone?: string;
  /** 国家代码 */
  countryCode?: string;
  /** 省份代码 */
  provinceCode?: string;
  /** 城市代码 */
  cityCode?: string;
  /** 区县代码 */
  districtCode?: string;
  /** 详细地址 */
  addressDetail?: string;
  /** 邮政编码 */
  postalCode?: string;
  /** 是否默认地址 */
  isDefault?: boolean;
}
