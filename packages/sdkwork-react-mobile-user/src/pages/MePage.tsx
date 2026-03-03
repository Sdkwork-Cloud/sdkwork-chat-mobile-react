import React, { useEffect, useMemo, useState } from 'react';
import { Icon, Page, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import './MePage.css';

interface MePageProps {
  t?: (key: string) => string;
  onProfileClick?: () => void;
  onQRCodeClick?: () => void;
  onWalletClick?: () => void;
  onDistributionClick?: () => void;
  onGigsClick?: () => void;
  onCreationsClick?: () => void;
  onAgentsClick?: () => void;
  onMomentsClick?: () => void;
  onCartClick?: () => void;
  onFavoritesClick?: () => void;
  onCardsClick?: () => void;
  onOrdersClick?: () => void;
  onAppointmentsClick?: () => void;
  onSettingsClick?: () => void;
}

const UserHeader = ({
  profile,
  loading,
  onProfileClick,
  tr,
  statusOptions,
}: {
  profile: any;
  loading: boolean;
  onProfileClick?: () => void;
  tr: (key: string, fallback: string) => string;
  statusOptions: Array<{ icon: string; text: string }>;
}) => {
  const [currentStatus, setCurrentStatus] = useState<{ icon: string; text: string } | null>(null);
  const avatarUrl = profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=OpenChat';

  useEffect(() => {
    if (profile?.status?.isActive) {
      setCurrentStatus({
        icon: profile.status.icon,
        text: profile.status.text,
      });
    }
  }, [profile]);

  const handleStatusClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    setCurrentStatus(randomStatus);
    Toast.success(`${tr('me.status_updated', 'Status updated')}: ${randomStatus.icon} ${randomStatus.text}`);
  };

  if (loading || !profile) {
    return (
      <div className="me-page__header-shell">
        <Skeleton width="100%" height={180} style={{ borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div className="me-page__header-shell">
      <button type="button" className="me-page__header-card" onClick={onProfileClick}>
        <span className="me-page__header-orb me-page__header-orb--top" aria-hidden="true" />
        <span className="me-page__header-orb me-page__header-orb--bottom" aria-hidden="true" />

        <div className="me-page__header-content">
          <div className="me-page__avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />

          <div className="me-page__header-main">
            <div className="me-page__name">{profile.name}</div>
            <div className="me-page__id-row">
              <div className="me-page__wxid">ID: {profile.wxid}</div>
            </div>

            <div onClick={handleStatusClick} className="me-page__status-pill">
              <span className="me-page__status-text">
                {currentStatus ? `${currentStatus.icon} ${currentStatus.text}` : `+ ${tr('me.set_status', 'Set Status')}`}
              </span>
            </div>
          </div>

          <div className="me-page__header-arrow">
            <Icon name="arrow-right" size={24} color="white" />
          </div>
        </div>
      </button>
    </div>
  );
};

const Cell = ({
  title,
  icon,
  label,
  isLink,
  isLast = false,
  onClick,
}: {
  title: string;
  icon?: React.ReactNode;
  label?: string;
  isLink?: boolean;
  isLast?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`me-page__cell ${isLast ? 'me-page__cell--last' : ''}`}
    disabled={!onClick}
  >
    {icon ? <div className="me-page__cell-icon">{icon}</div> : null}
    <div className="me-page__cell-title">{title}</div>
    {label ? <div className="me-page__cell-label">{label}</div> : null}
    {isLink ? (
      <span className="me-page__cell-arrow">
        <Icon name="arrow-right" size={18} color="var(--text-secondary)" />
      </span>
    ) : null}
  </button>
);

const CellGroup = ({ children }: { children: React.ReactNode }) => <div className="me-page__group">{children}</div>;

export const MePage: React.FC<MePageProps> = ({
  t,
  onProfileClick,
  onQRCodeClick,
  onWalletClick,
  onDistributionClick,
  onGigsClick,
  onCreationsClick,
  onAgentsClick,
  onMomentsClick,
  onCartClick,
  onFavoritesClick,
  onCardsClick,
  onOrdersClick,
  onAppointmentsClick,
  onSettingsClick,
}) => {
  const { profile, isLoading } = useUser();

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
      { icon: '✨', text: tr('me.status_options.lucky', 'Feeling lucky') },
      { icon: '💻', text: tr('me.status_options.coding', 'Coding') },
      { icon: '☕', text: tr('me.status_options.coffee', 'Coffee time') },
      { icon: '🌙', text: tr('me.status_options.sleeping', 'Sleeping') },
    ],
    [tr]
  );

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

  return (
    <Page title={tr('layout.tabbar.me', 'Me')} showBack={false} noPadding background="var(--bg-body)" rightElement={navbarActions}>
      <div className="me-page">
        <UserHeader profile={profile} loading={isLoading} onProfileClick={onProfileClick} tr={tr} statusOptions={statusOptions} />

        <CellGroup>
          <Cell
            title={tr('me.pay_service', 'Pay Service')}
            icon={<Icon name="wallet" size={20} color="#07c160" />}
            isLink
            onClick={onWalletClick}
          />
          <Cell
            title={tr('me.distribution', 'Distribution')}
            icon={<Icon name="distribution" size={20} color="var(--primary-color)" />}
            isLink
            onClick={onDistributionClick}
          />
          <Cell
            title={tr('me.gigs', 'My Gigs')}
            icon={<Icon name="gig" size={20} color="#ff9a44" />}
            isLink
            isLast
            onClick={onGigsClick}
          />
        </CellGroup>

        <CellGroup>
          <Cell
            title={tr('me.creations', 'My Creations')}
            icon={<Icon name="creation" size={20} color="#FF9C6E" />}
            isLink
            onClick={onCreationsClick}
          />
          <Cell
            title={tr('me.agents', 'My Agents')}
            icon={<Icon name="agents" size={20} color="#7928CA" />}
            isLink
            isLast
            onClick={onAgentsClick}
          />
        </CellGroup>

        <CellGroup>
          <Cell
            title={tr('me.moments', 'Moments')}
            icon={<Icon name="moments" size={20} color="#4080ff" />}
            isLink
            onClick={onMomentsClick}
          />
          <Cell
            title={tr('me.cart', 'Cart')}
            icon={<Icon name="shop" size={20} color="#fa5151" />}
            isLink
            onClick={onCartClick}
          />
          <Cell
            title={tr('me.favorites', 'Favorites')}
            icon={<Icon name="favorites" size={20} color="#E6A23C" />}
            isLink
            onClick={onFavoritesClick}
          />
          <Cell
            title={tr('me.cards', 'Cards')}
            icon={<Icon name="card" size={20} color="#4080ff" />}
            isLink
            onClick={onCardsClick}
          />
          <Cell
            title={tr('me.orders', 'Orders')}
            icon={<Icon name="order" size={20} color="#ff9a44" />}
            label={tr('me.order_label', 'Purchase Orders')}
            isLink
            onClick={onOrdersClick}
          />
          <Cell
            title={tr('me.appointments', 'Appointments')}
            icon={<Icon name="service" size={20} color="#2979FF" />}
            isLink
            isLast
            onClick={onAppointmentsClick}
          />
        </CellGroup>

        <CellGroup>
          <Cell
            title={tr('me.settings', 'Settings')}
            icon={<Icon name="settings" size={20} color="#7585a9" />}
            isLink
            isLast
            onClick={onSettingsClick}
          />
        </CellGroup>
      </div>
    </Page>
  );
};

export default MePage;
