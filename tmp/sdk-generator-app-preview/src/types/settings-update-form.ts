/** 更新模块设置请求 */
export interface SettingsUpdateForm {
  /** 设置项 */
  settings?: Record<string, unknown>;
  /** 模块名称 */
  module?: string;
  /** 是否覆盖所有设置 */
  overwrite?: boolean;
}
