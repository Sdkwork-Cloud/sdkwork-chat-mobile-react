import React, { useEffect, useMemo, useState } from 'react';
import { ActionSheet, CellGroup, CellItem, Navbar, Switch, Toast } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';
import { settingsService } from '../services/SettingsService';

type GeneralSection =
  | 'general'
  | 'notifications'
  | 'about'
  | 'storage'
  | 'cards'
  | 'favorite-detail'
  | 'generic'
  | string;

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const base = 1024;
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(base)));
  const value = bytes / Math.pow(base, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

interface GeneralPageProps {
  t?: (key: string) => string;
  section?: GeneralSection;
  title?: string;
  source?: string;
  onBack?: () => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
  onSetLocale?: (locale: 'zh-CN' | 'en-US') => void;
  detailTitle?: string;
  detailContent?: string;
  detailType?: string;
  detailSource?: string;
  detailTime?: string;
}

export const GeneralPage: React.FC<GeneralPageProps> = ({
  t,
  section,
  title = '',
  source,
  onBack,
  onNavigate,
  onSetLocale,
  detailTitle,
  detailContent,
  detailType,
  detailSource,
  detailTime,
}) => {
  const { t: settingsT, config, updateConfig, language, setLanguage } = useSettings();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayVideo, setAutoPlayVideo] = useState(true);
  const [landscapeModeEnabled, setLandscapeModeEnabled] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [personalizedRecommendation, setPersonalizedRecommendation] = useState(true);
  const [notificationDetailVisible, setNotificationDetailVisible] = useState(true);
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  const [notificationVibrationEnabled, setNotificationVibrationEnabled] = useState(true);
  const [storageUsage, setStorageUsage] = useState('...');
  const [isStorageLoading, setIsStorageLoading] = useState(false);

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
    if (!config) return;
    setNotificationsEnabled(config.notificationsEnabled ?? true);
    setAutoPlayVideo(config.autoPlayVideo ?? true);
    setLandscapeModeEnabled(config.landscapeModeEnabled ?? false);
    setNotificationDetailVisible(config.notificationDetailVisible ?? true);
    setNotificationSoundEnabled(config.notificationSoundEnabled ?? true);
    setNotificationVibrationEnabled(config.notificationVibrationEnabled ?? true);
  }, [config]);

  const resolvedSection = useMemo(() => {
    if (section) return section;
    const normalizedTitle = (title || '').trim().toLowerCase();

    const titleAliases: Array<{ section: GeneralSection; aliases: string[] }> = [
      { section: 'general', aliases: ['general', '\u901a\u7528'] },
      { section: 'notifications', aliases: ['notifications', '\u901a\u77e5'] },
      { section: 'about', aliases: ['about', '\u5173\u4e8e'] },
      { section: 'storage', aliases: ['storage', '\u5b58\u50a8\u7a7a\u95f4'] },
      { section: 'cards', aliases: ['cards', '\u5361\u5305'] },
      { section: 'favorite-detail', aliases: ['favorite detail', '\u6536\u85cf\u8be6\u60c5'] },
    ];

    const matched = titleAliases.find((item) => item.aliases.includes(normalizedTitle));
    return matched?.section || 'generic';
  }, [section, title]);

  const handleLanguageChange = () => {
    ActionSheet.showActions({
      title: tr('settings.language', 'Language'),
      actions: [
        { text: tr('settings.language_zh', 'Simplified Chinese'), key: 'zh-CN' },
        { text: tr('settings.language_en', 'English'), key: 'en-US' },
      ],
    }).then((item) => {
      if (!item?.key) return;
      const nextLocale = item.key as 'zh-CN' | 'en-US';
      setLanguage(nextLocale);
      onSetLocale?.(nextLocale);
      Toast.success(
        nextLocale === 'zh-CN'
          ? tr('settings.language_switched_zh', 'Switched to Chinese')
          : tr('settings.language_switched_en', 'Switched to English')
      );
    });
  };

  const toggleNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked);
    void updateConfig({ notificationsEnabled: checked });
  };

  const toggleAutoPlayVideo = (checked: boolean) => {
    setAutoPlayVideo(checked);
    void updateConfig({ autoPlayVideo: checked });
  };

  const toggleLandscapeMode = (checked: boolean) => {
    setLandscapeModeEnabled(checked);
    void updateConfig({ landscapeModeEnabled: checked });
  };

  const toggleNotificationDetail = (checked: boolean) => {
    setNotificationDetailVisible(checked);
    void updateConfig({ notificationDetailVisible: checked });
  };

  const toggleNotificationSound = (checked: boolean) => {
    setNotificationSoundEnabled(checked);
    void updateConfig({ notificationSoundEnabled: checked });
  };

  const toggleNotificationVibration = (checked: boolean) => {
    setNotificationVibrationEnabled(checked);
    void updateConfig({ notificationVibrationEnabled: checked });
  };

  const loadStorageUsage = React.useCallback(async () => {
    setIsStorageLoading(true);
    try {
      const usage = await settingsService.estimateStorageUsage();
      setStorageUsage(formatBytes(usage));
    } finally {
      setIsStorageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resolvedSection !== 'storage' && resolvedSection !== 'generic') return;
    void loadStorageUsage();
  }, [loadStorageUsage, resolvedSection]);

  const navigateToStorageSection = () => {
    onNavigate?.('/general', {
      section: 'storage',
      title: tr('settings.storage', 'Storage'),
      ...(source ? { from: source } : {}),
    });
  };

  const navigateToNotificationsSection = () => {
    onNavigate?.('/general', {
      section: 'notifications',
      title: tr('settings.notifications', 'Notifications'),
      ...(source ? { from: source } : {}),
    });
  };

  const openThemeConfig = () => {
    const query = new URLSearchParams({
      section: 'general',
      title: tr('settings.general', 'General'),
      ...(source ? { from: source } : {}),
    }).toString();
    onNavigate?.('/theme', { back: `/general?${query}` });
  };

  const renderCell = (
    label: string,
    options?: {
      description?: string;
      value?: React.ReactNode;
      isLink?: boolean;
      toggle?: boolean;
      checked?: boolean;
      onToggle?: (checked: boolean) => void;
      onClick?: () => void;
      noBorder?: boolean;
    }
  ) => {
    const rightValue = options?.toggle ? (
      <Switch checked={!!options.checked} onChange={(next) => options.onToggle?.(next)} />
    ) : (
      options?.value
    );

    return (
      <CellItem
        title={label}
        description={options?.description}
        value={rightValue}
        isLink={Boolean(options?.isLink && !options?.toggle)}
        onClick={options?.toggle ? undefined : options?.onClick}
        noBorder={options?.noBorder}
      />
    );
  };

  const renderGeneralSection = () => (
    <>
      <CellGroup title={tr('settings.general_sections.appearance', 'Appearance')}>
        {renderCell(tr('settings.chat_background', 'Chat Background'), { isLink: true, onClick: () => onNavigate?.('/settings/background') })}
        {renderCell(tr('settings.font_size', 'Font Size'), {
          value: tr('settings.font_size_standard', 'Standard'),
          isLink: true,
          onClick: openThemeConfig,
        })}
        {renderCell(tr('settings.landscape_mode', 'Landscape Mode'), {
          toggle: true,
          checked: landscapeModeEnabled,
          onToggle: toggleLandscapeMode,
          noBorder: true,
        })}
      </CellGroup>

      <CellGroup title={tr('settings.general_sections.media', 'Media')}>
        {renderCell(tr('settings.autoplay_moments_video', 'Auto-play moments video'), {
          toggle: true,
          checked: autoPlayVideo,
          onToggle: toggleAutoPlayVideo,
        })}
        {renderCell(tr('settings.media_storage', 'Photos, videos, files and calls'), {
          isLink: true,
          onClick: navigateToStorageSection,
          noBorder: true,
        })}
      </CellGroup>

      <CellGroup title={tr('settings.general_sections.system', 'System')}>
        {renderCell(tr('settings.language', 'Language'), {
          value: language === 'zh-CN' ? tr('settings.language_zh', 'Simplified Chinese') : tr('settings.language_en', 'English'),
          isLink: true,
          onClick: handleLanguageChange,
          noBorder: true,
        })}
      </CellGroup>
    </>
  );

  const renderNotificationsSection = () => (
    <>
      <CellGroup title={tr('settings.notifications_sections.system', 'System Notifications')}>
        {renderCell(tr('settings.receive_notifications', 'Receive notifications'), {
          toggle: true,
          checked: notificationsEnabled,
          onToggle: toggleNotifications,
          noBorder: true,
        })}
      </CellGroup>

      {notificationsEnabled ? (
        <CellGroup title={tr('settings.notifications_sections.methods', 'Notification Methods')}>
          {renderCell(tr('settings.notifications_show_detail', 'Show details in notifications'), {
            description: tr('settings.notifications_show_detail_desc', 'When disabled, sender and message preview will be hidden.'),
            toggle: true,
            checked: notificationDetailVisible,
            onToggle: toggleNotificationDetail,
          })}
          {renderCell(tr('settings.notifications_sound', 'Sound'), {
            toggle: true,
            checked: notificationSoundEnabled,
            onToggle: toggleNotificationSound,
          })}
          {renderCell(tr('settings.notifications_vibration', 'Vibration'), {
            toggle: true,
            checked: notificationVibrationEnabled,
            onToggle: toggleNotificationVibration,
            noBorder: true,
          })}
        </CellGroup>
      ) : null}
    </>
  );

  const renderAboutSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #2979FF 0%, #0050E6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(41, 121, 255, 0.25)',
          marginBottom: '16px',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>OpenChat</div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
        {tr('settings.version', 'v3.0.0 Stable')}
      </div>

      <div style={{ width: '100%', marginTop: '24px' }}>
        <CellGroup>
          {renderCell(tr('settings.about_check_update', 'Check updates'), {
            isLink: true,
            noBorder: true,
            onClick: () => {
              Toast.loading(tr('settings.about_checking', 'Checking...'));
              window.setTimeout(() => {
                Toast.success(tr('settings.about_latest', 'Already on latest version'));
              }, 900);
            },
          })}
        </CellGroup>
      </div>

      <div style={{ marginTop: '40px', fontSize: '12px', color: 'var(--text-placeholder)', textAlign: 'center' }}>
        {tr('settings.about_copyright', 'Copyright 2024 OpenChat Inc. All Rights Reserved.')}
      </div>
    </div>
  );

  const renderCardsSection = () => (
    <>
      <CellGroup title={tr('settings.cards.my_coupons', 'My Coupons')}>
        {renderCell(tr('settings.cards.member_trial', 'Membership Trial Card'), {
          value: tr('settings.cards.member_trial_value', '23 days left'),
          isLink: true,
          onClick: () => Toast.info(tr('settings.cards.member_trial_toast', 'Membership benefits are active')),
        })}
        {renderCell(tr('settings.cards.shipping_coupon', 'Shipping Coupon'), {
          value: tr('settings.cards.shipping_coupon_value', '2 available'),
          isLink: true,
          onClick: () => onNavigate?.('/shopping'),
        })}
        {renderCell(tr('settings.cards.mall_coupon', 'Mall Discount Coupon'), {
          value: tr('settings.cards.mall_coupon_value', 'Save 20 on 199'),
          isLink: true,
          onClick: () => onNavigate?.('/shopping'),
        })}
        {renderCell(tr('settings.cards.appointment_coupon', 'Appointment Service Coupon'), {
          value: tr('settings.cards.appointment_coupon_value', '1 available'),
          isLink: true,
          onClick: () => onNavigate?.('/appointments'),
          noBorder: true,
        })}
      </CellGroup>

      <CellGroup title={tr('settings.cards.member_points', 'Membership & Points')}>
        {renderCell(tr('settings.cards.growth', 'Growth Score'), { value: '1260', isLink: true })}
        {renderCell(tr('settings.cards.points', 'Available Points'), { value: '780', isLink: true, noBorder: true })}
      </CellGroup>
    </>
  );

  const renderStorageSection = () => (
    <>
      <CellGroup title={tr('settings.storage', 'Storage')}>
        {renderCell(tr('settings.storage_usage', 'Local usage'), {
          value: isStorageLoading ? tr('common.loading', 'Loading...') : storageUsage,
          isLink: true,
          onClick: () => {
            void loadStorageUsage();
          },
        })}
        {renderCell(tr('settings.storage_clean', 'Refresh estimate'), {
          description: tr('settings.storage_clean_desc', 'Scan current local cache and media usage'),
          isLink: true,
          onClick: () => {
            void loadStorageUsage();
          },
          noBorder: true,
        })}
      </CellGroup>
    </>
  );

  const renderFavoriteDetailSection = () => {
    const typeLabelMap: Record<string, string> = {
      image: tr('settings.favorite_types.image', 'Image'),
      video: tr('settings.favorite_types.video', 'Video'),
      link: tr('settings.favorite_types.link', 'Link'),
      file: tr('settings.favorite_types.file', 'File'),
      doc: tr('settings.favorite_types.doc', 'Document'),
      chat: tr('settings.favorite_types.chat', 'Chat'),
      text: tr('settings.favorite_types.text', 'Note'),
    };
    const typeLabel = typeLabelMap[(detailType || '').toLowerCase()] || tr('settings.favorite_types.default', 'Favorite');

    return (
      <div style={{ padding: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '0.5px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{typeLabel}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45 }}>
              {detailTitle || tr('settings.favorite_detail_default_title', 'Favorite Content')}
            </div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.72, whiteSpace: 'pre-wrap' }}>
              {detailContent || tr('settings.favorite_detail_default_content', 'No additional details available.')}
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {tr('settings.favorite_source', 'Source')}: {detailSource || tr('settings.favorite_source_default', 'My Favorites')}
            </div>
            <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {tr('settings.favorite_time', 'Time')}: {detailTime || '--'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGenericSection = () => (
    <>
      <CellGroup title={tr('settings.generic.common', 'Common Settings')}>
        {renderCell(tr('settings.generic.do_not_disturb', 'Do Not Disturb'), {
          toggle: true,
          checked: doNotDisturb,
          onToggle: setDoNotDisturb,
        })}
        {renderCell(tr('settings.generic.account_security', 'Device and Account Security'), {
          isLink: true,
          onClick: () => onNavigate?.('/account-security'),
        })}
        {renderCell(tr('settings.generic.storage_management', 'Storage Management'), {
          value: isStorageLoading ? tr('common.loading', 'Loading...') : storageUsage,
          isLink: true,
          onClick: navigateToStorageSection,
          noBorder: true,
        })}
      </CellGroup>

      <CellGroup title={tr('settings.generic.privacy', 'Content and Privacy')}>
        {renderCell(tr('settings.generic.privacy_permissions', 'Privacy Permissions'), {
          isLink: true,
          onClick: navigateToNotificationsSection,
        })}
        {renderCell(tr('settings.generic.personalized_recommendation', 'Personalized Recommendation'), {
          toggle: true,
          checked: personalizedRecommendation,
          onToggle: setPersonalizedRecommendation,
          noBorder: true,
        })}
      </CellGroup>
    </>
  );

  const navTitle = useMemo(() => {
    if (resolvedSection === 'general') return tr('settings.general', 'General');
    if (resolvedSection === 'notifications') return tr('settings.notifications', 'Notifications');
    if (resolvedSection === 'about') return tr('settings.about', 'About OpenChat');
    if (resolvedSection === 'storage') return tr('settings.storage', 'Storage');
    if (resolvedSection === 'cards') return tr('settings.cards.title', 'Cards');
    if (resolvedSection === 'favorite-detail') return tr('settings.favorite_detail_title', 'Favorite Detail');
    return title || tr('settings.general', 'General');
  }, [resolvedSection, title, tr]);

  let content: React.ReactNode;
  if (resolvedSection === 'general') {
    content = renderGeneralSection();
  } else if (resolvedSection === 'notifications') {
    content = renderNotificationsSection();
  } else if (resolvedSection === 'about') {
    content = renderAboutSection();
  } else if (resolvedSection === 'storage') {
    content = renderStorageSection();
  } else if (resolvedSection === 'cards') {
    content = renderCardsSection();
  } else if (resolvedSection === 'favorite-detail') {
    content = renderFavoriteDetailSection();
  } else {
    content = renderGenericSection();
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
      <Navbar title={navTitle} onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto' }}>{content}</div>
    </div>
  );
};

export default GeneralPage;

