import { describe, expect, it } from 'vitest';

import { settingsTranslations } from './index';

describe('settingsTranslations contracts', () => {
  it('exports readable zh theme color labels and descriptions', () => {
    expect(settingsTranslations.zh.settings.config_center.accent_title).toBe('\u4e3b\u9898\u8272\u5f69');
    expect(settingsTranslations.zh.settings.config_center.accent_scheme_lobster).toBe('\u9f99\u867e\u4e3b\u9898');
    expect(settingsTranslations.zh.settings.config_center.accent_scheme_lobster_desc).toBe(
      '\u9c9c\u4eae\u9f99\u867e\u7ea2\uff0c\u66f4\u9002\u5408\u793e\u4ea4\u4e0e\u6d88\u606f\u573a\u666f'
    );
    expect(settingsTranslations.zh.settings.config_center.accent_scheme_tech_blue).toBe(
      '\u79d1\u6280\u84dd'
    );
    expect(settingsTranslations.zh.settings.config_center.accent_scheme_green_tech).toBe(
      '\u7eff\u8272\u79d1\u6280'
    );
    expect(settingsTranslations.zh.settings.feedback).toBe('\u53cd\u9988');
    expect(settingsTranslations.zh.settings.languages.zh).toBe('\u7b80\u4f53\u4e2d\u6587');
    expect(settingsTranslations.zh.feedback.title).toBe('\u53cd\u9988');
  });

  it('exports readable en labels for cross-locale selection UI', () => {
    expect(settingsTranslations.en.settings.config_center.accent_title).toBe('Theme Colors');
    expect(settingsTranslations.en.settings.config_center.accent_scheme_lobster).toBe('Lobster');
    expect(settingsTranslations.en.settings.config_center.accent_scheme_lobster_desc).toBe(
      'Vivid lobster red with polished social-app energy'
    );
    expect(settingsTranslations.en.settings.config_center.accent_scheme_tech_blue).toBe('Tech Blue');
    expect(settingsTranslations.en.settings.feedback).toBe('Feedback');
    expect(settingsTranslations.en.settings.languages.zh).toBe('\u7b80\u4f53\u4e2d\u6587');
    expect(settingsTranslations.en.settings.languages.en).toBe('English');
    expect(settingsTranslations.en.feedback.submit_button).toBe('Submit Feedback');
  });
});
