import React, { useMemo, useState } from 'react';
import { Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';

type AppearanceMode = 'system' | 'light' | 'dark';
type ThemePreset = 'wechat' | 'classic' | 'midnight' | 'oled';
type AccentPreset = 'blue' | 'teal' | 'green' | 'orange' | 'rose' | 'violet';
type FontFamilyPreset = 'system' | 'rounded' | 'serif' | 'mono';

interface ThemePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

const ACCENT_OPTIONS: Array<{ key: AccentPreset; color: string }> = [
  { key: 'blue', color: '#2979FF' },
  { key: 'teal', color: '#14B8A6' },
  { key: 'green', color: '#22C55E' },
  { key: 'orange', color: '#F97316' },
  { key: 'rose', color: '#F43F5E' },
  { key: 'violet', color: '#8B5CF6' },
];
const FONT_OPTIONS: Array<{ key: FontFamilyPreset; preview: string }> = [
  { key: 'system', preview: 'Aa 系统' },
  { key: 'rounded', preview: 'Aa 圆角' },
  { key: 'serif', preview: 'Aa 衬线' },
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

export const ThemePage: React.FC<ThemePageProps> = ({ t, onBack }) => {
  const { t: settingsT, config, updateConfig, resetAppearanceConfig } = useSettings();
  const [customAccentInput, setCustomAccentInput] = useState('');

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const appValue = t?.(key);
      if (appValue && appValue !== key) return appValue;
      const settingsValue = settingsT?.(key);
      if (settingsValue && settingsValue !== key) return settingsValue;
      return fallback;
    },
    [settingsT, t]
  );

  const appearanceMode: AppearanceMode = (config?.appearanceMode as AppearanceMode) || 'system';
  const themePreset: ThemePreset = (config?.themePreset as ThemePreset) || 'wechat';
  const accentType = config?.accentType || 'preset';
  const accentPreset: AccentPreset = (config?.accentPreset as AccentPreset) || 'blue';
  const accentHex = config?.accentHex || '#2979FF';
  const fontScale = config?.fontScale || 1;
  const fontFamilyPreset: FontFamilyPreset = (config?.fontFamilyPreset as FontFamilyPreset) || 'system';
  const fontSize = Math.round(16 * fontScale);

  const activeAccent = useMemo(() => (accentType === 'custom' ? accentHex : ACCENT_OPTIONS.find((item) => item.key === accentPreset)?.color || '#2979FF'), [accentHex, accentPreset, accentType]);

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
        border: selected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
        background: selected ? 'rgba(41, 121, 255, 0.12)' : 'var(--bg-card)',
        color: selected ? 'var(--primary-color)' : 'var(--text-primary)',
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

  const renderPresetCard = (preset: ThemePreset, title: string, description: string) => {
    const selected = themePreset === preset;
    return (
      <button
        key={preset}
        type="button"
        onClick={() => updatePreset(preset)}
        style={{
          textAlign: 'left',
          border: selected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
          background: selected ? 'rgba(41, 121, 255, 0.08)' : 'var(--bg-card)',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          {selected ? <span style={{ color: 'var(--primary-color)', fontSize: '14px' }}>●</span> : null}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{description}</div>
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
        {renderPresetCard('wechat', tr('settings.config_center.preset_wechat', 'WeChat'), tr('settings.config_center.preset_wechat_desc', 'Balanced and familiar'))}
        {renderPresetCard('classic', tr('settings.config_center.preset_classic', 'Classic'), tr('settings.config_center.preset_classic_desc', 'Neutral and clean'))}
        {renderPresetCard('midnight', tr('settings.config_center.preset_midnight', 'Midnight'), tr('settings.config_center.preset_midnight_desc', 'Cool dark blue tone'))}
        {renderPresetCard('oled', tr('settings.config_center.preset_oled', 'OLED'), tr('settings.config_center.preset_oled_desc', 'High-contrast dark'))}
      </div>

      {renderSectionTitle(
        tr('settings.config_center.accent_title', 'Accent Color'),
        tr('settings.config_center.accent_desc', 'Primary actions and highlights')
      )}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {ACCENT_OPTIONS.map((accent) => {
          const selected = accentType === 'preset' && accentPreset === accent.key;
          return (
            <button
              key={accent.key}
              type="button"
              onClick={() => updateAccentPreset(accent.key)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: selected ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                background: accent.color,
                cursor: 'pointer',
              }}
              aria-label={accent.key}
            />
          );
        })}
      </div>
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          value={customAccentInput}
          onChange={(event) => setCustomAccentInput(event.target.value)}
          placeholder="#RRGGBB"
          style={{
            flex: 1,
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
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
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: 600,
            background: 'var(--primary-color)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {tr('settings.config_center.apply', 'Apply')}
        </button>
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
                border: selected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                borderRadius: '12px',
                background: selected ? 'rgba(41, 121, 255, 0.08)' : 'var(--bg-card)',
                color: selected ? 'var(--primary-color)' : 'var(--text-primary)',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{tr(`settings.config_center.font_family_${option.key}`, option.key)}</div>
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
            borderRadius: '14px',
            padding: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: `${16 * fontScale}px`, fontWeight: 600, color: 'var(--text-primary)' }}>
              {tr('settings.config_center.preview_title_text', 'Conversation title')}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>12:30</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: `${13 * fontScale}px`, color: 'var(--text-secondary)' }}>
            {tr('settings.config_center.preview_body', 'Theme, color, and font changes are applied instantly.')}
          </div>
          <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: activeAccent,
                display: 'inline-block',
              }}
            />
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
