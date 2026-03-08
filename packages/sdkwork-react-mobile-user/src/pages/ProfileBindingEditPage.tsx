import React from 'react';
import { CellGroup, CellItem, Navbar, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import {
  formatEmailBindingValue,
  formatPhoneBindingValue,
  toBindingStatusLabel,
} from './profileBindingDisplay';
import { validateBindingDraft, type BindingValidationField } from './profileBindingValidation';
import './ProfileBindingEditPage.css';

type ProfileBindingField = BindingValidationField;

interface ProfileBindingEditPageProps {
  t?: (key: string) => string;
  field?: ProfileBindingField;
  onBack?: () => void;
}

const resolveField = (field: string | undefined): ProfileBindingField => {
  if (field === 'phone') return 'phone';
  if (field === 'wechat') return 'wechat';
  if (field === 'qq') return 'qq';
  return 'email';
};

export const ProfileBindingEditPage: React.FC<ProfileBindingEditPageProps> = ({
  t,
  field,
  onBack,
}) => {
  const {
    profile,
    isLoading,
    error,
    loadProfile,
    bindEmail,
    unbindEmail,
    bindPhone,
    unbindPhone,
    bindThirdParty,
    unbindThirdParty,
  } = useUser();
  const resolvedField = resolveField(field);

  const [account, setAccount] = React.useState('');
  const [verifyCode, setVerifyCode] = React.useState('');
  const [authCode, setAuthCode] = React.useState('');
  const [thirdPartyUserId, setThirdPartyUserId] = React.useState('');
  const [localError, setLocalError] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUnbinding, setIsUnbinding] = React.useState(false);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  React.useEffect(() => {
    if (resolvedField === 'email') {
      setAccount(profile?.email || '');
      return;
    }
    if (resolvedField === 'phone') {
      setAccount(profile?.phone || '');
      return;
    }
    setAccount('');
  }, [profile?.email, profile?.phone, resolvedField]);

  React.useEffect(() => {
    setVerifyCode('');
    setAuthCode('');
    setThirdPartyUserId('');
    setLocalError('');
  }, [resolvedField]);

  const labels = React.useMemo(
    () => ({
      save: tr('profile.actions.save', 'Save'),
      retry: tr('common.refresh', 'Refresh'),
      bound: tr('profile.bound', 'Bound'),
      notBound: tr('profile.not_bound', 'Not bound'),
      unbind: tr('profile.bind_actions.unbind', 'Unbind'),
      emailInvalid: tr('profile.errors.bind_email_invalid', 'Please enter a valid email address'),
      phoneInvalid: tr('profile.errors.bind_phone_invalid', 'Please enter a valid phone number'),
      emailRequired: tr('profile.errors.bind_email_required', 'Please enter email'),
      phoneRequired: tr('profile.errors.bind_phone_required', 'Please enter phone number'),
      socialRequired: tr('profile.errors.social_bind_required', 'Enter code or third-party user ID'),
      bindEmailInput: tr('profile.bind_email_input', 'Enter email'),
      bindPhoneInput: tr('profile.bind_phone_input', 'Enter phone number'),
      bindEmailCode: tr('profile.bind_email_code', 'Enter email code (optional)'),
      bindPhoneCode: tr('profile.bind_phone_code', 'Enter SMS code (optional)'),
      bindSocialCode: tr('profile.bind_social_code', 'Enter authorization code'),
      bindSocialUid: tr('profile.bind_social_uid', 'Enter third-party user ID (optional)'),
      loadFailedNotice: tr('profile.load_failed_notice', 'Profile refresh failed. Showing available local data.'),
      emptyTitle: tr('profile.empty', 'Profile unavailable'),
      emptyDescription: tr('profile.empty_desc', 'Tap to reload profile'),
    }),
    [tr]
  );

  const title = resolvedField === 'email'
    ? tr('profile.bind_email', 'Email')
    : resolvedField === 'phone'
      ? tr('profile.bind_phone', 'Phone')
      : resolvedField === 'wechat'
        ? tr('profile.bind_wechat', 'WeChat')
        : tr('profile.bind_qq', 'QQ');

  const currentStatus = resolvedField === 'email'
    ? toBindingStatusLabel(profile?.email, labels.bound, labels.notBound)
    : resolvedField === 'phone'
      ? toBindingStatusLabel(profile?.phone, labels.bound, labels.notBound)
      : labels.notBound;
  const currentValue = resolvedField === 'email'
    ? formatEmailBindingValue(profile?.email)
    : resolvedField === 'phone'
      ? formatPhoneBindingValue(profile?.phone)
      : '--';

  const saveDisabled = isLoading || isSaving || isUnbinding || !profile;
  const unbindDisabled = isLoading || isSaving || isUnbinding || !profile;

  const handleSave = async () => {
    if (saveDisabled) return;

    const validation = validateBindingDraft(
      {
        field: resolvedField,
        account,
        verifyCode,
        authCode,
        thirdPartyUserId,
      },
      {
        emailRequired: labels.emailRequired,
        emailInvalid: labels.emailInvalid,
        phoneRequired: labels.phoneRequired,
        phoneInvalid: labels.phoneInvalid,
        socialRequired: labels.socialRequired,
      }
    );

    if (!validation.valid) {
      setLocalError(validation.message || tr('profile.errors.save_failed', 'Save failed, please try again later'));
      return;
    }

    setLocalError('');
    setIsSaving(true);
    try {
      if (resolvedField === 'email') {
        await bindEmail(validation.normalizedAccount, validation.normalizedVerifyCode || undefined);
        Toast.success(tr('profile.messages.email_bound', 'Email bound'));
        onBack?.();
        return;
      }

      if (resolvedField === 'phone') {
        await bindPhone(validation.normalizedAccount, validation.normalizedVerifyCode || undefined);
        Toast.success(tr('profile.messages.phone_bound', 'Phone bound'));
        onBack?.();
        return;
      }

      const platform = resolvedField === 'wechat' ? 'wechat' : 'qq';
      await bindThirdParty(platform, {
        code: validation.normalizedAuthCode || undefined,
        thirdPartyUserId: validation.normalizedThirdPartyUserId || undefined,
      });
      Toast.success(tr('profile.messages.social_bound', 'Account bound'));
      onBack?.();
    } catch {
      Toast.error(tr('profile.errors.bind_social_failed', 'Third-party binding failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnbind = async () => {
    if (unbindDisabled) return;

    setLocalError('');
    setIsUnbinding(true);
    try {
      if (resolvedField === 'email') {
        if (!profile?.email?.trim()) {
          Toast.info(labels.notBound);
          return;
        }
        await unbindEmail();
        Toast.success(tr('profile.messages.email_unbound', 'Email unbound'));
        onBack?.();
        return;
      }

      if (resolvedField === 'phone') {
        if (!profile?.phone?.trim()) {
          Toast.info(labels.notBound);
          return;
        }
        await unbindPhone();
        Toast.success(tr('profile.messages.phone_unbound', 'Phone unbound'));
        onBack?.();
        return;
      }

      await unbindThirdParty(resolvedField === 'wechat' ? 'wechat' : 'qq');
      Toast.success(tr('profile.messages.social_unbound', 'Account unbound'));
      onBack?.();
    } catch {
      Toast.error(tr('profile.errors.bind_social_failed', 'Third-party binding failed'));
    } finally {
      setIsUnbinding(false);
    }
  };

  const saveButton = (
    <button
      type="button"
      className="profile-binding-edit-page__save-btn"
      onClick={() => void handleSave()}
      disabled={saveDisabled}
    >
      {labels.save}
    </button>
  );

  return (
    <div className="profile-binding-edit-page user-center-page">
      <Navbar title={title} onBack={onBack} rightElement={saveButton} />

      <div className="profile-binding-edit-page__scroll user-center-page__scroll">
        {error && !isLoading ? (
          <div className="profile-binding-edit-page__alert" role="status">
            <span className="profile-binding-edit-page__alert-text">{labels.loadFailedNotice}</span>
            <button
              type="button"
              className="profile-binding-edit-page__alert-retry"
              onClick={() => void loadProfile()}
            >
              {labels.retry}
            </button>
          </div>
        ) : null}

        {!profile && isLoading ? (
          <CellGroup>
            <div className="profile-binding-edit-page__skeleton">
              <Skeleton width="100%" height={54} style={{ borderRadius: 0 }} />
            </div>
          </CellGroup>
        ) : null}

        {!isLoading && !profile ? (
          <CellGroup>
            <CellItem
              title={labels.emptyTitle}
              description={labels.emptyDescription}
              value={labels.retry}
              isLink
              noBorder
              onClick={() => void loadProfile()}
            />
          </CellGroup>
        ) : null}

        {profile ? (
          <>
            <CellGroup>
              <CellItem title={tr('profile.bind_action', 'Manage')} value={currentStatus} />
              <CellItem title={tr('profile.title', 'Profile')} value={currentValue} noBorder />
            </CellGroup>

            <div className="profile-binding-edit-page__form">
              {resolvedField === 'email' || resolvedField === 'phone' ? (
                <>
                  <input
                    type="text"
                    className="profile-binding-edit-page__input"
                    value={account}
                    onChange={(event) => {
                      setAccount(event.target.value);
                      setLocalError('');
                    }}
                    placeholder={resolvedField === 'email' ? labels.bindEmailInput : labels.bindPhoneInput}
                    autoComplete={resolvedField === 'email' ? 'email' : 'tel'}
                  />
                  <input
                    type="text"
                    className="profile-binding-edit-page__input profile-binding-edit-page__input--last"
                    value={verifyCode}
                    onChange={(event) => {
                      setVerifyCode(event.target.value);
                      setLocalError('');
                    }}
                    placeholder={resolvedField === 'email' ? labels.bindEmailCode : labels.bindPhoneCode}
                    autoComplete="one-time-code"
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    className="profile-binding-edit-page__input"
                    value={authCode}
                    onChange={(event) => {
                      setAuthCode(event.target.value);
                      setLocalError('');
                    }}
                    placeholder={labels.bindSocialCode}
                  />
                  <input
                    type="text"
                    className="profile-binding-edit-page__input profile-binding-edit-page__input--last"
                    value={thirdPartyUserId}
                    onChange={(event) => {
                      setThirdPartyUserId(event.target.value);
                      setLocalError('');
                    }}
                    placeholder={labels.bindSocialUid}
                  />
                </>
              )}

              {localError ? (
                <div className="profile-binding-edit-page__error">{localError}</div>
              ) : null}
            </div>

            <div className="profile-binding-edit-page__actions">
              <button
                type="button"
                className="profile-binding-edit-page__unbind-btn"
                onClick={() => void handleUnbind()}
                disabled={unbindDisabled}
              >
                {labels.unbind}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileBindingEditPage;
