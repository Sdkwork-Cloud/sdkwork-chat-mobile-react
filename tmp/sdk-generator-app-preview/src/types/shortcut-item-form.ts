/** 快捷方式项 */
export interface ShortcutItemForm {
  /** 快捷方式ID */
  id?: string;
  /** 快捷方式名称 */
  name?: string;
  /** 快捷方式图标 */
  icon?: string;
  /** 快捷方式链接 */
  url?: string;
  /** 快捷方式排序 */
  sort?: number;
  /** 快捷方式类型 */
  type?: string;
}
