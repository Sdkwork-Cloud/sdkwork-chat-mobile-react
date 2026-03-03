
import React from 'react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';

const IconWrapper: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
    <div style={{
        width: '28px', height: '28px', borderRadius: '6px',
        background: color, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px'
    }}>
        {children}
    </div>
);

interface ModelSettingsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onModelDetail?: (domain: string, title: string) => void;
}

export const ModelSettingsPage: React.FC<ModelSettingsPageProps> = ({
  t,
  onBack,
  onModelDetail,
}) => {
  const { t: settingsT } = useSettings();
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

  const handleNav = (domain: string, title: string) => {
      onModelDetail?.(domain, title);
  };

  const renderCell = (
    title: string,
    label: string,
    icon: React.ReactNode,
    onClick?: () => void
  ) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        background: 'var(--bg-card)',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: '0.5px solid var(--border-color)',
      }}
    >
      <div style={{ marginRight: '12px' }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" style={{ opacity: 0.5 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)' }}>
      <Navbar title={tr('settings.model_settings', 'Model Settings')} onBack={onBack} />
      
      <div style={{ padding: '16px 16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {tr('settings.model_desc', 'Configure AI model services')}
      </div>

      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(
          tr('settings.models.llm', 'LLM'),
          tr('settings.models.llm_desc', 'Chat, generation, coding'),
          <IconWrapper color="#2979FF">💬</IconWrapper>,
          () => handleNav('text', tr('settings.models.llm', 'LLM'))
        )}
        {renderCell(
          tr('settings.models.image', 'Image Model'),
          tr('settings.models.image_desc', 'Generate and edit images'),
          <IconWrapper color="#FF9C6E">🎨</IconWrapper>,
          () => handleNav('image', tr('settings.models.image', 'Image Model'))
        )}
        {renderCell(
          tr('settings.models.video', 'Video Model'),
          tr('settings.models.video_desc', 'Generate and edit videos'),
          <IconWrapper color="#95DE64">🎬</IconWrapper>,
          () => handleNav('video', tr('settings.models.video', 'Video Model'))
        )}
        {renderCell(
          tr('settings.models.tts', 'Speech Model'),
          tr('settings.models.tts_desc', 'Speech synthesis and voice tasks'),
          <IconWrapper color="#FF85C0">🎙️</IconWrapper>,
          () => handleNav('speech', tr('settings.models.tts', 'Speech Model'))
        )}
        {renderCell(
          tr('settings.models.music', 'Music Model'),
          tr('settings.models.music_desc', 'AI music generation'),
          <IconWrapper color="#B37FEB">🎵</IconWrapper>,
          () => handleNav('music', tr('settings.models.music', 'Music Model'))
        )}
      </div>

      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
        {tr('settings.footer_copyright', 'OpenChat AI Architecture v3.0')}
      </div>
    </div>
  );
};

export default ModelSettingsPage;
