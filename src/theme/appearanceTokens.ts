import type { AccentPreset, AppearanceMode, FontFamilyPreset, ThemePreset } from '@sdkwork/react-mobile-settings';

type ResolvedMode = 'light' | 'dark';
type LegacyTheme = 'light' | 'dark' | 'wechat-dark' | 'midnight-blue';

const PRESET_ACCENT_MAP: Record<AccentPreset, string> = {
  blue: '#2979FF',
  teal: '#14B8A6',
  green: '#22C55E',
  orange: '#F97316',
  rose: '#F43F5E',
  violet: '#8B5CF6',
};
const DEFAULT_THEME_PRESET: ThemePreset = 'wechat';
const DEFAULT_ACCENT_PRESET: AccentPreset = 'blue';
const DEFAULT_FONT_FAMILY_PRESET: FontFamilyPreset = 'system';

const FONT_FAMILY_MAP: Record<FontFamilyPreset, { base: string; display: string; mono: string }> = {
  system: {
    base: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    display: '"DIN Alternate", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
  },
  rounded: {
    base: '"SF Pro Rounded", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
    display: '"SF Pro Rounded", "DIN Alternate", "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
  },
  serif: {
    base: '"Noto Serif SC", "Source Han Serif SC", Georgia, "Times New Roman", serif',
    display: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
  },
  mono: {
    base: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
    display: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
    mono: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
  },
};

const normalizeHex = (value: string | undefined): string => {
  if (!value) return '';
  let normalized = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    normalized = normalized
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return '';
  }
  return `#${normalized.toUpperCase()}`;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const raw = normalizeHex(hex).replace('#', '');
  return [
    Number.parseInt(raw.slice(0, 2), 16),
    Number.parseInt(raw.slice(2, 4), 16),
    Number.parseInt(raw.slice(4, 6), 16),
  ];
};

