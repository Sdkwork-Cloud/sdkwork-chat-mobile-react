import React, { useEffect, useMemo, useState } from 'react';
import { ActionSheet, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';

type GeneralSection =
  | 'general'
  | 'notifications'
  | 'about'
  | 'cards'
  | 'favorite-detail'
  | 'generic'
  | string;

interface GeneralPageProps {
  t?: (key: string) => string;
  section?: GeneralSection;
  title?: string;
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
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [personalizedRecommendation, setPersonalizedRecommendation] = useState(true);

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
  }, [config]);

  const resolvedSection = useMemo(() => {
    if (section) return section;
    const normalizedTitle = (title || '').trim().toLowerCase();

    if (normalizedTitle === '通用' || normalizedTitle === 'general') return 'general';
    if (normalizedTitle === '新消息通知' || normalizedTitle === 'notifications') return 'notifications';
    if (normalizedTitle === '关于' || normalizedTitle === '关于 openchat' || normalizedTitle === 'about') return 'about';
    if (normalizedTitle === '卡包' || normalizedTitle === 'cards') return 'cards';
    if (normalizedTitle === '收藏详情' || normalizedTitle === 'favorite detail') return 'favorite-detail';

    return 'generic';
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

  const toggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    void updateConfig({ notificationsEnabled: next });
  };

  const toggleAutoPlayVideo = () => {
    const next = !autoPlayVideo;
    setAutoPlayVideo(next);
    void updateConfig({ autoPlayVideo: next });
  };

  const renderCell = (
    label: string,
    options?: {
      description?: string;
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
        <div style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{label}</div>
        {options?.description ? (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{options.description}</div>
        ) : null}
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

  const sectionHeader = (text: string) => (
    <div style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-body)' }}>{text}</div>
  );

  const renderGeneralSection = () => (
    <>
      {sectionHeader(tr('settings.general_sections.appearance', 'Appearance'))}
      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(tr('settings.chat_background', 'Chat Background'), { isLink: true, onClick: () => onNavigate?.('/settings/background') })}
        {renderCell(tr('settings.font_size', 'Font Size'), { value: tr('settings.font_size_standard', 'Standard'), isLink: true })}
        {renderCell(tr('settings.landscape_mode', 'Landscape Mode'), {
          toggle: true,
          checked: false,
          onToggle: () => Toast.info(tr('settings.rotate_device', 'Please rotate your device')),
        })}
      </div>

      {sectionHeader(tr('settings.general_sections.media', 'Media'))}
      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(tr('settings.autoplay_moments_video', 'Auto-play moments video'), {
          toggle: true,
          checked: autoPlayVideo,
          onToggle: toggleAutoPlayVideo,
        })}
        {renderCell(tr('settings.media_storage', 'Photos, videos, files and calls'), { isLink: true })}
      </div>

      {sectionHeader(tr('settings.general_sections.system', 'System'))}
      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(tr('settings.language', 'Language'), {
          value: language === 'zh-CN' ? tr('settings.language_zh', 'Simplified Chinese') : tr('settings.language_en', 'English'),
          isLink: true,
          onClick: handleLanguageChange,
        })}
      </div>
    </>
  );

  const renderNotificationsSection = () => (
    <>
      {sectionHeader(tr('settings.notifications_sections.system', 'System Notifications'))}
      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(tr('settings.receive_notifications', 'Receive notifications'), {
          toggle: true,
          checked: notificationsEnabled,
          onToggle: toggleNotifications,
        })}
      </div>

      {notificationsEnabled ? (
        <>
          {sectionHeader(tr('settings.notifications_sections.methods', 'Notification Methods'))}
          <div style={{ background: 'var(--bg-card)' }}>
            {renderCell(tr('settings.notifications_show_detail', 'Show details in notifications'), {
              description: tr(
                'settings.notifications_show_detail_desc',
                'When disabled, sender and message preview will be hidden.'
              ),
              toggle: true,
              checked: true,
            })}
            {renderCell(tr('settings.notifications_sound', 'Sound'), { toggle: true, checked: true })}
            {renderCell(tr('settings.notifications_vibration', 'Vibration'), { toggle: true, checked: true })}
          </div>
        </>
      ) : null}
    </>
  );

  const renderAboutSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '14px',
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

      <div style={{ width: '100%', marginTop: '24px', background: 'var(--bg-card)', borderRadius: '12px' }}>
        {renderCell(tr('settings.about_check_update', 'Check updates'), {
          isLink: true,
          onClick: () => {
            Toast.loading(tr('settings.about_checking', 'Checking...'));
            window.setTimeout(() => {
              Toast.success(tr('settings.about_latest', 'Already on latest version'));
            }, 900);
          },
        })}
      </div>

      <div style={{ marginTop: '40px', fontSize: '12px', color: 'var(--text-placeholder)', textAlign: 'center' }}>
        {tr('settings.about_copyright', 'Copyright © 2024 OpenChat Inc. All Rights Reserved.')}
      </div>
    </div>
  );

  const renderCardsSection = () => (
    <>
      <div style={{ padding: '10px 16px 6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {tr('settings.cards.my_coupons', 'My Coupons')}
      </div>
      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(tr('settings.cards.member_trial', 'Membership Trial Card'), {
          value: tr('settings.cards.member_trial_value', '23 days left'),
          isLink: true,
          onClick: () => Toast.info(tr('settings.cards.member_trial_toast', 'Membership benefits are active')),
        })}
        {renderCell(tr('settings.cards.shipping_coupon', 'Shipping Coupon'), {
          value: tr('settings.cards.shipping_coupon_value', '2 available'),
          isLink: true,
          onClick: () => onNavigate?.('/commerce/mall'),
        })}
        {renderCell(tr('settings.cards.mall_coupon', 'Mall Discount Coupon'), {
          value: tr('settings.cards.mall_coupon_value', 'Save 20 on 199'),
          isLink: true,
          onClick: () => onNavigate?.('/commerce/mall'),
        })}
        {renderCell(tr('settings.cards.appointment_coupon', 'Appointment Service Coupon'), {
          value: tr('settings.cards.appointment_coupon_value', '1 available'),
          isLink: true,
          onClick: () => onNavigate?.('/appointments'),
        })}
      </div>

      <div style={{ padding: '10px 16px 6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {tr('settings.cards.member_points', 'Membership & Points')}
      </div>
      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(tr('settings.cards.growth', 'Growth Score'), { value: '1260', isLink: true })}
        {renderCell(tr('settings.cards.points', 'Available Points'), { value: '780', isLink: true })}
      </div>
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
        <div
          style={{
            background: 'var(--bg-card)',
            border: '0.5px solid var(--border-color)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
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
      {sectionHeader(tr('settings.generic.common', 'Common Settings'))}
      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(tr('settings.generic.do_not_disturb', 'Do Not Disturb'), {
          toggle: true,
          checked: doNotDisturb,
          onToggle: () => setDoNotDisturb((prev) => !prev),
        })}
        {renderCell(tr('settings.generic.account_security', 'Device and Account Security'), {
          isLink: true,
          onClick: () => Toast.info(tr('settings.generic.account_security_toast', 'Configure this in Account & Security')),
        })}
        {renderCell(tr('settings.generic.storage_management', 'Storage Management'), {
          value: '2.3 GB',
          isLink: true,
          onClick: () => Toast.info(tr('settings.generic.storage_toast', 'Local storage scan completed')),
        })}
      </div>

      {sectionHeader(tr('settings.generic.privacy', 'Content and Privacy'))}
      <div style={{ background: 'var(--bg-card)' }}>
        {renderCell(tr('settings.generic.privacy_permissions', 'Privacy Permissions'), {
          isLink: true,
          onClick: () => Toast.info(tr('settings.generic.privacy_toast', 'Privacy controls enabled')),
        })}
        {renderCell(tr('settings.generic.personalized_recommendation', 'Personalized Recommendation'), {
          toggle: true,
          checked: personalizedRecommendation,
          onToggle: () => setPersonalizedRecommendation((prev) => !prev),
        })}
      </div>
    </>
  );

  const navTitle = useMemo(() => {
    if (resolvedSection === 'general') return tr('settings.general', 'General');
    if (resolvedSection === 'notifications') return tr('settings.notifications', 'Notifications');
    if (resolvedSection === 'about') return tr('settings.about', 'About OpenChat');
    if (resolvedSection === 'cards') return tr('settings.cards.title', 'Cards');
    if (resolvedSection === 'favorite-detail') return tr('settings.favorite_detail_title', 'Favorite Detail');
    return title || tr('settings.general', 'General');
  }, [resolvedSection, title, tr]);

  const content = useMemo(() => {
    if (resolvedSection === 'general') return renderGeneralSection();
    if (resolvedSection === 'notifications') return renderNotificationsSection();
    if (resolvedSection === 'about') return renderAboutSection();
    if (resolvedSection === 'cards') return renderCardsSection();
    if (resolvedSection === 'favorite-detail') return renderFavoriteDetailSection();
    return renderGenericSection();
  }, [
    autoPlayVideo,
    detailContent,
    detailSource,
    detailTime,
    detailTitle,
    detailType,
    doNotDisturb,
    language,
    notificationsEnabled,
    personalizedRecommendation,
    resolvedSection,
    tr,
  ]);

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
      <Navbar title={navTitle} onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto' }}>{content}</div>
    </div>
  );
};

export default GeneralPage;
