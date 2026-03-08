import React from 'react';
import { CellGroup, CellItem, Navbar, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import type { UserProfile } from '../types';
import './ProfileEditPage.css';

type ProfileEditField = 'name' | 'region' | 'signature' | 'password';

interface ProfileEditPageProps {
  t?: (key: string) => string;
  field?: ProfileEditField;
  onBack?: () => void;
}

const resolveField = (field: string | undefined): ProfileEditField => {
  if (field === 'region') return 'region';
  if (field === 'signature') return 'signature';
  if (field === 'password') return 'password';
  return 'name';
};

export const ProfileEditPage: React.FC<ProfileEditPageProps> = ({
  t,
  field,
  onBack,
}) => {
  const {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    changePassword,
  } = useUser();
  const resolvedField = resolveField(field);
  const [textValue, setTextValue] = React.useState('');
  const [passwordForm, setPasswordForm] = React.useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  React.useEffect(() => {
    if (!profile) return;
    if (resolvedField === 'password') {
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      return;
    }
    const value = resolvedField === 'name'
      ? profile.name
      : resolvedField === 'region'
        ? profile.region
        : profile.signature;
    setTextValue(value || '');
  }, [profile, resolvedField]);

  const title = resolvedField === 'name'
    ? tr('profile.name', 'Name')
    : resolvedField === 'region'
      ? tr('profile.region', 'Region')
      : resolvedField === 'signature'
        ? tr('profile.signature', 'Signature')
        : tr('profile.change_password', 'Change Password');
  const saveText = tr('profile.actions.save', 'Save');
  const retryText = tr('common.refresh', 'Refresh');

  const saveDisabled = isSaving || isLoading || !profile;

  const handleSave = async () => {
    if (saveDisabled) return;

    if (resolvedField === 'password') {
      if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        Toast.info(tr('profile.errors.password_required', 'Please complete all password fields'));
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        Toast.error(tr('profile.errors.password_mismatch', 'New password and confirmation do not match'));
        return;
      }

      setIsSaving(true);
      try {
        await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        });
        Toast.success(tr('profile.messages.password_changed', 'Password changed'));
        onBack?.();
      } catch {
        Toast.error(tr('profile.errors.password_change_failed', 'Password change failed'));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const nextValue = textValue.trim();
    if (!nextValue) {
      Toast.info(tr('profile.errors.input_required', 'Please enter content'));
      return;
    }

    const payload: Partial<UserProfile> = resolvedField === 'name'
      ? { name: nextValue }
      : resolvedField === 'region'
        ? { region: nextValue }
        : { signature: nextValue };

    setIsSaving(true);
    try {
      await updateProfile(payload);
      Toast.success(tr('profile.messages.updated', 'Profile updated'));
      onBack?.();
    } catch {
      Toast.error(tr('profile.errors.save_failed', 'Save failed, please try again later'));
    } finally {
      setIsSaving(false);
    }
  };

  const saveButton = (
    <button
      type="button"
      className="profile-edit-page__save-btn"
      onClick={() => void handleSave()}
      disabled={saveDisabled}
    >
      {saveText}
    </button>
  );

  return (
    <div className="profile-edit-page user-center-page">
      <Navbar title={title} onBack={onBack} rightElement={saveButton} />

      <div className="profile-edit-page__scroll user-center-page__scroll">
        {error && !isLoading ? (
          <div className="profile-edit-page__alert" role="status">
            <span className="profile-edit-page__alert-text">
              {tr('profile.load_failed_notice', 'Profile refresh failed. Showing available local data.')}
            </span>
            <button
              type="button"
              className="profile-edit-page__alert-retry"
              onClick={() => void loadProfile()}
            >
              {retryText}
            </button>
          </div>
        ) : null}

        {!profile && isLoading ? (
          <CellGroup>
            <div className="profile-edit-page__skeleton">
              <Skeleton width="100%" height={54} style={{ borderRadius: 0 }} />
            </div>
            <div className="profile-edit-page__skeleton profile-edit-page__skeleton--last">
              <Skeleton width="100%" height={18} style={{ borderRadius: 0 }} />
            </div>
          </CellGroup>
        ) : null}

        {!isLoading && !profile ? (
          <CellGroup>
            <CellItem
              title={tr('profile.empty', 'Profile unavailable')}
              description={tr('profile.empty_desc', 'Tap to reload profile')}
              value={retryText}
              isLink
              noBorder
              onClick={() => void loadProfile()}
            />
          </CellGroup>
        ) : null}

        {profile ? (
          <div className="profile-edit-page__form">
            {resolvedField === 'password' ? (
              <>
                <input
                  type="password"
                  className="profile-edit-page__input"
                  value={passwordForm.oldPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
                  placeholder={tr('profile.current_password', 'Current password')}
                  autoComplete="current-password"
                />
                <input
                  type="password"
                  className="profile-edit-page__input"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  placeholder={tr('profile.new_password', 'New password')}
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  className="profile-edit-page__input profile-edit-page__input--last"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder={tr('profile.confirm_password', 'Confirm password')}
                  autoComplete="new-password"
                />
              </>
            ) : resolvedField === 'signature' ? (
              <textarea
                className="profile-edit-page__textarea"
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
                placeholder={tr('profile.signature', 'Signature')}
                rows={4}
                maxLength={120}
              />
            ) : (
              <input
                type="text"
                className="profile-edit-page__input profile-edit-page__input--last"
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
                placeholder={resolvedField === 'name'
                  ? tr('profile.name', 'Name')
                  : tr('profile.region', 'Region')}
                maxLength={resolvedField === 'name' ? 32 : 48}
              />
            )}

            <div className="profile-edit-page__hint">
              {resolvedField === 'name'
                ? tr('settings.account_profile_desc', 'Manage avatar, display name, region, and signature')
                : resolvedField === 'region'
                  ? tr('profile.input_region', 'Please enter region')
                  : resolvedField === 'signature'
                    ? tr('profile.not_set', 'Not set')
                    : tr('settings.account_password_desc', 'Update login password and security verification')}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileEditPage;
