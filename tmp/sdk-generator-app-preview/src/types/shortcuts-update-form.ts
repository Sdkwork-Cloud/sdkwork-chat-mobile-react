import type { ShortcutItemForm } from './shortcut-item-form';

/** 更新快捷方式请求 */
export interface ShortcutsUpdateForm {
  /** 快捷方式列表 */
  shortcuts: ShortcutItemForm[];
}
