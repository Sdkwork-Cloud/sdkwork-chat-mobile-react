import React, { useEffect, useState } from 'react';
import { CellGroup, CellItem, Navbar, Switch, Toast } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';
import { settingsService } from '../services/SettingsService';

interface SettingsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onAccountClick?: () => void;
  onModelSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onThemeClick?: () => void;
  onGeneralClick?: () => void;
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
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  t,
  onBack,
  onAccountClick,
  onModelSettingsClick,
  onNotificationsClick,
  onThemeClick,
  onGeneralClick,
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
      Toast.success(`${tr('settings.storage_cleaned', 'Freed storage')} ${storageSize}`);
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

  const handleToggleOpenAIAssistant = (checked: boolean) => {
    setOpenAIAssistantEnabled(checked);
    void updateConfig({ openAIAssistantEnabled: checked });
  };

  const handleLogout = async () => {
    if (window.confirm(tr('settings.logout_confirm', 'Are you sure you want to log out?'))) {
      Toast.loading(tr('common.loading', 'Loading...'));
      await new Promise((r) => setTimeout(r, 500));
      Toast.success(tr('settings.logout_success', 'Logged out'));
      onLogout?.();
    }
  };

  const renderCell = (
    title: string,
    options?: {
      description?: string;
      value?: React.ReactNode;
      isLink?: boolean;
      toggle?: boolean;
      checked?: boolean;
      onToggle?: (checked: boolean) => void;
      onClick?: () => void;
      noBorder?: boolean;
      danger?: boolean;
      center?: boolean;
    }
  ) => {
    const rightValue = options?.toggle ? (
      <Switch checked={!!options.checked} onChange={(next) => options.onToggle?.(next)} />
    ) : (
      options?.value
    );

    return (
      <CellItem
        title={title}
        description={options?.description}
        value={rightValue}
        isLink={Boolean(options?.isLink && !options?.toggle)}
        onClick={options?.toggle ? undefined : options?.onClick}
        noBorder={options?.noBorder}
        danger={options?.danger}
        center={options?.center}
      />
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
      <Navbar title={tr('settings.title', 'Settings')} onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <CellGroup title={tr('settings.groups.account', 'Account & Security')}>
          {renderCell(tr('settings.account', 'Account'), { isLink: true, onClick: onAccountClick })}
          {renderCell(tr('settings.model_settings', 'Model Settings'), {
            description: tr('settings.labels.model_desc', 'Configure AI model services and parameters'),
            isLink: true,
            onClick: onModelSettingsClick,
            noBorder: true,
          })}
        </CellGroup>

        <CellGroup title={tr('settings.groups.general', 'General')}>
          {renderCell(tr('settings.general', 'General'), { isLink: true, onClick: onGeneralClick })}
          {renderCell(tr('settings.notifications', 'Notifications'), { isLink: true, onClick: onNotificationsClick })}
          {renderCell(tr('settings.openai_assistant', 'OpenChat AI Assistant'), {
            description: tr('settings.openai_assistant_desc', 'Show floating assistant button on every page'),
            toggle: true,
            checked: openAIAssistantEnabled,
            onToggle: handleToggleOpenAIAssistant,
          })}
          {renderCell(tr('settings.config_center.title', 'Configuration Center'), {
            description: tr('settings.labels.config_center_desc', 'System mode, preset, accent color, font style and scale'),
            isLink: true,
            onClick: onThemeClick,
          })}
          {renderCell(tr('settings.language', 'Language'), { isLink: true, onClick: onLanguageClick, noBorder: true })}
        </CellGroup>

        <CellGroup title={tr('settings.groups.system', 'System')}>
          {renderCell(tr('settings.storage', 'Storage'), { value: storageSize, isLink: true, onClick: handleStorageClick })}
          {renderCell(tr('settings.feedback', 'Feedback'), { isLink: true, onClick: onFeedbackClick })}
          {renderCell(tr('settings.about', 'About'), {
            value: tr('settings.version', 'v3.0.0 Stable'),
            isLink: true,
            onClick: onAboutClick,
            noBorder: true,
          })}
        </CellGroup>

        <CellGroup>
          {renderCell(tr('settings.logout', 'Log Out'), {
            onClick: handleLogout,
            noBorder: true,
            danger: true,
            center: true,
          })}
        </CellGroup>
      </div>
    </div>
  );
};

export default SettingsPage;
