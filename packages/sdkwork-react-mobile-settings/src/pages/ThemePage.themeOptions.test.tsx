import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const mockUseSettings = vi.fn();

vi.mock('../hooks/useSettings', () => ({
  useSettings: () => mockUseSettings(),
}));

vi.mock('@sdkwork/react-mobile-commons', () => ({
  Navbar: ({ title }: { title?: string }) => <div data-testid="mock-navbar">{title || ''}</div>,
  Toast: {
    info: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ThemePage theme color options', () => {
  it('renders named theme color scheme cards with lobster selected by default', async () => {
    mockUseSettings.mockReturnValue({
      t: (key: string) => key,
      config: {
        appearanceMode: 'system',
        themePreset: 'wechat',
        accentType: 'preset',
        accentPreset: 'lobster',
        accentHex: '#E5484D',
        fontScale: 1,
        fontFamilyPreset: 'system',
      },
      updateConfig: vi.fn(),
      resetAppearanceConfig: vi.fn(),
    });

    const { ThemePage } = await import('./ThemePage');
    const html = renderToStaticMarkup(<ThemePage />);

    expect(html).toContain('Theme Colors');
    expect(html).toContain('Lobster');
    expect(html).toContain('Tech Blue');
    expect(html).toContain('Green Tech');
    expect(html).toContain('data-theme-color-option="lobster"');
    expect(html).toContain('data-theme-color-selected="true"');
    expect(html).toContain('data-theme-color-option="tech-blue"');
    expect(html).toContain('data-theme-color-option="green-tech"');
    expect(html).toContain('data-theme-color-option="graphite-ice"');
    expect(html).toContain('#RRGGBB');
  });

  it('renders zh-CN theme color copy when settings translations are provided', async () => {
    const zhTranslations: Record<string, string> = {
      'settings.config_center.title': '配置中心',
      'settings.config_center.mode_title': '显示模式',
      'settings.config_center.mode_desc': '跟随系统或强制指定',
      'settings.config_center.mode_system': '跟随系统',
      'settings.config_center.mode_light': '浅色',
      'settings.config_center.mode_dark': '深色',
      'settings.config_center.preset_title': '主题风格',
      'settings.config_center.preset_desc': '选择视觉风格',
      'settings.config_center.preset_wechat': 'WeChat',
      'settings.config_center.preset_wechat_desc': '均衡、熟悉',
      'settings.config_center.preset_classic': '经典',
      'settings.config_center.preset_classic_desc': '中性简洁',
      'settings.config_center.preset_midnight': '夜幕蓝',
      'settings.config_center.preset_midnight_desc': '科技深色',
      'settings.config_center.preset_oled': 'OLED',
      'settings.config_center.preset_oled_desc': '高对比纯黑',
      'settings.config_center.accent_title': '主题色彩',
      'settings.config_center.accent_desc': '精选的全局品牌色方案',
      'settings.config_center.accent_custom_title': '高级自定义颜色',
      'settings.config_center.accent_custom_desc': '当预设不满足时，使用精确品牌色',
      'settings.config_center.accent_custom_hint': '自定义颜色只覆盖强调色，界面层级和阴影仍跟随主题风格。',
      'settings.config_center.accent_custom_badge': '自定义强调色',
      'settings.config_center.accent_scheme_lobster': '龙虾主题',
      'settings.config_center.accent_scheme_lobster_desc': '温暖壳红，适合社交与消息场景',
      'settings.config_center.accent_scheme_tech_blue': '科技蓝',
      'settings.config_center.accent_scheme_tech_blue_desc': '冷静清晰，适合现代产品界面',
      'settings.config_center.accent_scheme_green_tech': '绿色科技',
      'settings.config_center.accent_scheme_green_tech_desc': '轻盈科技绿，适合效率与增长场景',
      'settings.config_center.accent_scheme_aurora_teal': '极光青',
      'settings.config_center.accent_scheme_aurora_teal_desc': '通透青蓝，适合轻快流动的交互',
      'settings.config_center.accent_scheme_sunset_coral': '日落珊瑚',
      'settings.config_center.accent_scheme_sunset_coral_desc': '有活力的珊瑚橙，让重点操作更醒目',
      'settings.config_center.accent_scheme_violet_signal': '信号紫',
      'settings.config_center.accent_scheme_violet_signal_desc': '鲜明紫调，适合创作与 AI 氛围',
      'settings.config_center.accent_scheme_graphite_ice': '石墨冰灰',
      'settings.config_center.accent_scheme_graphite_ice_desc': '克制冷静，适合更专业稳重的界面',
      'settings.config_center.accent_invalid': '颜色格式无效，请输入 #RRGGBB 或 #RGB',
      'settings.config_center.font_title': '全局字体比例',
      'settings.config_center.font_desc': '应用于整个 App',
      'settings.config_center.font_now': '当前',
      'settings.config_center.font_family_title': '字体风格',
      'settings.config_center.font_family_desc': '选择全局排版气质',
      'settings.config_center.font_family_system': '系统',
      'settings.config_center.font_family_rounded': '圆角',
      'settings.config_center.font_family_serif': '衬线',
      'settings.config_center.font_family_mono': '等宽',
      'settings.config_center.preview_title': '实时预览',
      'settings.config_center.preview_title_text': '会话标题',
      'settings.config_center.preview_body': '主题、颜色与字体变更会立即生效。',
      'settings.config_center.apply': '应用',
      'settings.config_center.selected': '已选中',
      'settings.config_center.reset': '恢复默认外观',
    };

    mockUseSettings.mockReturnValue({
      t: (key: string) => zhTranslations[key] ?? key,
      config: {
        appearanceMode: 'system',
        themePreset: 'wechat',
        accentType: 'preset',
        accentPreset: 'lobster',
        accentHex: '#E5484D',
        fontScale: 1,
        fontFamilyPreset: 'system',
      },
      updateConfig: vi.fn(),
      resetAppearanceConfig: vi.fn(),
    });

    const { ThemePage } = await import('./ThemePage');
    const html = renderToStaticMarkup(<ThemePage />);

    expect(html).toContain('主题色彩');
    expect(html).toContain('龙虾主题');
    expect(html).toContain('科技蓝');
    expect(html).toContain('绿色科技');
    expect(html).toContain('高级自定义颜色');
    expect(html).toContain('已选中');
    expect(html).toContain('恢复默认外观');
  });
});
