import React from 'react';
import { ActionSheet, Button, Icon, Navbar, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import type { UserProfile } from '../types';
import './ProfileInfoPage.css';

type EditableField = 'name' | 'signature' | null;

interface ProfileInfoPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onQRCodeClick?: () => void;
  onAddressClick?: () => void;
  onInvoiceClick?: () => void;
}

const Row: React.FC<{
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  isLast?: boolean;
  center?: boolean;
}> = ({ label, value, onClick, isLast, center }) => (
  <button
    type="button"
    className={`profile-info-page__row ${isLast ? 'profile-info-page__row--last' : ''}`}
    onClick={onClick}
    disabled={!onClick}
    style={{ alignItems: center ? 'center' : undefined, minHeight: center ? '86px' : undefined }}
  >
    <span className="profile-info-page__label">{label}</span>
    <span className="profile-info-page__value">{value}</span>
    {onClick ? (
      <span className="profile-info-page__arrow">
        <Icon name="arrow-right" size={18} color="var(--text-secondary)" />
      </span>
    ) : null}
  </button>
);

export const ProfileInfoPage: React.FC<ProfileInfoPageProps> = ({
  t,
  onBack,
  onQRCodeClick,
  onAddressClick,
  onInvoiceClick,
}) => {
  const { profile, updateProfile, updateAvatar, isLoading } = useUser();
  const [editingField, setEditingField] = React.useState<EditableField>(null);
  const [editValue, setEditValue] = React.useState('');
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
      address: tr('profile.address', 'My Addresses'),
      invoice: tr('profile.invoice', 'Invoice Titles'),
      copied: tr('profile.actions.copied', 'Copied'),
      save: tr('profile.actions.save', 'Save'),
      cancel: tr('common.cancel', 'Cancel'),
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
    } catch (error) {
      Toast.error(tr('profile.errors.avatar_upload_failed', 'Avatar upload failed, please try again'));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const openEditor = (field: Exclude<EditableField, null>) => {
    if (!profile) return;
    const currentValue = field === 'name' ? profile.name : profile.signature;
    setEditValue(currentValue || '');
    setEditingField(field);
  };

  const saveEditor = async () => {
    if (!profile || !editingField) return;
    const nextValue = editValue.trim();
    if (!nextValue) {
      Toast.info(tr('profile.errors.input_required', 'Please enter content'));
      return;
    }

    try {
      await updateProfile({ [editingField]: nextValue } as Partial<UserProfile>);
      Toast.success(tr('profile.messages.updated', 'Profile updated'));
      setEditingField(null);
    } catch (error) {
      Toast.error(tr('profile.errors.save_failed', 'Save failed, please try again later'));
    }
  };

  const handleCopyWXID = async () => {
    if (!profile?.wxid) return;
    try {
      await navigator.clipboard.writeText(profile.wxid);
      Toast.success(labels.copied);
    } catch (error) {
      Toast.error(tr('profile.errors.copy_failed', 'Copy failed'));
    }
  };

  const handleGenderSelect = async () => {
    if (!profile) return;
    const result = await ActionSheet.showActions({
      title: tr('profile.select_gender', 'Select Gender'),
      actions: [
        { text: tr('profile.gender_value.male', 'Male'), key: 'male' },
        { text: tr('profile.gender_value.female', 'Female'), key: 'female' },
      ],
    });
    if (!result?.key) return;
    await updateProfile({ gender: result.key as 'male' | 'female' });
  };

  const handleRegionSelect = async () => {
    if (!profile) return;
    const result = await ActionSheet.showActions({
      title: tr('profile.select_region', 'Select Region'),
      actions: [
        { text: tr('profile.regions.shanghai', 'Shanghai'), key: 'Shanghai' },
        { text: tr('profile.regions.beijing', 'Beijing'), key: 'Beijing' },
        { text: tr('profile.regions.shenzhen', 'Shenzhen'), key: 'Shenzhen' },
        { text: tr('profile.regions.guangzhou', 'Guangzhou'), key: 'Guangzhou' },
        { text: tr('profile.regions.custom', 'Custom'), key: 'custom' },
      ],
    });
    if (!result?.key) return;

    if (result.key === 'custom') {
      const custom = window.prompt(tr('profile.input_region', 'Please enter region'), profile.region || '');
      if (!custom?.trim()) return;
      await updateProfile({ region: custom.trim() });
      return;
    }

    await updateProfile({ region: result.key });
  };

  const avatarUrl = profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=OpenChat';

  return (
    <div className="profile-info-page">
      <Navbar title={labels.title} onBack={onBack} />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="profile-info-page__scroll">
        {!profile && isLoading ? (
          <>
            <div className="profile-info-page__group">
              <div className="profile-info-page__skeleton-row">
                <Skeleton width="100%" height={84} style={{ borderRadius: '12px' }} />
              </div>
              <div className="profile-info-page__skeleton-row">
                <Skeleton width="100%" height={52} style={{ borderRadius: '10px' }} />
              </div>
            </div>
          </>
        ) : null}

        {profile ? (
          <>
            <div className="profile-info-page__group">
              <Row
                label={labels.avatar}
                onClick={handleAvatarClick}
                center
                value={(
                  <div className="profile-info-page__avatar-wrap">
                    <img src={avatarUrl} alt={profile.name} className="profile-info-page__avatar" />
                    {isUploading ? (
                      <div className="profile-info-page__avatar-mask">
                        <Icon name="loading" size={16} spin color="#fff" />
                      </div>
                    ) : null}
                  </div>
                )}
              />
              <Row label={labels.name} onClick={() => openEditor('name')} value={profile.name} />
              <Row label={labels.wxid} onClick={handleCopyWXID} value={profile.wxid} />
              <Row
                label={labels.qrcode}
                onClick={onQRCodeClick}
                isLast
                value={<Icon name="qrcode" size={18} color="var(--text-secondary)" />}
              />
            </div>

            <div className="profile-info-page__group">
              <Row
                label={labels.gender}
                onClick={handleGenderSelect}
                value={
                  profile.gender === 'male'
                    ? tr('profile.gender_value.male', 'Male')
                    : tr('profile.gender_value.female', 'Female')
                }
              />
              <Row label={labels.region} onClick={handleRegionSelect} value={profile.region || '--'} />
              <Row
                label={labels.signature}
                onClick={() => openEditor('signature')}
                isLast
                value={<span className="profile-info-page__truncate">{profile.signature || tr('profile.not_set', 'Not set')}</span>}
              />
            </div>

            <div className="profile-info-page__group">
              <Row label={labels.address} onClick={onAddressClick} />
              <Row label={labels.invoice} onClick={onInvoiceClick} isLast />
            </div>
          </>
        ) : null}
      </div>

      {editingField ? (
        <div className="profile-info-page__sheet">
          <div className="profile-info-page__sheet-mask" onClick={() => setEditingField(null)} />
          <div className="profile-info-page__sheet-content">
            <div className="profile-info-page__sheet-head">
              <button type="button" onClick={() => setEditingField(null)}>
                {labels.cancel}
              </button>
              <span>{editingField === 'name' ? labels.name : labels.signature}</span>
              <button type="button" onClick={() => void saveEditor()}>
                {labels.save}
              </button>
            </div>
            <textarea
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
              placeholder={editingField === 'name' ? labels.name : labels.signature}
              rows={editingField === 'name' ? 2 : 4}
              className="profile-info-page__sheet-input"
            />
            <Button block onClick={() => void saveEditor()}>
              {labels.save}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileInfoPage;
