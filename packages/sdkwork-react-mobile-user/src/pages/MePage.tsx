import React, { useEffect, useMemo, useState } from 'react';
import { CellGroup, CellItem, Icon, Page, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import { UserProfileHeader } from '../components/UserProfileHeader';
import './MePage.css';

interface MePageProps {
  t?: (key: string) => string;
  onProfileClick?: () => void;
  onActivityHistoryClick?: () => void;
  onQRCodeClick?: () => void;
  onVipClick?: () => void;
  onWalletClick?: () => void;
  onDistributionClick?: () => void;
  onGigsClick?: () => void;
  onCreationsClick?: () => void;
  onAgentsClick?: () => void;
  onCartClick?: () => void;
  onFavoritesClick?: () => void;
  onCardsClick?: () => void;
  onOrdersClick?: () => void;
  onAppointmentsClick?: () => void;
  onSettingsClick?: () => void;
}

export const MePage: React.FC<MePageProps> = ({
  t,
  onProfileClick,
  onActivityHistoryClick,
  onQRCodeClick,
  onVipClick,
  onWalletClick,
  onDistributionClick,
  onGigsClick,
  onCreationsClick,
  onAgentsClick,
  onCartClick,
  onFavoritesClick,
  onCardsClick,
  onOrdersClick,
  onAppointmentsClick,
  onSettingsClick,
}) => {
  const { profile, isLoading, error, loadProfile } = useUser();
  const [currentStatus, setCurrentStatus] = useState<{ icon: string; text: string } | null>(null);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { icon: '\u2728', text: tr('me.status_options.lucky', 'Feeling lucky') },
      { icon: '\ud83d\udcbb', text: tr('me.status_options.coding', 'Coding') },
      { icon: '\u2615', text: tr('me.status_options.coffee', 'Coffee time') },
      { icon: '\ud83d\ude34', text: tr('me.status_options.sleeping', 'Sleeping') },
    ],
    [tr]
  );

  useEffect(() => {
    if (profile?.status?.isActive) {
      setCurrentStatus({
        icon: profile.status.icon,
        text: profile.status.text,
      });
      return;
    }
    setCurrentStatus(null);
  }, [profile]);

  const handleStatusClick = React.useCallback(() => {
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    setCurrentStatus(randomStatus);
    Toast.success(`${tr('me.status_updated', 'Status updated')}: ${randomStatus.icon} ${randomStatus.text}`);
  }, [statusOptions, tr]);

  const navbarActions = useMemo(
    () => (
      <div className="me-page__navbar-actions">
        <button
          type="button"
          className="me-page__navbar-action-btn"
          onClick={onQRCodeClick}
          aria-label="qrcode"
        >
          <Icon name="qrcode" size={18} />
        </button>
        <button
          type="button"
          className="me-page__navbar-action-btn"
          onClick={onSettingsClick}
          aria-label="settings"
        >
          <Icon name="settings" size={18} />
        </button>
      </div>
    ),
    [onQRCodeClick, onSettingsClick]
  );

  const displayName = profile?.name?.trim() || tr('me.default_name', 'WeChat User');
  const profileId = profile?.wxid?.trim();
  const idText = profileId ? `ID: ${profileId}` : tr('me.default_id', 'ID: --');
  const avatarUrl = profile?.avatar?.trim() || undefined;
  const profileLoadFailedText = tr('profile.load_failed_notice', 'Profile refresh failed. Showing available local data.');

  return (
    <Page title={tr('layout.tabbar.me', 'Me')} showBack={false} noPadding background="var(--bg-body)" rightElement={navbarActions}>
      <div className="me-page user-center-page">
        {isLoading && !profile ? (
          <div className="me-page__header-skeleton">
            <Skeleton width="100%" height={88} style={{ borderRadius: 0 }} />
          </div>
        ) : (
          <UserProfileHeader
            name={displayName}
            idText={idText}
            avatarUrl={avatarUrl}
            statusText={currentStatus ? `${currentStatus.icon} ${currentStatus.text}` : undefined}
            statusPlaceholder={`+ ${tr('me.set_status', 'Set Status')}`}
            onClick={onProfileClick}
            onStatusClick={handleStatusClick}
          />
        )}

        {error && !isLoading ? (
          <div className="me-page__profile-alert" role="status">
            <span className="me-page__profile-alert-text">{profileLoadFailedText}</span>
            <button
              type="button"
              className="me-page__profile-alert-retry"
              onClick={() => void loadProfile()}
            >
              {tr('common.refresh', 'Refresh')}
            </button>
          </div>
        ) : null}

        <CellGroup>
          <CellItem
            title={tr('me.vip', 'VIP Center')}
            icon={<Icon name="card" size={20} color="#f59e0b" />}
            isLink
            onClick={onVipClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.pay_service', 'Pay Service')}
            icon={<Icon name="wallet" size={20} color="#07c160" />}
            isLink
            onClick={onWalletClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.distribution', 'Distribution')}
            icon={<Icon name="distribution" size={20} color="var(--primary-color)" />}
            isLink
            onClick={onDistributionClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.gigs', 'My Gigs')}
            icon={<Icon name="gig" size={20} color="#ff9a44" />}
            isLink
            noBorder
            onClick={onGigsClick}
            iconClassName="me-page__cell-icon"
          />
        </CellGroup>

        <CellGroup>
          <CellItem
            title={tr('me.creations', 'My Creations')}
            icon={<Icon name="creation" size={20} color="#ff9c6e" />}
            isLink
            onClick={onCreationsClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.agents', 'My Agents')}
            icon={<Icon name="agents" size={20} color="#7928ca" />}
            isLink
            noBorder
            onClick={onAgentsClick}
            iconClassName="me-page__cell-icon"
          />
        </CellGroup>

        <CellGroup>
          <CellItem
            title={tr('me.cart', 'Cart')}
            icon={<Icon name="shop" size={20} color="#fa5151" />}
            isLink
            onClick={onCartClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.favorites', 'Favorites')}
            icon={<Icon name="favorites" size={20} color="#e6a23c" />}
            isLink
            onClick={onFavoritesClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.cards', 'Cards')}
            icon={<Icon name="card" size={20} color="#4080ff" />}
            isLink
            onClick={onCardsClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.orders', 'Orders')}
            icon={<Icon name="order" size={20} color="#ff9a44" />}
            value={tr('me.order_label', 'Purchase Orders')}
            isLink
            onClick={onOrdersClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.appointments', 'Appointments')}
            icon={<Icon name="service" size={20} color="#2979ff" />}
            isLink
            noBorder
            onClick={onAppointmentsClick}
            iconClassName="me-page__cell-icon"
          />
        </CellGroup>

        <CellGroup>
          <CellItem
            title={tr('me.activity_history', 'Activity History')}
            icon={<Icon name="order" size={20} color="#07c160" />}
            isLink
            onClick={onActivityHistoryClick}
            iconClassName="me-page__cell-icon"
          />
          <CellItem
            title={tr('me.settings', 'Settings')}
            icon={<Icon name="settings" size={20} color="#7585a9" />}
            isLink
            noBorder
            onClick={onSettingsClick}
            iconClassName="me-page__cell-icon"
          />
        </CellGroup>
      </div>
    </Page>
  );
};

export default MePage;
