import type { AccentPreset } from './types';

export interface ThemeColorTone {
  gradientStart: string;
  gradientEnd: string;
  tabActive: string;
}

export interface ThemeColorPresetMeta {
  key: AccentPreset;
  accent: string;
  labelKey: string;
  labelFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
  light: ThemeColorTone;
  dark: ThemeColorTone;
}

export const DEFAULT_ACCENT_PRESET: AccentPreset = 'lobster';

export const THEME_COLOR_PRESETS: ThemeColorPresetMeta[] = [
  {
    key: 'lobster',
    accent: '#E5484D',
    labelKey: 'settings.config_center.accent_scheme_lobster',
    labelFallback: 'Lobster',
    descriptionKey: 'settings.config_center.accent_scheme_lobster_desc',
    descriptionFallback: 'Vivid lobster red with polished social-app energy',
    light: {
      gradientStart: '#FF8E95',
      gradientEnd: '#D83A45',
      tabActive: '#D83A45',
    },
    dark: {
      gradientStart: '#FFA0A5',
      gradientEnd: '#CA313D',
      tabActive: '#FF8E95',
    },
  },
  {
    key: 'tech-blue',
    accent: '#2F6BFF',
    labelKey: 'settings.config_center.accent_scheme_tech_blue',
    labelFallback: 'Tech Blue',
    descriptionKey: 'settings.config_center.accent_scheme_tech_blue_desc',
    descriptionFallback: 'Clean, confident blue tuned for modern product UI',
    light: {
      gradientStart: '#7BB3FF',
      gradientEnd: '#2352E8',
      tabActive: '#2352E8',
    },
    dark: {
      gradientStart: '#8CC2FF',
      gradientEnd: '#3B5FFF',
      tabActive: '#9BC4FF',
    },
  },
  {
    key: 'green-tech',
    accent: '#19B36B',
    labelKey: 'settings.config_center.accent_scheme_green_tech',
    labelFallback: 'Green Tech',
    descriptionKey: 'settings.config_center.accent_scheme_green_tech_desc',
    descriptionFallback: 'Fresh signal green with a polished digital tone',
    light: {
      gradientStart: '#78E3A8',
      gradientEnd: '#0D9558',
      tabActive: '#0D9558',
    },
    dark: {
      gradientStart: '#8CF0BA',
      gradientEnd: '#128553',
      tabActive: '#8CF0BA',
    },
  },
  {
    key: 'aurora-teal',
    accent: '#14B8C4',
    labelKey: 'settings.config_center.accent_scheme_aurora_teal',
    labelFallback: 'Aurora Teal',
    descriptionKey: 'settings.config_center.accent_scheme_aurora_teal_desc',
    descriptionFallback: 'Calm cyan-teal for light, fluid interactions',
    light: {
      gradientStart: '#82EDF0',
      gradientEnd: '#0C8FA8',
      tabActive: '#0C8FA8',
    },
    dark: {
      gradientStart: '#8BF1F0',
      gradientEnd: '#0F7894',
      tabActive: '#8BF1F0',
    },
  },
  {
    key: 'sunset-coral',
    accent: '#F07A5A',
    labelKey: 'settings.config_center.accent_scheme_sunset_coral',
    labelFallback: 'Sunset Coral',
    descriptionKey: 'settings.config_center.accent_scheme_sunset_coral_desc',
    descriptionFallback: 'Lively coral-orange that keeps CTAs energetic',
    light: {
      gradientStart: '#FFB085',
      gradientEnd: '#D95746',
      tabActive: '#D95746',
    },
    dark: {
      gradientStart: '#FFBC95',
      gradientEnd: '#C54D48',
      tabActive: '#FFB085',
    },
  },
  {
    key: 'violet-signal',
    accent: '#7C5CFF',
    labelKey: 'settings.config_center.accent_scheme_violet_signal',
    labelFallback: 'Violet Signal',
    descriptionKey: 'settings.config_center.accent_scheme_violet_signal_desc',
    descriptionFallback: 'Distinct violet for creator and AI-centric moments',
    light: {
      gradientStart: '#B49BFF',
      gradientEnd: '#6140E8',
      tabActive: '#6140E8',
    },
    dark: {
      gradientStart: '#C1B0FF',
      gradientEnd: '#5A39DD',
      tabActive: '#C1B0FF',
    },
  },
  {
    key: 'graphite-ice',
    accent: '#6B7C93',
    labelKey: 'settings.config_center.accent_scheme_graphite_ice',
    labelFallback: 'Graphite Ice',
    descriptionKey: 'settings.config_center.accent_scheme_graphite_ice_desc',
    descriptionFallback: 'Muted steel for a restrained, enterprise-like look',
    light: {
      gradientStart: '#B9C6D8',
      gradientEnd: '#4A5B74',
      tabActive: '#4A5B74',
    },
    dark: {
      gradientStart: '#C7D3E2',
      gradientEnd: '#56657C',
      tabActive: '#D1DAE8',
    },
  },
];

export const THEME_COLOR_PRESET_MAP: Record<AccentPreset, ThemeColorPresetMeta> = Object.fromEntries(
  THEME_COLOR_PRESETS.map((preset) => [preset.key, preset])
) as Record<AccentPreset, ThemeColorPresetMeta>;

export const THEME_COLOR_PRESET_HEX_MAP: Record<AccentPreset, string> = Object.fromEntries(
  THEME_COLOR_PRESETS.map((preset) => [preset.key, preset.accent])
) as Record<AccentPreset, string>;

export const THEME_COLOR_PRESET_KEYS: AccentPreset[] = THEME_COLOR_PRESETS.map((preset) => preset.key);

export const LEGACY_ACCENT_PRESET_ALIAS_MAP: Record<string, AccentPreset> = {
  blue: 'tech-blue',
  teal: 'aurora-teal',
  green: 'green-tech',
  orange: 'sunset-coral',
  rose: 'lobster',
  violet: 'violet-signal',
};

const THEME_COLOR_PRESET_SET: ReadonlySet<AccentPreset> = new Set(THEME_COLOR_PRESET_KEYS);

export const normalizeAccentPresetKey = (
  value: unknown,
  fallback: AccentPreset = DEFAULT_ACCENT_PRESET
): AccentPreset => {
  if (typeof value !== 'string') return fallback;
  if (THEME_COLOR_PRESET_SET.has(value as AccentPreset)) return value as AccentPreset;
  return LEGACY_ACCENT_PRESET_ALIAS_MAP[value] ?? fallback;
};

export const getThemeColorPresetMeta = (
  value: unknown,
  fallback: AccentPreset = DEFAULT_ACCENT_PRESET
): ThemeColorPresetMeta => THEME_COLOR_PRESET_MAP[normalizeAccentPresetKey(value, fallback)];
