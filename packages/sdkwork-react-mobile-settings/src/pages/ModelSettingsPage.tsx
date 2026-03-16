import React from 'react';
import { CellGroup, CellItem, Icon, Navbar } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';
import { resolveSettingsTranslation } from '../i18n/resolveSettingsTranslation';

const IconWrapper: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span
    style={{
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      background: color,
      color: 'white',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
    }}
  >
    {children}
  </span>
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
      return resolveSettingsTranslation({ appT: t, settingsT, key, fallback });
    },
    [settingsT, t]
  );

  const handleNav = (domain: string, title: string) => {
    onModelDetail?.(domain, title);
  };

  const renderCell = (
    title: string,
    description: string,
    icon: React.ReactNode,
    onClick?: () => void,
    noBorder = false
  ) => (
    <CellItem
      title={title}
      description={description}
      icon={icon}
      isLink
      onClick={onClick}
      noBorder={noBorder}
    />
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)' }}>
      <Navbar title={tr('settings.model_settings', 'Model Settings')} onBack={onBack} />

      <CellGroup title={tr('settings.model_desc', 'Configure AI model services')}>
        {renderCell(
          tr('settings.models.llm', 'LLM'),
          tr('settings.models.llm_desc', 'Chat, generation, coding'),
          <IconWrapper color="#2979FF"><Icon name="sparkles" size={16} color="#fff" /></IconWrapper>,
          () => handleNav('text', tr('settings.models.llm', 'LLM'))
        )}
        {renderCell(
          tr('settings.models.image', 'Image Model'),
          tr('settings.models.image_desc', 'Generate and edit images'),
          <IconWrapper color="#FF9C6E"><Icon name="picture" size={16} color="#fff" /></IconWrapper>,
          () => handleNav('image', tr('settings.models.image', 'Image Model'))
        )}
        {renderCell(
          tr('settings.models.video', 'Video Model'),
          tr('settings.models.video_desc', 'Generate and edit videos'),
          <IconWrapper color="#95DE64"><Icon name="video-channel" size={16} color="#fff" /></IconWrapper>,
          () => handleNav('video', tr('settings.models.video', 'Video Model'))
        )}
        {renderCell(
          tr('settings.models.tts', 'Speech Model'),
          tr('settings.models.tts_desc', 'Speech synthesis and voice tasks'),
          <IconWrapper color="#FF85C0"><Icon name="voice" size={16} color="#fff" /></IconWrapper>,
          () => handleNav('speech', tr('settings.models.tts', 'Speech Model'))
        )}
        {renderCell(
          tr('settings.models.music', 'Music Model'),
          tr('settings.models.music_desc', 'AI music generation'),
          <IconWrapper color="#B37FEB"><Icon name="spark" size={16} color="#fff" /></IconWrapper>,
          () => handleNav('music', tr('settings.models.music', 'Music Model'))
        )}
        {renderCell(
          tr('settings.models.sound_effect', 'Sound Effect Model'),
          tr('settings.models.sound_effect_desc', 'AI sound effects generation'),
          <IconWrapper color="#36CFC9"><Icon name="voice" size={16} color="#fff" /></IconWrapper>,
          () => handleNav('soundEffect', tr('settings.models.sound_effect', 'Sound Effect Model')),
          true
        )}
      </CellGroup>

      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
        {tr('settings.footer_copyright', 'OpenChat AI Architecture v3.0')}
      </div>
    </div>
  );
};

export default ModelSettingsPage;

