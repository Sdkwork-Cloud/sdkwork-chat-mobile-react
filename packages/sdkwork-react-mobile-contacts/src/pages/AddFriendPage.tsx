import React from 'react';
import { Icon, Page, Toast } from '@sdkwork/react-mobile-commons';
import { contactsService } from '../services/ContactsService';
import './AddFriendPage.css';

interface ScannedUserPayload {
  id?: string;
  name?: string;
}

interface AddFriendPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onSearchClick?: () => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
  scannedUser?: ScannedUserPayload;
  onQuickAddScannedUser?: (payload: ScannedUserPayload) => void;
}

interface FriendEntryItem {
  key: string;
  title: string;
  desc: string;
  icon: string;
  tone: 'blue' | 'green' | 'orange' | 'cyan';
  onClick: () => void;
}

const dispatchRoute = (path: string, params?: Record<string, string>) => {
  const query = params && Object.keys(params).length > 0
    ? `?${new URLSearchParams(params).toString()}`
    : '';
  const nextUrl = `${path}${query}`;
  window.history.pushState({}, '', nextUrl);
  window.dispatchEvent(new CustomEvent('routechange', {
    detail: { path, params: params || {} },
  }));
};

export const AddFriendPage: React.FC<AddFriendPageProps> = ({
  t,
  onBack,
  onSearchClick,
  onNavigate,
  scannedUser,
  onQuickAddScannedUser,
}) => {
  const [pendingRequestCount, setPendingRequestCount] = React.useState(0);
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  React.useEffect(() => {
    let active = true;
    const loadPending = async () => {
      const list = await contactsService.getFriendRequests().catch(() => []);
      if (!active) return;
      const count = list.filter((item) => item.status === 'pending').length;
      setPendingRequestCount(count);
    };
    void loadPending();
    return () => {
      active = false;
    };
  }, []);

  const navigate = React.useCallback(
    (path: string, params?: Record<string, string>) => {
      if (onNavigate) {
        onNavigate(path, params);
        return;
      }
      dispatchRoute(path, params);
    },
    [onNavigate]
  );

  const openSearch = React.useCallback(() => {
    if (onSearchClick) {
      onSearchClick();
      return;
    }
    navigate('/search', { from: 'add-friend' });
  }, [navigate, onSearchClick]);

  const handleQuickAddScannedUser = React.useCallback(() => {
    if (!scannedUser?.id && !scannedUser?.name) return;
    if (onQuickAddScannedUser) {
      onQuickAddScannedUser(scannedUser);
      return;
    }
    Toast.success(tr('add_friend.scan_add_success', 'Friend request sent'));
  }, [onQuickAddScannedUser, scannedUser, tr]);

  const primaryEntries = React.useMemo<FriendEntryItem[]>(
    () => [
      {
        key: 'search',
        title: tr('add_friend.entries.search.title', 'ID / Phone'),
        desc: tr('add_friend.entries.search.desc', 'Search and add by account'),
        icon: 'search',
        tone: 'blue',
        onClick: openSearch,
      },
      {
        key: 'scan',
        title: tr('add_friend.entries.scan.title', 'Scan'),
        desc: tr('add_friend.entries.scan.desc', 'Scan QR code to add friend'),
        icon: 'scan',
        tone: 'green',
        onClick: () => navigate('/scan'),
      },
      {
        key: 'qrcode',
        title: tr('add_friend.entries.qrcode.title', 'My QR Code'),
        desc: tr('add_friend.entries.qrcode.desc', 'Show your QR code to others'),
        icon: 'qrcode',
        tone: 'orange',
        onClick: () => navigate('/my-qrcode'),
      },
    ],
    [navigate, openSearch, tr]
  );

  const secondaryEntries = React.useMemo<FriendEntryItem[]>(
    () => [
      {
        key: 'new-friends',
        title: tr('add_friend.entries.new_friends.title', 'New Friends'),
        desc: tr('add_friend.entries.new_friends.desc', 'View friend requests and history'),
        icon: 'addUser',
        tone: 'orange',
        onClick: () => navigate('/new-friends'),
      },
      {
        key: 'group',
        title: tr('add_friend.entries.group.title', 'Start Group Chat'),
        desc: tr('add_friend.entries.group.desc', 'Select members to create conversation'),
        icon: 'group',
        tone: 'green',
        onClick: () => navigate('/contacts', { mode: 'select', action: 'create_group' }),
      },
      {
        key: 'agents',
        title: tr('add_friend.entries.agents.title', 'Agent Plaza'),
        desc: tr('add_friend.entries.agents.desc', 'Start chatting with official agents'),
        icon: 'agents',
        tone: 'cyan',
        onClick: () => navigate('/agents'),
      },
    ],
    [navigate, tr]
  );

  const renderEntryGroup = (items: FriendEntryItem[]) => (
    <div className="add-friend-page__group">
      {items.map((item, index) => (
        <button
          key={item.key}
          type="button"
          className={`add-friend-page__cell${index === items.length - 1 ? ' is-last' : ''}`}
          onClick={item.onClick}
        >
          <span className={`add-friend-page__cell-icon is-${item.tone}`}>
            <Icon name={item.icon} size={18} color="#fff" />
          </span>
          <span className="add-friend-page__cell-main">
            <span className="add-friend-page__cell-title">{item.title}</span>
            <span className="add-friend-page__cell-desc">{item.desc}</span>
          </span>
          {item.key === 'new-friends' && pendingRequestCount > 0 ? (
            <span className="add-friend-page__cell-badge">
              {pendingRequestCount > 99 ? '99+' : pendingRequestCount}
            </span>
          ) : null}
          <Icon name="arrow-right" size={16} color="var(--text-placeholder)" />
        </button>
      ))}
    </div>
  );

  return (
    <Page
      title={tr('add_friend.title', 'Add Friend')}
      showBack
      noPadding
      onBack={onBack}
      background="var(--bg-body)"
      rightElement={(
        <button
          type="button"
          className="add-friend-page__navbar-btn"
          onClick={() => navigate('/my-qrcode')}
          aria-label="my-qrcode"
        >
          <Icon name="qrcode" size={18} />
        </button>
      )}
    >
      <div className="add-friend-page">
        <button type="button" className="add-friend-page__search" onClick={openSearch}>
          <Icon name="search" size={16} color="var(--text-placeholder)" />
          <span>{tr('add_friend.search_placeholder', 'Search by ID, phone or nickname')}</span>
        </button>

        {scannedUser?.id || scannedUser?.name ? (
          <div className="add-friend-page__scan-result">
            <div className="add-friend-page__scan-main">
              <div className="add-friend-page__scan-title">{tr('add_friend.scan_user_title', 'Recognized User')}</div>
              <div className="add-friend-page__scan-desc">
                {scannedUser.name || scannedUser.id}
                {scannedUser.id ? ` (${scannedUser.id})` : ''}
              </div>
            </div>
            <button type="button" className="add-friend-page__scan-btn" onClick={handleQuickAddScannedUser}>
              {tr('add_friend.scan_add', 'Add')}
            </button>
          </div>
        ) : null}

        <div className="add-friend-page__hero">
          <div className="add-friend-page__hero-icon">
            <Icon name="addUser" size={20} color="#fff" />
          </div>
          <div className="add-friend-page__hero-main">
            <h2>{tr('add_friend.hero_title', 'Quick Add Contacts')}</h2>
            <p>{tr('add_friend.hero_desc', 'Use search or scan first for faster and more accurate results.')}</p>
          </div>
        </div>

        <div className="add-friend-page__section-title">{tr('add_friend.section_methods', 'Methods')}</div>
        {renderEntryGroup(primaryEntries)}

        <div className="add-friend-page__section-title">{tr('add_friend.section_more', 'More')}</div>
        {renderEntryGroup(secondaryEntries)}
      </div>
    </Page>
  );
};

export default AddFriendPage;
