/** 店铺创建请求 */
export interface ShopCreateForm {
  /** 店铺名称 */
  name: string;
  /** 店铺描述 */
  description?: string;
  /** 店铺Logo URL */
  logoUrl?: string;
  /** 店铺封面图URL */
  coverUrl?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 联系邮箱 */
  contactEmail?: string;
  /** 店铺地址 */
  address?: string;
  /** 纬度 */
  latitude?: number;
  /** 经度 */
  longitude?: number;
  /** 营业执照编号 */
  licenseNumber?: string;
  /** 店铺标签 */
  tags?: string[];
  /** 营业时间 */
  businessHours?: string;
}
