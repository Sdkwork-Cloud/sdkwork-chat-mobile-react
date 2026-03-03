
import React, { useEffect, useState } from 'react';
import { Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';
import { settingsService } from '../services/SettingsService';

interface SettingsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onAccountClick?: () => void;
  onModelSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onThemeClick?: () => void;
  onLanguageClick?: () => void;
  onStorageClick?: () => void;
  onFeedbackClick?: () => void;
  onAboutClick?: () => void;
  onLogout?: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  t,
  onBack,
  onAccountClick,
  onModelSettingsClick,
  onNotificationsClick,
  onThemeClick,
  onLanguageClick,
  onStorageClick,
  onFeedbackClick,
  onAboutClick,
  onLogout,
}) => {
  const { t: settingsT, config, updateConfig } = useSettings();
  const [storageSize, setStorageSize] = useState('...');
  const [openAIAssistantEnabled, setOpenAIAssistantEnabled] = useState(false);

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

  useEffect(() => {
    let disposed = false;
    void settingsService.estimateStorageUsage().then((bytes) => {
      if (disposed) return;
      setStorageSize(formatBytes(bytes));
    });
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    setOpenAIAssistantEnabled(config?.openAIAssistantEnabled ?? false);
  }, [config?.openAIAssistantEnabled]);

  const handleClean = () => {
    Toast.loading(tr('settings.storage_cleaning', 'Cleaning cache...'));
    setTimeout(() => {
      Toast.success(tr('settings.storage_cleaned', 'Freed storage') + ` ${storageSize}`);
      setStorageSize('0 B');
    }, 1500);
  };

  const handleStorageClick = () => {
    if (onStorageClick) {
      onStorageClick();
      return;
    }
    handleClean();
  };

  const handleToggleOpenAIAssistant = () => {
    const next = !openAIAssistantEnabled;
    setOpenAIAssistantEnabled(next);
    void updateConfig({ openAIAssistantEnabled: next });
  };

  const handleLogout = async () => {
    if (window.confirm(tr('settings.logout_confirm', 'Are you sure you want to log out?'))) {
      Toast.loading(tr('common.loading', 'Loading...'));
      await new Promise(r => setTimeout(r, 500));
      Toast.success(tr('settings.logout_success', 'Logged out'));
      onLogout?.();
    }
  };

  const renderCell = (
    title: string,
    options?: {
      label?: string;
      value?: string;
      isLink?: boolean;
      toggle?: boolean;
      checked?: boolean;
      onToggle?: () => void;
      onClick?: () => void;
    }
  ) => (
    <div
      onClick={options?.toggle ? undefined : options?.onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        background: 'var(--bg-card)',
        cursor: options?.onClick ? 'pointer' : 'default',
        borderBottom: '0.5px solid var(--border-color)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{title}</div>
        {options?.label && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {options.label}
          </div>
        )}
      </div>
      {options?.toggle ? (
        <div
          onClick={options.onToggle}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            background: options.checked ? 'var(--primary-color)' : 'var(--border-color)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: options.checked ? '22px' : '2px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'white',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      ) : null}
      {options?.value && !options.toggle ? (
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginRight: options.isLink ? '4px' : 0 }}>
          {options.value}
        </div>
      ) : null}
      {options?.isLink && !options.toggle ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" style={{ opacity: 0.5 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      ) : null}
    </div>
  );

  const renderCellGroup = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-body)' }}>
        {title}
      </div>
      <div style={{ background: 'var(--bg-card)' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
      <Navbar title={tr('settings.title', 'Settings')} onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderCellGroup(tr('settings.groups.account', 'Account & Security'), (
          <>
            {renderCell(tr('settings.account', 'Account'), { isLink: true, onClick: onAccountClick })}
            {renderCell(
              tr('settings.model_settings', 'Model Settings'),
              {
                label: tr('settings.labels.model_desc', 'Configure AI model services and parameters'),
                isLink: true,
                onClick: onModelSettingsClick,
              }
            )}
          </>
        ))}

        {renderCellGroup(tr('settings.groups.general', 'General'), (
          <>
            {renderCell(tr('settings.notifications', 'Notifications'), { isLink: true, onClick: onNotificationsClick })}
            {renderCell(tr('settings.openai_assistant', 'OpenChat AI Assistant'), {
              label: tr('settings.openai_assistant_desc', 'Show floating assistant button on every page'),
              toggle: true,
              checked: openAIAssistantEnabled,
              onToggle: handleToggleOpenAIAssistant,
            })}
            {renderCell(
              tr('settings.config_center.title', 'Configuration Center'),
              {
                label: tr('settings.labels.config_center_desc', 'System mode, preset, accent color, font style and scale'),
                isLink: true,
                onClick: onThemeClick,
              }
            )}
            {renderCell(tr('settings.language', 'Language'), { isLink: true, onClick: onLanguageClick })}
          </>
        ))}

        {renderCellGroup(tr('settings.groups.system', 'System'), (
          <>
            {renderCell(tr('settings.storage', 'Storage'), { value: storageSize, isLink: true, onClick: handleStorageClick })}
            {renderCell(tr('settings.feedback', 'Feedback'), { isLink: true, onClick: onFeedbackClick })}
            {renderCell(tr('settings.about', 'About'), { value: tr('settings.version', 'v3.0.0 Stable'), isLink: true, onClick: onAboutClick })}
          </>
        ))}

        <div style={{ marginTop: '32px', padding: '0 16px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--bg-card)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--danger)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}
          >
            {tr('settings.logout', 'Log Out')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
