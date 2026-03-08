import React from 'react';
import { ActionSheet, Button, CellGroup, CellItem, Navbar, Switch, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import type { UserCenterSettings, UserCenterUpdateSettingsInput } from '../services/UserCenterService';
import './MyUserSettingsPage.css';

interface MyUserSettingsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

interface UserSettingsDraft {
  theme: string;
  language: string;
  autoPlay: boolean;
  highQuality: boolean;
  dataSaver: boolean;
  notificationSettings: {
    system: boolean;
    message: boolean;
    activity: boolean;
    promotion: boolean;
    sound: boolean;
    vibration: boolean;
  };
  privacySettings: {
    publicProfile: boolean;
    allowSearch: boolean;
    allowFriendRequest: boolean;
  };
}

function defaultUserSettingsDraft(): UserSettingsDraft {
  return {
    theme: 'system',
    language: 'zh-CN',
    autoPlay: true,
    highQuality: true,
    dataSaver: false,
    notificationSettings: {
      system: true,
      message: true,
      activity: true,
      promotion: false,
      sound: true,
      vibration: true,
    },
    privacySettings: {
      publicProfile: true,
      allowSearch: true,
      allowFriendRequest: true,
    },
  };
}

function toDraft(value: UserCenterSettings | null): UserSettingsDraft {
  const defaults = defaultUserSettingsDraft();
  if (!value) {
    return defaults;
  }
  const extended = value as UserCenterSettings & {
    autoPlay?: boolean;
    highQuality?: boolean;
    dataSaver?: boolean;
  };
  return {
    theme: (value.theme || '').trim() || defaults.theme,
    language: (value.language || '').trim() || defaults.language,
    autoPlay: extended.autoPlay ?? defaults.autoPlay,
    highQuality: extended.highQuality ?? defaults.highQuality,
    dataSaver: extended.dataSaver ?? defaults.dataSaver,
    notificationSettings: {
      system: value.notificationSettings?.system ?? defaults.notificationSettings.system,
      message: value.notificationSettings?.message ?? defaults.notificationSettings.message,
      activity: value.notificationSettings?.activity ?? defaults.notificationSettings.activity,
      promotion: value.notificationSettings?.promotion ?? defaults.notificationSettings.promotion,
      sound: value.notificationSettings?.sound ?? defaults.notificationSettings.sound,
      vibration: value.notificationSettings?.vibration ?? defaults.notificationSettings.vibration,
    },
    privacySettings: {
      publicProfile: value.privacySettings?.publicProfile ?? defaults.privacySettings.publicProfile,
      allowSearch: value.privacySettings?.allowSearch ?? defaults.privacySettings.allowSearch,
      allowFriendRequest: value.privacySettings?.allowFriendRequest ?? defaults.privacySettings.allowFriendRequest,
    },
  };
}

function toPayload(draft: UserSettingsDraft): UserCenterUpdateSettingsInput {
  return {
    theme: draft.theme,
    language: draft.language,
    autoPlay: draft.autoPlay,
    highQuality: draft.highQuality,
    dataSaver: draft.dataSaver,
    notificationSettings: { ...draft.notificationSettings },
    privacySettings: { ...draft.privacySettings },
  };
}

export const MyUserSettingsPage: React.FC<MyUserSettingsPageProps> = ({ t, onBack }) => {
  const { getUserSettings, updateUserSettings } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState<UserSettingsDraft>(() => defaultUserSettingsDraft());
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const themeLabelMap = React.useMemo(
    () => ({
      system: tr('profile.settings.theme_system', 'System'),
      light: tr('profile.settings.theme_light', 'Light'),
      dark: tr('profile.settings.theme_dark', 'Dark'),
    }),
    [tr]
  );

  const languageLabelMap = React.useMemo(
    () => ({
      'zh-CN': tr('profile.settings.language_zh_cn', 'Simplified Chinese'),
      'en-US': tr('profile.settings.language_en_us', 'English'),
    }),
    [tr]
  );

  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const current = await getUserSettings();
      setDraft(toDraft(current));
      setHasLoadedOnce(true);
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : tr('profile.settings.load_failed', 'Failed to load settings'));
    } finally {
      setLoading(false);
    }
  }, [getUserSettings, tr]);

  React.useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updated = await updateUserSettings(toPayload(draft));
      setDraft(toDraft(updated));
      Toast.success(tr('profile.settings.saved', 'Settings saved'));
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : tr('profile.settings.save_failed', 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTheme = async () => {
    const action = await ActionSheet.showActions({
      title: tr('profile.settings.theme', 'Theme'),
      actions: [
        { key: 'system', text: themeLabelMap.system },
        { key: 'light', text: themeLabelMap.light },
        { key: 'dark', text: themeLabelMap.dark },
      ],
      variant: 'user-center',
    });
    const selectedTheme = action?.key;
    if (!selectedTheme) return;
    setDraft((prev) => ({ ...prev, theme: selectedTheme }));
  };

  const handleSelectLanguage = async () => {
    const action = await ActionSheet.showActions({
      title: tr('profile.settings.language', 'Language'),
      actions: [
        { key: 'zh-CN', text: languageLabelMap['zh-CN'] },
        { key: 'en-US', text: languageLabelMap['en-US'] },
      ],
      variant: 'user-center',
    });
    const selectedLanguage = action?.key;
    if (!selectedLanguage) return;
    setDraft((prev) => ({ ...prev, language: selectedLanguage }));
  };

  const renderToggleCell = (
    title: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    options?: { noBorder?: boolean; description?: string }
  ) => (
    <CellItem
      title={title}
      description={options?.description}
      value={<Switch checked={checked} onChange={onChange} />}
      noBorder={options?.noBorder}
    />
  );

  const disabled = loading || saving;

  return (
    <div className="my-user-settings-page user-center-page">
      <Navbar title={tr('profile.settings.title', 'User Settings')} onBack={onBack} />

      <div className="my-user-settings-page__scroll user-center-page__scroll">
        <CellGroup title={tr('profile.settings.general', 'General')}>
          <CellItem
            title={tr('profile.settings.theme', 'Theme')}
            value={themeLabelMap[draft.theme as keyof typeof themeLabelMap] || draft.theme}
            isLink
            onClick={handleSelectTheme}
          />
          <CellItem
            title={tr('profile.settings.language', 'Language')}
            value={languageLabelMap[draft.language as keyof typeof languageLabelMap] || draft.language}
            isLink
            onClick={handleSelectLanguage}
            noBorder
          />
        </CellGroup>

        <CellGroup title={tr('profile.settings.notifications', 'Notifications')}>
          {renderToggleCell(
            tr('profile.settings.notify_system', 'System notifications'),
            draft.notificationSettings.system,
            (checked) => setDraft((prev) => ({ ...prev, notificationSettings: { ...prev.notificationSettings, system: checked } }))
          )}
          {renderToggleCell(
            tr('profile.settings.notify_message', 'Message notifications'),
            draft.notificationSettings.message,
            (checked) => setDraft((prev) => ({ ...prev, notificationSettings: { ...prev.notificationSettings, message: checked } }))
          )}
          {renderToggleCell(
            tr('profile.settings.notify_activity', 'Activity notifications'),
            draft.notificationSettings.activity,
            (checked) => setDraft((prev) => ({ ...prev, notificationSettings: { ...prev.notificationSettings, activity: checked } }))
          )}
          {renderToggleCell(
            tr('profile.settings.notify_promotion', 'Promotion notifications'),
            draft.notificationSettings.promotion,
            (checked) => setDraft((prev) => ({ ...prev, notificationSettings: { ...prev.notificationSettings, promotion: checked } }))
          )}
          {renderToggleCell(
            tr('profile.settings.notify_sound', 'Sound'),
            draft.notificationSettings.sound,
            (checked) => setDraft((prev) => ({ ...prev, notificationSettings: { ...prev.notificationSettings, sound: checked } }))
          )}
          {renderToggleCell(
            tr('profile.settings.notify_vibration', 'Vibration'),
            draft.notificationSettings.vibration,
            (checked) => setDraft((prev) => ({ ...prev, notificationSettings: { ...prev.notificationSettings, vibration: checked } })),
            { noBorder: true }
          )}
        </CellGroup>

        <CellGroup title={tr('profile.settings.privacy', 'Privacy')}>
          {renderToggleCell(
            tr('profile.settings.privacy_public_profile', 'Public profile'),
            draft.privacySettings.publicProfile,
            (checked) => setDraft((prev) => ({ ...prev, privacySettings: { ...prev.privacySettings, publicProfile: checked } }))
          )}
          {renderToggleCell(
            tr('profile.settings.privacy_allow_search', 'Allow search'),
            draft.privacySettings.allowSearch,
            (checked) => setDraft((prev) => ({ ...prev, privacySettings: { ...prev.privacySettings, allowSearch: checked } }))
          )}
          {renderToggleCell(
            tr('profile.settings.privacy_allow_friend_request', 'Allow friend request'),
            draft.privacySettings.allowFriendRequest,
            (checked) => setDraft((prev) => ({ ...prev, privacySettings: { ...prev.privacySettings, allowFriendRequest: checked } })),
            { noBorder: true }
          )}
        </CellGroup>

        <CellGroup title={tr('profile.settings.playback', 'Playback & Data')}>
          {renderToggleCell(
            tr('profile.settings.auto_play', 'Auto play'),
            draft.autoPlay,
            (checked) => setDraft((prev) => ({ ...prev, autoPlay: checked }))
          )}
          {renderToggleCell(
            tr('profile.settings.high_quality', 'High quality mode'),
            draft.highQuality,
            (checked) => setDraft((prev) => ({ ...prev, highQuality: checked }))
          )}
          {renderToggleCell(
            tr('profile.settings.data_saver', 'Data saver'),
            draft.dataSaver,
            (checked) => setDraft((prev) => ({ ...prev, dataSaver: checked })),
            { noBorder: true }
          )}
        </CellGroup>

        {!loading && hasLoadedOnce ? (
          <CellGroup>
            <CellItem
              title={tr('profile.settings.tip', 'Changes take effect after saving')}
              description={tr('profile.settings.tip_desc', 'Tap Save below to sync to account settings')}
              noBorder
            />
          </CellGroup>
        ) : null}
      </div>

      <div className="my-user-settings-page__actions">
        <Button block variant="outline" onClick={() => void loadSettings()} disabled={disabled}>
          {tr('common.refresh', 'Refresh')}
        </Button>
        <Button block onClick={() => void saveSettings()} loading={saving} disabled={disabled}>
          {tr('common.save', 'Save')}
        </Button>
      </div>
    </div>
  );
};

export default MyUserSettingsPage;
