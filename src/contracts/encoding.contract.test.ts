import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import userLocale from '../core/i18n/locales/zh-CN/user';

describe('encoding contracts', () => {
  it('keeps zh-CN theme color copy intact', () => {
    expect(userLocale.settings.config_center).toMatchObject({
      accent_title: '\u4e3b\u9898\u8272\u5f69',
      accent_desc: '\u7cbe\u9009\u7684\u5168\u5c40\u54c1\u724c\u8272\u65b9\u6848',
      accent_custom_title: '\u9ad8\u7ea7\u81ea\u5b9a\u4e49\u989c\u8272',
      accent_custom_desc: '\u5f53\u9884\u8bbe\u4e0d\u6ee1\u8db3\u65f6\uff0c\u4f7f\u7528\u7cbe\u786e\u54c1\u724c\u8272',
      accent_custom_hint:
        '\u81ea\u5b9a\u4e49\u989c\u8272\u53ea\u8986\u76d6\u5f3a\u8c03\u8272\uff0c\u754c\u9762\u5c42\u7ea7\u548c\u9634\u5f71\u4ecd\u8ddf\u968f\u4e3b\u9898\u98ce\u683c\u3002',
      accent_custom_badge: '\u81ea\u5b9a\u4e49\u5f3a\u8c03\u8272',
      accent_scheme_lobster: '\u9f99\u867e\u4e3b\u9898',
      accent_scheme_lobster_desc: '\u9c9c\u4eae\u9f99\u867e\u7ea2\uff0c\u66f4\u9002\u5408\u793e\u4ea4\u4e0e\u6d88\u606f\u573a\u666f',
      accent_scheme_tech_blue: '\u79d1\u6280\u84dd',
      accent_scheme_tech_blue_desc: '\u51b7\u9759\u6e05\u6670\uff0c\u9002\u5408\u73b0\u4ee3\u4ea7\u54c1\u754c\u9762',
      accent_scheme_green_tech: '\u7eff\u8272\u79d1\u6280',
      accent_scheme_green_tech_desc: '\u8f7b\u76c8\u79d1\u6280\u7eff\uff0c\u9002\u5408\u6548\u7387\u4e0e\u589e\u957f\u573a\u666f',
      accent_scheme_aurora_teal: '\u6781\u5149\u9752',
      accent_scheme_aurora_teal_desc: '\u901a\u900f\u9752\u84dd\uff0c\u9002\u5408\u8f7b\u5feb\u6d41\u52a8\u7684\u4ea4\u4e92',
      accent_scheme_sunset_coral: '\u65e5\u843d\u73ca\u745a',
      accent_scheme_sunset_coral_desc: '\u6709\u6d3b\u529b\u7684\u73ca\u745a\u6a59\uff0c\u8ba9\u91cd\u70b9\u64cd\u4f5c\u66f4\u9192\u76ee',
      accent_scheme_violet_signal: '\u4fe1\u53f7\u7d2b',
      accent_scheme_violet_signal_desc: '\u9c9c\u660e\u7d2b\u8c03\uff0c\u9002\u5408\u521b\u4f5c\u4e0e AI \u6c1b\u56f4',
      accent_scheme_graphite_ice: '\u77f3\u58a8\u51b0\u7070',
      accent_scheme_graphite_ice_desc: '\u514b\u5236\u51b7\u9759\uff0c\u9002\u5408\u66f4\u4e13\u4e1a\u7a33\u91cd\u7684\u754c\u9762',
      applied: '\u5df2\u5e94\u7528',
      selected: '\u5df2\u9009\u4e2d',
    });
    expect(userLocale.settings.labels.config_center_desc).toBe(
      '\u7cfb\u7edf\u6a21\u5f0f\u3001\u4e3b\u9898\u98ce\u683c\u3001\u4e3b\u9898\u8272\u5f69\u3001\u5b57\u4f53\u98ce\u683c\u4e0e\u6bd4\u4f8b'
    );
  });

  it('keeps GigCenterPage free from replacement characters', async () => {
    const source = await readFile(
      new URL('../../packages/sdkwork-react-mobile-commerce/src/pages/GigCenterPage.tsx', import.meta.url),
      'utf8'
    );

    expect(source).not.toContain('\uFFFD');
    expect(source).toContain('\\u00A5');
    expect(source).toContain('\\u2192');
    expect(source).toContain('\\u00B7');
  });
});
