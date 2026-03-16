/** 注册表单 */
export interface RegisterForm {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 确认密码 */
  confirmPassword: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
  /** 注册类型: EMAIL/PHONE/DEFAULT。未传时系统会根据email/phone自动判断 */
  type?: 'EMAIL' | 'PHONE' | 'DEFAULT';
  /** 注册验证码（当type为EMAIL或PHONE时必填） */
  verificationCode?: string;
}
