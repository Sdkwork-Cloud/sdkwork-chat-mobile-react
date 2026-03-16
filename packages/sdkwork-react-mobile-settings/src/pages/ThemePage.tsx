import React, { useMemo, useState } from 'react';
import { Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';
import { resolveSettingsTranslation } from '../i18n/resolveSettingsTranslation';
import {
  DEFAULT_ACCENT_PRESET,
  THEME_COLOR_PRESET_HEX_MAP,
  THEME_COLOR_PRESETS,
  type ThemeColorPresetMeta,
} from '../themeColorPresets';
import type { AccentPreset, AppearanceMode, FontFamilyPreset, ThemePreset } from '../types';

interface ThemePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

const THEME_PRESET_OPTIONS: Array<{
  key: ThemePreset;
  titleKey: string;
  titleFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
}> = [
  {
    key: 'wechat',
    titleKey: 'settings.config_center.preset_wechat',
    titleFallback: 'WeChat',
    descriptionKey: 'settings.config_center.preset_wechat_desc',
    descriptionFallback: 'Balanced and familiar',
  },
  {
    key: 'classic',
    titleKey: 'settings.config_center.preset_classic',
    titleFallback: 'Classic',
    descriptionKey: 'settings.config_center.preset_classic_desc',
    descriptionFallback: 'Neutral and clean',
  },
  {
    key: 'midnight',
    titleKey: 'settings.config_center.preset_midnight',
    titleFallback: 'Midnight',
    descriptionKey: 'settings.config_center.preset_midnight_desc',
    descriptionFallback: 'Cool dark blue tone',
  },
  {
    key: 'oled',
    titleKey: 'settings.config_center.preset_oled',
    titleFallback: 'OLED',
    descriptionKey: 'settings.config_center.preset_oled_desc',
    descriptionFallback: 'High-contrast dark',
  },
];

const FONT_OPTIONS: Array<{ key: FontFamilyPreset; preview: string }> = [
  { key: 'system', preview: 'Aa Sans' },
  { key: 'rounded', preview: 'Aa Round' },
  { key: 'serif', preview: 'Aa Serif' },
  { key: 'mono', preview: 'Aa Mono' },
];

const normalizeHex = (value: string): string => {
  let normalized = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    normalized = normalized
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '';
  return `#${normalized.toUpperCase()}`;
};

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = normalizeHex(hex);
  if (!normalized) return `rgba(0, 0, 0, ${alpha})`;
  const raw = normalized.replace('#', '');
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ThemePage: React.FC<ThemePageProps> = ({ t, onBack }) => {
  const { t: settingsT, config, updateConfig, resetAppearanceConfig } = useSettings();
  const [customAccentInput, setCustomAccentInput] = useState('');

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      return resolveSettingsTranslation({ appT: t, settingsT, key, fallback });
    },
    [settingsT, t]
  );

  const appearanceMode: AppearanceMode = (config?.appearanceMode as AppearanceMode) || 'system';
  const themePreset: ThemePreset = (config?.themePreset as ThemePreset) || 'wechat';
  const accentType = config?.accentType || 'preset';
  const accentPreset: AccentPreset = (config?.accentPreset as AccentPreset) || DEFAULT_ACCENT_PRESET;
  const accentHex = config?.accentHex || THEME_COLOR_PRESET_HEX_MAP[DEFAULT_ACCENT_PRESET];
  const fontScale = config?.fontScale || 1;
  const fontFamilyPreset: FontFamilyPreset = (config?.fontFamilyPreset as FontFamilyPreset) || 'system';
  const fontSize = Math.round(16 * fontScale);

  const activeThemeColor = useMemo(
    () =>
      THEME_COLOR_PRESETS.find((item) => item.key === accentPreset) ||
      THEME_COLOR_PRESETS.find((item) => item.key === DEFAULT_ACCENT_PRESET)!,
    [accentPreset]
  );

  const activeAccent = useMemo(
    () =>
      accentType === 'custom'
        ? accentHex
        : THEME_COLOR_PRESET_HEX_MAP[accentPreset] || THEME_COLOR_PRESET_HEX_MAP[DEFAULT_ACCENT_PRESET],
    [accentHex, accentPreset, accentType]
  );

  const updateMode = (mode: AppearanceMode) => {
    void updateConfig({ appearanceMode: mode });
  };

  const updatePreset = (preset: ThemePreset) => {
    void updateConfig({ themePreset: preset });
  };

  const updateAccentPreset = (preset: AccentPreset) => {
    void updateConfig({
      accentType: 'preset',
      accentPreset: preset,
    });
  };

  const applyCustomAccent = () => {
    const normalized = normalizeHex(customAccentInput);
    if (!normalized) {
      Toast.info(tr('settings.config_center.accent_invalid', 'Invalid color. Use #RRGGBB or #RGB.'));
      return;
    }
    void updateConfig({
      accentType: 'custom',
      accentHex: normalized,
    });
    Toast.success(tr('settings.config_center.applied', 'Applied'));
  };

  const updateFontScale = (nextScale: number) => {
    const clamped = Math.min(1.35, Math.max(0.85, nextScale));
    void updateConfig({
      fontScale: clamped,
      fontSize: Math.round(16 * clamped),
    });
  };

  const updateFontFamilyPreset = (preset: FontFamilyPreset) => {
    void updateConfig({ fontFamilyPreset: preset });
  };

  const handleResetAppearance = async () => {
    const shouldReset =
      typeof window === 'undefined' || window.confirm(tr('settings.config_center.reset_confirm', 'Reset appearance settings to defaults?'));
    if (!shouldReset) return;
    await resetAppearanceConfig();
    setCustomAccentInput('');
    Toast.success(tr('settings.config_center.reset_done', 'Appearance defaults restored'));
  };

  const renderSectionTitle = (title: string, description?: string) => (
    <div style={{ padding: '12px 16px 8px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      {description ? (
        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>{description}</div>
      ) : null}
    </div>
  );

  const renderChip = (label: string, selected: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: selected ? `1px solid ${activeAccent}` : '1px solid var(--border-color)',
        background: selected ? hexToRgba(activeAccent, 0.12) : 'var(--bg-card)',
        color: selected ? activeAccent : 'var(--text-primary)',
        borderRadius: '999px',
        padding: '8px 12px',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );

  const renderPresetCard = (
    preset: ThemePreset,
    title: string,
    description: string
  ) => {
    const selected = themePreset === preset;
    return (
      <button
        key={preset}
        type="button"
        onClick={() => updatePreset(preset)}
        style={{
          textAlign: 'left',
          border: selected ? `1px solid ${activeAccent}` : '1px solid var(--border-color)',
          background: selected ? hexToRgba(activeAccent, 0.08) : 'var(--bg-card)',
          borderRadius: '14px',
          padding: '12px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          {selected ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                background: hexToRgba(activeAccent, 0.14),
                color: activeAccent,
              }}
            >
              {tr('settings.config_center.selected', 'Selected')}
            </span>
          ) : null}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{description}</div>
      </button>
    );
  };

  const renderThemeColorCard = (preset: ThemeColorPresetMeta) => {
    const selected = accentType === 'preset' && accentPreset === preset.key;
    const label = tr(preset.labelKey, preset.labelFallback);
    const description = tr(preset.descriptionKey, preset.descriptionFallback);
    const previewGradient = `linear-gradient(135deg, ${preset.light.gradientStart} 0%, ${preset.light.gradientEnd} 100%)`;

    return (
      <button
        key={preset.key}
        type="button"
        onClick={() => updateAccentPreset(preset.key)}
        data-theme-color-option={preset.key}
        data-theme-color-selected={selected ? 'true' : 'false'}
        style={{
          textAlign: 'left',
          border: selected ? `1px solid ${preset.accent}` : '1px solid var(--border-color)',
          background: selected
            ? `linear-gradient(180deg, ${hexToRgba(preset.light.gradientStart, 0.18)} 0%, ${hexToRgba(preset.light.gradientEnd, 0.08)} 100%)`
            : 'var(--bg-card)',
          boxShadow: selected ? `0 10px 24px ${hexToRgba(preset.accent, 0.16)}` : 'none',
          borderRadius: '16px',
          padding: '12px',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            height: '42px',
            borderRadius: '12px',
            background: previewGradient,
            boxShadow: `inset 0 1px 0 ${hexToRgba('#FFFFFF', 0.18)}`,
          }}
        />
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          {selected ? (
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: preset.accent,
                boxShadow: `0 0 0 4px ${hexToRgba(preset.accent, 0.18)}`,
                flexShrink: 0,
              }}
            />
          ) : null}
        </div>
        <div style={{ marginTop: '6px', minHeight: '36px', fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          {description}
        </div>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: preset.accent,
              flexShrink: 0,
            }}
          />
          <span>{preset.accent}</span>
        </div>
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)' }}>
      <Navbar title={tr('settings.config_center.title', 'Configuration Center')} onBack={onBack} />

      {renderSectionTitle(
        tr('settings.config_center.mode_title', 'Display Mode'),
        tr('settings.config_center.mode_desc', 'Follow system or force a mode')
      )}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {renderChip(tr('settings.config_center.mode_system', 'System'), appearanceMode === 'system', () => updateMode('system'))}
        {renderChip(tr('settings.config_center.mode_light', 'Light'), appearanceMode === 'light', () => updateMode('light'))}
        {renderChip(tr('settings.config_center.mode_dark', 'Dark'), appearanceMode === 'dark', () => updateMode('dark'))}
      </div>

      {renderSectionTitle(
        tr('settings.config_center.preset_title', 'Theme Preset'),
        tr('settings.config_center.preset_desc', 'Visual style direction')
      )}
      <div style={{ padding: '0 16px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {THEME_PRESET_OPTIONS.map((option) =>
          renderPresetCard(
            option.key,
            tr(option.titleKey, option.titleFallback),
            tr(option.descriptionKey, option.descriptionFallback)
          )
        )}
      </div>

      {renderSectionTitle(
        tr('settings.config_center.accent_title', 'Theme Colors'),
        tr('settings.config_center.accent_desc', 'Curated app-wide accent palettes')
      )}
      <div style={{ padding: '0 16px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {THEME_COLOR_PRESETS.map((preset) => renderThemeColorCard(preset))}
      </div>

      {renderSectionTitle(
        tr('settings.config_center.accent_custom_title', 'Advanced Custom Color'),
        tr('settings.config_center.accent_custom_desc', 'Use a precise brand color when presets are not enough')
      )}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          value={customAccentInput}
          onChange={(event) => setCustomAccentInput(event.target.value)}
          placeholder="#RRGGBB"
          style={{
            flex: 1,
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '10px 12px',
            fontSize: '13px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="button"
          onClick={applyCustomAccent}
          style={{
            border: 'none',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 600,
            background: 'var(--primary-color)',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          {tr('settings.config_center.apply', 'Apply')}
        </button>
      </div>
      <div style={{ padding: '0 16px 8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        {tr(
          'settings.config_center.accent_custom_hint',
          'Custom color only overrides the accent. Surfaces and shadows still follow the selected theme preset.'
        )}
      </div>

      {renderSectionTitle(
        tr('settings.config_center.font_title', 'Global Font Scale'),
        tr('settings.config_center.font_desc', 'Applies to the entire app')
      )}
      <div style={{ padding: '0 16px 8px' }}>
        <input
          type="range"
          min={0.85}
          max={1.35}
          step={0.05}
          value={fontScale}
          onChange={(event) => updateFontScale(Number(event.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          {tr('settings.config_center.font_now', 'Current')}: {fontScale.toFixed(2)}x ({fontSize}px)
        </div>
      </div>

      {renderSectionTitle(
        tr('settings.config_center.font_family_title', 'Font Style'),
        tr('settings.config_center.font_family_desc', 'Choose global typography personality')
      )}
      <div style={{ padding: '0 16px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {FONT_OPTIONS.map((option) => {
          const selected = fontFamilyPreset === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => updateFontFamilyPreset(option.key)}
              style={{
                border: selected ? `1px solid ${activeAccent}` : '1px solid var(--border-color)',
                borderRadius: '12px',
                background: selected ? hexToRgba(activeAccent, 0.08) : 'var(--bg-card)',
                color: selected ? activeAccent : 'var(--text-primary)',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                {tr(`settings.config_center.font_family_${option.key}`, option.key)}
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>{option.preview}</div>
            </button>
          );
        })}
      </div>

      {renderSectionTitle(tr('settings.config_center.preview_title', 'Live Preview'))}
      <div style={{ padding: '0 16px 24px' }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontSize: `${16 * fontScale}px`, fontWeight: 600, color: 'var(--text-primary)' }}>
              {tr('settings.config_center.preview_title_text', 'Conversation title')}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>12:30</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: `${13 * fontScale}px`, color: 'var(--text-secondary)' }}>
            {tr('settings.config_center.preview_body', 'Theme, color, and font changes are applied instantly.')}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '999px',
                padding: '6px 10px',
                background: hexToRgba(activeAccent, 0.1),
                color: activeAccent,
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: activeAccent,
                  display: 'inline-block',
                }}
              />
              {accentType === 'custom'
                ? tr('settings.config_center.accent_custom_badge', 'Custom Accent')
                : tr(activeThemeColor.labelKey, activeThemeColor.labelFallback)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{activeAccent}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 24px' }}>
        <button
          type="button"
          onClick={() => {
            void handleResetAppearance();
          }}
          style={{
            width: '100%',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '11px 12px',
            cursor: 'pointer',
          }}
        >
          {tr('settings.config_center.reset', 'Reset Appearance Defaults')}
        </button>
      </div>
    </div>
  );
};

export default ThemePage;
