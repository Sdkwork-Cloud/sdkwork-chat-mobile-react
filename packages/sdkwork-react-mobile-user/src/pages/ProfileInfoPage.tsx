import React from 'react';
import { ActionSheet, CellGroup, CellItem, Icon, Navbar, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import {
  formatEmailBindingValue,
  formatPhoneBindingValue,
  toBindingStatusLabel,
} from './profileBindingDisplay';
import './ProfileInfoPage.css';

interface ProfileInfoPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onEditNameClick?: () => void;
  onEditRegionClick?: () => void;
  onEditSignatureClick?: () => void;
  onEditPasswordClick?: () => void;
  onEditPhoneClick?: () => void;
  onEditEmailClick?: () => void;
  onEditWechatClick?: () => void;
  onEditQqClick?: () => void;
  onQRCodeClick?: () => void;
  onAddressClick?: () => void;
  onInvoiceClick?: () => void;
  onActivityHistoryClick?: () => void;
  onUserSettingsClick?: () => void;
}

const copyText = async (text: string): Promise<boolean> => {
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback to legacy copy
    }
  }

  if (typeof document === 'undefined') return false;

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};

export const ProfileInfoPage: React.FC<ProfileInfoPageProps> = ({
  t,
  onBack,
  onEditNameClick,
  onEditRegionClick,
  onEditSignatureClick,
  onEditPasswordClick,
  onEditPhoneClick,
  onEditEmailClick,
  onEditWechatClick,
  onEditQqClick,
  onQRCodeClick,
  onAddressClick,
  onInvoiceClick,
  onActivityHistoryClick,
  onUserSettingsClick,
}) => {
  const {
    profile,
    updateProfile,
    updateAvatar,
    isLoading,
    error,
    loadProfile,
  } = useUser();
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const labels = React.useMemo(
    () => ({
      title: tr('profile.title', 'Profile'),
      avatar: tr('profile.avatar', 'Avatar'),
      name: tr('profile.name', 'Name'),
      wxid: tr('profile.wxid', 'ID'),
      qrcode: tr('profile.qrcode', 'My QR Code'),
      gender: tr('profile.gender', 'Gender'),
      region: tr('profile.region', 'Region'),
      signature: tr('profile.signature', 'Signature'),
      changePassword: tr('profile.change_password', 'Change Password'),
      activityHistory: tr('profile.activity_history', 'Activity History'),
      userSettings: tr('profile.user_settings', 'User Settings'),
      bindEmail: tr('profile.bind_email', 'Email'),
      bindPhone: tr('profile.bind_phone', 'Phone'),
      bindWechat: tr('profile.bind_wechat', 'WeChat'),
      bindQq: tr('profile.bind_qq', 'QQ'),
      address: tr('profile.address', 'My Addresses'),
      invoice: tr('profile.invoice', 'Invoice Titles'),
      copied: tr('profile.actions.copied', 'Copied'),
      updateAction: tr('profile.change_password_action', 'Update'),
      bound: tr('profile.bound', 'Bound'),
      notBound: tr('profile.not_bound', 'Not bound'),
      retry: tr('common.refresh', 'Refresh'),
      emptyTitle: tr('profile.empty', 'Profile unavailable'),
      emptyDescription: tr('profile.empty_desc', 'Tap to reload profile'),
      loadFailedNotice: tr('profile.load_failed_notice', 'Profile refresh failed. Showing available local data.'),
    }),
    [tr]
  );

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      Toast.error(tr('profile.errors.image_too_large', 'Image is too large. Please select one under 10MB.'));
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      await updateAvatar(file);
      Toast.success(tr('profile.messages.avatar_updated', 'Avatar updated'));
    } catch {
      Toast.error(tr('profile.errors.avatar_upload_failed', 'Avatar upload failed, please try again'));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleCopyWXID = async () => {
    if (!profile?.wxid) return;
    const copied = await copyText(profile.wxid);
    if (copied) {
      Toast.success(labels.copied);
      return;
    }
    Toast.error(tr('profile.errors.copy_failed', 'Copy failed'));
  };

  const handleGenderSelect = async () => {
    if (!profile) return;
    const result = await ActionSheet.showActions({
      title: tr('profile.select_gender', 'Select Gender'),
      actions: [
        { text: tr('profile.gender_value.male', 'Male'), key: 'male' },
        { text: tr('profile.gender_value.female', 'Female'), key: 'female' },
      ],
      variant: 'user-center',
    });
    if (!result?.key) return;

    try {
      await updateProfile({ gender: result.key as 'male' | 'female' });
    } catch {
      Toast.error(tr('profile.errors.save_failed', 'Save failed, please try again later'));
    }
  };

  const avatarUrl = profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=OpenChat';
  const profileName = profile?.name || tr('profile.default_name', 'WeChat User');
  const profileId = profile?.wxid || '--';
  const emailValue = formatEmailBindingValue(profile?.email);
  const phoneValue = formatPhoneBindingValue(profile?.phone);
  const emailStatus = toBindingStatusLabel(profile?.email, labels.bound, labels.notBound);
  const phoneStatus = toBindingStatusLabel(profile?.phone, labels.bound, labels.notBound);
  const phoneDisplayValue = phoneStatus === labels.bound ? phoneValue : labels.notBound;
  const emailDisplayValue = emailStatus === labels.bound ? emailValue : labels.notBound;

  return (
    <div className="profile-info-page user-center-page">
      <Navbar title={labels.title} onBack={onBack} />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="profile-info-page__scroll user-center-page__scroll">
        {error && !isLoading ? (
          <div className="profile-info-page__alert" role="status">
            <span className="profile-info-page__alert-text">{labels.loadFailedNotice}</span>
            <button
              type="button"
              className="profile-info-page__alert-retry"
              onClick={() => void loadProfile()}
            >
              {labels.retry}
            </button>
          </div>
        ) : null}

        {!profile && isLoading ? (
          <CellGroup>
            <div className="profile-info-page__skeleton-cell">
              <Skeleton width="100%" height={62} style={{ borderRadius: 0 }} />
            </div>
            <div className="profile-info-page__skeleton-cell profile-info-page__skeleton-cell--last">
              <Skeleton width="100%" height={44} style={{ borderRadius: 0 }} />
            </div>
          </CellGroup>
        ) : null}

        {profile ? (
          <>
            <CellGroup>
              <CellItem
                title={labels.avatar}
                value={(
                  <div className="profile-info-page__avatar-wrap">
                    <img src={avatarUrl} alt={profileName} className="profile-info-page__avatar" />
                    {isUploading ? (
                      <div className="profile-info-page__avatar-mask">
                        <Icon name="loading" size={16} spin color="#fff" />
                      </div>
                    ) : null}
                  </div>
                )}
                isLink
                onClick={handleAvatarClick}
                className="profile-info-page__avatar-cell"
              />
              <CellItem title={labels.name} value={profileName} isLink onClick={onEditNameClick} />
              <CellItem
                title={labels.wxid}
                value={<span className="profile-info-page__id-value">{profileId}</span>}
                isLink
                onClick={handleCopyWXID}
              />
              <CellItem
                title={labels.qrcode}
                value={<Icon name="qrcode" size={18} color="var(--text-secondary)" />}
                isLink
                onClick={onQRCodeClick}
                noBorder
              />
            </CellGroup>

            <CellGroup>
              <CellItem
                title={labels.gender}
                value={
                  profile.gender === 'male'
                    ? tr('profile.gender_value.male', 'Male')
                    : tr('profile.gender_value.female', 'Female')
                }
                isLink
                onClick={handleGenderSelect}
              />
              <CellItem title={labels.region} value={profile.region || '--'} isLink onClick={onEditRegionClick} />
              <CellItem
                title={labels.signature}
                value={<span className="profile-info-page__value-truncate">{profile.signature || tr('profile.not_set', 'Not set')}</span>}
                isLink
                onClick={onEditSignatureClick}
                noBorder
              />
            </CellGroup>

            <CellGroup>
              <CellItem
                title={labels.bindPhone}
                value={phoneDisplayValue}
                isLink
                onClick={onEditPhoneClick}
              />
              <CellItem
                title={labels.bindEmail}
                value={emailDisplayValue}
                isLink
                onClick={onEditEmailClick}
              />
              <CellItem
                title={labels.bindWechat}
                value={labels.notBound}
                isLink
                onClick={onEditWechatClick}
              />
              <CellItem
                title={labels.bindQq}
                value={labels.notBound}
                isLink
                onClick={onEditQqClick}
              />
              <CellItem
                title={labels.changePassword}
                value={<span className="profile-info-page__action-value">{labels.updateAction}</span>}
                isLink
                onClick={onEditPasswordClick}
                noBorder
              />
            </CellGroup>

            <CellGroup>
              <CellItem title={labels.activityHistory} isLink onClick={onActivityHistoryClick} />
              <CellItem title={labels.userSettings} isLink onClick={onUserSettingsClick} />
              <CellItem title={labels.address} isLink onClick={onAddressClick} />
              <CellItem title={labels.invoice} isLink onClick={onInvoiceClick} noBorder />
            </CellGroup>
          </>
        ) : null}

        {!isLoading && !profile ? (
          <CellGroup>
            <CellItem
              title={labels.emptyTitle}
              description={labels.emptyDescription}
              value={labels.retry}
              isLink
              onClick={() => void loadProfile()}
              noBorder
            />
          </CellGroup>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileInfoPage;
