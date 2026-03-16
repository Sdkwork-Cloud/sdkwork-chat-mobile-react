/** 用户资料更新请求 */
export interface UserProfileUpdateForm {
  /** 昵称 */
  nickname?: string;
  /** 头像URL */
  avatar?: string;
  /** 性别：male/female/other */
  gender?: string;
  /** 生日 */
  birthday?: string;
  /** 地区 */
  region?: string;
  /** 个人简介 */
  bio?: string;
  /** 职业 */
  occupation?: string;
  /** 兴趣爱好 */
  interests?: string;
  /** 手机号 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 验证码 */
  verifyCode?: string;
}
