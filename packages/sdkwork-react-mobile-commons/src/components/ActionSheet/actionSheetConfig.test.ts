import { describe, expect, it } from 'vitest';
import { resolveActionSheetVariantClass, resolveDefaultCancelText } from './actionSheetConfig';

describe('actionSheetConfig', () => {
  it('returns user-center popup class for user-center variant', () => {
    expect(resolveActionSheetVariantClass('user-center')).toBe('c-action-sheet-popup--user-center');
  });

  it('returns default popup class for default variant', () => {
    expect(resolveActionSheetVariantClass('default')).toBe('c-action-sheet-popup--default');
  });

  it('resolves english cancel text for english language', () => {
    const text = resolveDefaultCancelText({ htmlLang: 'en-US', navigatorLang: 'en-US' });
    expect(text).toBe('Cancel');
  });

  it('resolves chinese cancel text for non-english language', () => {
    const text = resolveDefaultCancelText({ htmlLang: 'zh-CN', navigatorLang: 'zh-CN' });
    expect(text).toBe('\u53d6\u6d88');
  });
});