const rgbToHex = (rgb: [number, number, number]): string =>
  `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

const mixHex = (source: string, target: string, ratio: number): string => {
  const clamped = Math.min(1, Math.max(0, ratio));
  const sourceRgb = hexToRgb(source);
  const targetRgb = hexToRgb(target);
  const result: [number, number, number] = [0, 1, 2].map((index) =>
    Math.round(sourceRgb[index] + (targetRgb[index] - sourceRgb[index]) * clamped)
  ) as [number, number, number];
  return rgbToHex(result);
};

const rgbString = (hex: string): string => {
  const [r, g, b] = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
};

interface BasePalette {
  bgBody: string;
  bgCard: string;
  navBg: string;
  textPrimary: string;
  textSecondary: string;
  textPlaceholder: string;
  border: string;
  cellTop: string;
  cellActive: string;
  bubbleOther: string;
  tabInactive: string;
}

const PRESET_PALETTES: Record<ThemePreset, Record<ResolvedMode, BasePalette>> = {
  wechat: {
    light: {
      bgBody: '#EDEDED',
      bgCard: '#FFFFFF',
      navBg: '#F7F7F7',
      textPrimary: '#111111',
      textSecondary: '#7E7E7E',
      textPlaceholder: '#B2B2B2',
      border: '#DCDCDC',
      cellTop: '#F7F7F7',
      cellActive: '#D9D9D9',
      bubbleOther: '#FFFFFF',
      tabInactive: '#7C8798',
    },
    dark: {
      bgBody: '#111111',
      bgCard: '#191919',
      navBg: '#191919',
      textPrimary: '#E5E5E5',
      textSecondary: '#8E8E93',
      textPlaceholder: '#666A73',
      border: '#2C2C2C',
      cellTop: '#222222',
      cellActive: '#2A2A2A',
      bubbleOther: '#2C2C2C',
      tabInactive: '#8A93A5',
    },
  },
  classic: {
    light: {
      bgBody: '#F5F6FA',
      bgCard: '#FFFFFF',
      navBg: '#F7F8FB',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textPlaceholder: '#94A3B8',
      border: '#E2E8F0',
      cellTop: '#EEF2F7',
      cellActive: '#E2E8F0',
      bubbleOther: '#FFFFFF',
      tabInactive: '#8A93A5',
    },
    dark: {
      bgBody: '#000000',
      bgCard: '#1C1C1E',
      navBg: '#1C1C1E',
      textPrimary: '#FFFFFF',
      textSecondary: '#8E8E93',
      textPlaceholder: '#6B7280',
      border: '#38383A',
      cellTop: '#2C2C2E',
      cellActive: '#3A3A3C',
      bubbleOther: '#2C2C2E',
      tabInactive: '#8F99AA',
    },
  },
  midnight: {
    light: {
      bgBody: '#EAF2FF',
      bgCard: '#FFFFFF',
      navBg: '#EEF5FF',
      textPrimary: '#11253F',
      textSecondary: '#5D7696',
      textPlaceholder: '#8CA2BE',
      border: '#D0DDEE',
      cellTop: '#E8F0FB',
      cellActive: '#D9E5F6',
      bubbleOther: '#FFFFFF',
      tabInactive: '#88A1C3',
    },
    dark: {
      bgBody: '#0D1117',
      bgCard: '#161B22',
      navBg: '#010409',
      textPrimary: '#C9D1D9',
      textSecondary: '#8B949E',
      textPlaceholder: '#6E7681',
      border: '#30363D',
      cellTop: '#21262D',
      cellActive: '#30363D',
      bubbleOther: '#21262D',
      tabInactive: '#8FA8CA',
    },
  },
  oled: {
    light: {
      bgBody: '#F3F4F6',
      bgCard: '#FFFFFF',
      navBg: '#F8FAFC',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textPlaceholder: '#94A3B8',
      border: '#E2E8F0',
      cellTop: '#EDF1F7',
      cellActive: '#E2E8F0',
      bubbleOther: '#FFFFFF',
      tabInactive: '#8A93A5',
    },
    dark: {
      bgBody: '#000000',
      bgCard: '#0A0A0A',
      navBg: '#050505',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textPlaceholder: '#64748B',
      border: '#1F2937',
      cellTop: '#0F172A',
      cellActive: '#1E293B',
      bubbleOther: '#111827',
      tabInactive: '#7A879A',
    },
  },
};

export interface AppearanceThemeInput {
  appearanceMode: AppearanceMode;
  themePreset: ThemePreset;
  accentType: 'preset' | 'custom';
  accentPreset: AccentPreset;
  accentHex: string;
  fontScale: number;
  fontFamilyPreset: FontFamilyPreset;
  systemPrefersDark: boolean;
}

export interface ResolvedAppearanceTheme {
  mode: ResolvedMode;
  legacyTheme: LegacyTheme;
  cssVariables: Record<string, string>;
  themeColor: string;
}

const resolveLegacyTheme = (mode: ResolvedMode, preset: ThemePreset): LegacyTheme => {
  if (mode === 'light') return 'light';
  if (preset === 'wechat') return 'wechat-dark';
  if (preset === 'midnight') return 'midnight-blue';
  return 'dark';
};

export const resolveAppearanceTheme = (input: AppearanceThemeInput): ResolvedAppearanceTheme => {
  const appearanceMode: AppearanceMode =
    input.appearanceMode === 'light' || input.appearanceMode === 'dark' || input.appearanceMode === 'system'
      ? input.appearanceMode
      : 'system';
  const themePreset: ThemePreset =
    input.themePreset in PRESET_PALETTES ? input.themePreset : DEFAULT_THEME_PRESET;
  const accentType: 'preset' | 'custom' =
    input.accentType === 'custom' || input.accentType === 'preset' ? input.accentType : 'preset';
  const accentPreset: AccentPreset =
    input.accentPreset in PRESET_ACCENT_MAP ? input.accentPreset : DEFAULT_ACCENT_PRESET;
  const fontFamilyPreset: FontFamilyPreset =
    input.fontFamilyPreset in FONT_FAMILY_MAP ? input.fontFamilyPreset : DEFAULT_FONT_FAMILY_PRESET;
  const mode: ResolvedMode =
    appearanceMode === 'system'
      ? (input.systemPrefersDark ? 'dark' : 'light')
      : appearanceMode;
  const palette = PRESET_PALETTES[themePreset][mode];
  const fontFamily = FONT_FAMILY_MAP[fontFamilyPreset] ?? FONT_FAMILY_MAP.system;
  const presetAccent = PRESET_ACCENT_MAP[accentPreset];
  const accentHex =
    accentType === 'custom'
      ? (normalizeHex(input.accentHex) || presetAccent)
      : presetAccent;
  const accentStart = mode === 'dark' ? mixHex(accentHex, '#FFFFFF', 0.08) : mixHex(accentHex, '#FFFFFF', 0.02);
  const accentEnd = mode === 'dark' ? mixHex(accentHex, '#000000', 0.22) : mixHex(accentHex, '#000000', 0.12);
  const tabActive = mode === 'dark' ? mixHex(accentHex, '#FFFFFF', 0.16) : accentHex;
  const chatPinned = mode === 'dark' ? mixHex(palette.bgCard, '#FFFFFF', 0.05) : mixHex(palette.bgCard, '#000000', 0.04);
  const chatPressed = mode === 'dark' ? mixHex(palette.bgCard, '#FFFFFF', 0.12) : mixHex(palette.bgCard, '#000000', 0.08);
  const chatDivider = mode === 'dark' ? 'rgba(148, 163, 184, 0.26)' : 'rgba(129, 141, 164, 0.26)';
  const chatUnread = mode === 'dark' ? '#F8FAFC' : '#111827';

  const cssVariables: Record<string, string> = {
    '--primary-color': accentHex,
    '--primary-gradient': `linear-gradient(135deg, ${accentStart} 0%, ${accentEnd} 100%)`,
    '--bg-body': palette.bgBody,
    '--bg-card': palette.bgCard,
    '--navbar-bg': palette.navBg,
    '--navbar-bg-rgb': rgbString(palette.navBg),
    '--bg-card-rgb': rgbString(palette.bgCard),
    '--nav-surface-rgb': rgbString(palette.navBg),
    '--nav-text-primary': palette.textPrimary,
    '--nav-text-secondary': palette.textSecondary,
    '--tab-active-color': tabActive,
    '--tab-inactive-color': palette.tabInactive,
    '--bg-cell-top': palette.cellTop,
    '--bg-cell-active': palette.cellActive,
    '--text-primary': palette.textPrimary,
    '--text-secondary': palette.textSecondary,
    '--text-placeholder': palette.textPlaceholder,
    '--border-color': palette.border,
    '--bubble-me': accentHex,
    '--bubble-me-text': '#FFFFFF',
    '--bubble-other': palette.bubbleOther,
    '--accent-blue': accentHex,
    '--font-scale': input.fontScale.toFixed(2),
    '--font-family-base': fontFamily.base,
    '--font-family-display': fontFamily.display,
    '--font-family-mono': fontFamily.mono,
    '--chat-list-item-pinned-bg': chatPinned,
    '--chat-list-item-pressed-bg': chatPressed,
    '--chat-list-item-divider': chatDivider,
    '--chat-list-item-unread-text': chatUnread,
    '--chat-list-empty-icon-fg': accentHex,
    '--chat-list-empty-icon-bg-start': mixHex(accentHex, '#FFFFFF', mode === 'dark' ? 0.82 : 0.86),
    '--chat-list-empty-icon-bg-end': mixHex(accentHex, '#000000', mode === 'dark' ? 0.75 : 0.8),
    '--chat-list-empty-primary-bg-start': accentStart,
    '--chat-list-empty-primary-bg-end': accentEnd,
    '--chat-list-empty-primary-shadow': mode === 'dark' ? 'rgba(41, 121, 255, 0.35)' : 'rgba(47, 109, 255, 0.28)',
    '--chat-list-empty-secondary-bg': mode === 'dark' ? `rgba(${rgbString(palette.bgCard)}, 0.92)` : `rgba(${rgbString(palette.bgCard)}, 0.96)`,
    '--chat-list-spinner-border': mode === 'dark' ? 'rgba(110, 168, 255, 0.35)' : 'rgba(41, 121, 255, 0.22)',
    '--chat-list-spinner-top': mode === 'dark' ? 'rgba(154, 195, 255, 0.95)' : 'rgba(41, 121, 255, 0.82)',
  };

  return {
    mode,
    legacyTheme: resolveLegacyTheme(mode, themePreset),
    cssVariables,
    themeColor: palette.bgBody,
  };
};
