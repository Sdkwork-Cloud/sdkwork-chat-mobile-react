import React from 'react';
import { CellGroup, CellItem, Navbar } from '@sdkwork/react-mobile-commons';
import './AccountSecurityPage.css';

interface AccountSecurityPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onProfileInfoClick?: () => void;
  onQRCodeClick?: () => void;
  onPasswordClick?: () => void;
  onPhoneClick?: () => void;
  onEmailClick?: () => void;
  onWechatClick?: () => void;
  onQqClick?: () => void;
  onActivityHistoryClick?: () => void;
  onUserSettingsClick?: () => void;
  onAddressClick?: () => void;
  onInvoiceClick?: () => void;
}

export const AccountSecurityPage: React.FC<AccountSecurityPageProps> = ({
  t,
  onBack,
  onProfileInfoClick,
  onQRCodeClick,
  onPasswordClick,
  onPhoneClick,
  onEmailClick,
  onWechatClick,
  onQqClick,
  onActivityHistoryClick,
  onUserSettingsClick,
  onAddressClick,
  onInvoiceClick,
}) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  return (
    <div className="account-security-page user-center-page">
      <Navbar title={tr('settings.account', 'Account & Security')} onBack={onBack} />

      <div className="account-security-page__scroll user-center-page__scroll">
        <CellGroup title={tr('settings.groups.account', 'Account & Security')}>
          <CellItem
            title={tr('profile.title', 'Profile')}
            description={tr('settings.account_profile_desc', 'Manage avatar, name, region and signature')}
            isLink
            onClick={onProfileInfoClick}
          />
          <CellItem
            title={tr('profile.qrcode', 'My QR Code')}
            description={tr('settings.account_qrcode_desc', 'Show your personal QR code for contacts')}
            isLink
            onClick={onQRCodeClick}
          />
          <CellItem
            title={tr('profile.change_password', 'Change Password')}
            description={tr('settings.account_password_desc', 'Update login password and security verification')}
            isLink
            onClick={onPasswordClick}
          />
          <CellItem
            title={tr('profile.bind_phone', 'Phone')}
            description={tr('settings.account_phone_desc', 'Bind or update mobile number')}
            isLink
            onClick={onPhoneClick}
          />
          <CellItem
            title={tr('profile.bind_email', 'Email')}
            description={tr('settings.account_email_desc', 'Bind email for account recovery')}
            isLink
            onClick={onEmailClick}
          />
          <CellItem
            title={tr('profile.bind_wechat', 'WeChat')}
            description={tr('settings.account_wechat_desc', 'Bind WeChat for fast sign-in')}
            isLink
            onClick={onWechatClick}
          />
          <CellItem
            title={tr('profile.bind_qq', 'QQ')}
            description={tr('settings.account_qq_desc', 'Bind QQ for fast sign-in')}
            isLink
            onClick={onQqClick}
            noBorder
          />
        </CellGroup>

        <CellGroup title={tr('settings.account_security_center', 'Security Center')}>
          <CellItem
            title={tr('profile.activity_history', 'Activity History')}
            description={tr('settings.account_activity_desc', 'Review your recent account activity')}
            isLink
            onClick={onActivityHistoryClick}
          />
          <CellItem
            title={tr('profile.user_settings', 'User Settings')}
            description={tr('settings.account_preferences_desc', 'Manage privacy and notification preferences')}
            isLink
            onClick={onUserSettingsClick}
            noBorder
          />
        </CellGroup>

        <CellGroup title={tr('settings.account_services', 'Service Info')}>
          <CellItem
            title={tr('profile.address', 'My Addresses')}
            description={tr('settings.account_address_desc', 'Manage shipping and contact addresses')}
            isLink
            onClick={onAddressClick}
          />
          <CellItem
            title={tr('profile.invoice', 'Invoice Titles')}
            description={tr('settings.account_invoice_desc', 'Manage invoice headers for orders')}
            isLink
            onClick={onInvoiceClick}
            noBorder
          />
        </CellGroup>
      </div>
    </div>
  );
};

export default AccountSecurityPage;
