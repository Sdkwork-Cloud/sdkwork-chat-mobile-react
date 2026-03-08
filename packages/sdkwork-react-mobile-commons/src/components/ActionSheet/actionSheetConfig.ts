export interface ActionSheetAction {
  text: string;
  key?: string;
  color?: string;
  disabled?: boolean;
}

export type ActionSheetVariant = 'default' | 'user-center';

export interface ActionSheetShowOptions {
  title?: string;
  actions: ActionSheetAction[];
  cancelText?: string;
  variant?: ActionSheetVariant;
}

export const DEFAULT_ACTION_SHEET_VARIANT: ActionSheetVariant = 'default';

const DEFAULT_CANCEL_TEXT_EN = 'Cancel';
const DEFAULT_CANCEL_TEXT_ZH = '\u53d6\u6d88';

export const resolveActionSheetVariantClass = (variant: ActionSheetVariant): string => {
  if (variant === 'user-center') {
    return 'c-action-sheet-popup--user-center';
  }
  return 'c-action-sheet-popup--default';
};

export const resolveDefaultCancelText = (input?: {
  htmlLang?: string;
  navigatorLang?: string;
}): string => {
  const htmlLang = input?.htmlLang ?? (typeof document !== 'undefined' ? document.documentElement.lang : '');
  const navigatorLang = input?.navigatorLang ?? (typeof navigator !== 'undefined' ? navigator.language : '');
  const lang = (htmlLang || navigatorLang || '').toLowerCase();
  return lang.startsWith('en') ? DEFAULT_CANCEL_TEXT_EN : DEFAULT_CANCEL_TEXT_ZH;
};
