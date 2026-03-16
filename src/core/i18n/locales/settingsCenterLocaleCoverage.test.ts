import { describe, expect, it } from 'vitest';

import enUS from './en-US';
import zhCN from './zh-CN';

const getPathValue = (source: Record<string, any>, path: string) =>
  path.split('.').reduce<any>((current, key) => current?.[key], source);

const SETTINGS_CENTER_PATHS = [
  'settings.feedback',
  'feedback.title',
  'feedback.form.title',
  'feedback.type.bug',
  'feedback.type.suggestion',
  'feedback.type.complaint',
  'feedback.type.other',
  'feedback.status.submitted',
  'feedback.status.processing',
  'feedback.status.resolved',
  'feedback.status.closed',
  'feedback.content_placeholder',
  'feedback.contact_placeholder',
  'feedback.content_required',
  'feedback.submit_button',
  'feedback.submit_failed',
  'feedback.submit_success',
  'feedback.submitting',
  'feedback.history_title',
  'feedback.loading_history',
  'feedback.empty_history',
] as const;

describe('settings center locale coverage', () => {
  it('exposes required settings-center labels in zh-CN resources', () => {
    for (const path of SETTINGS_CENTER_PATHS) {
      expect(getPathValue(zhCN, path), path).toBeTruthy();
    }
  });

  it('exposes required settings-center labels in en-US resources', () => {
    for (const path of SETTINGS_CENTER_PATHS) {
      expect(getPathValue(enUS, path), path).toBeTruthy();
    }
  });

  it('keeps root language labels and feedback entry readable', () => {
    expect(getPathValue(zhCN, 'settings.language_zh')).toBe('\u7b80\u4f53\u4e2d\u6587');
    expect(getPathValue(enUS, 'settings.language_zh')).toBe('\u7b80\u4f53\u4e2d\u6587');
    expect(getPathValue(zhCN, 'settings.feedback')).toBe('\u53cd\u9988');
    expect(getPathValue(enUS, 'settings.feedback')).toBe('Feedback');
  });
});
