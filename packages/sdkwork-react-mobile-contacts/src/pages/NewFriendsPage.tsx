
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar, Avatar, Toast, Icon, DateUtils } from '@sdkwork/react-mobile-commons';
import { contactsService } from '../services/ContactsService';
import type { FriendRequest } from '../types';
import './NewFriendsPage.css';

interface NewFriendsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onAddFriend?: () => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
  onRequestClick?: (request: FriendRequest) => void;
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

export const NewFriendsPage: React.FC<NewFriendsPageProps> = ({
  t,
  onBack,
  onAddFriend,
  onNavigate,
  onRequestClick,
}) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const navigate = useCallback(
    (path: string, params?: Record<string, string>) => {
      if (onNavigate) {
        onNavigate(path, params);
        return;
      }
      dispatchRoute(path, params);
    },
    [onNavigate]
  );

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contactsService.getFriendRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleAccept = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await contactsService.acceptFriendRequest(id);
      setRequests((prev) => prev.map((item) => (
        item.id === id ? { ...item, status: 'accepted', updateTime: Date.now() } : item
      )));
      Toast.success(tr('new_friends.toast_accept_success', 'Added'));
    } catch (_error) {
      Toast.error(tr('new_friends.toast_action_failed', 'Action failed, please try again'));
      await loadRequests();
    }
  }, [loadRequests, tr]);

  const handleReject = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await contactsService.rejectFriendRequest(id);
      setRequests((prev) => prev.map((item) => (
        item.id === id ? { ...item, status: 'rejected', updateTime: Date.now() } : item
      )));
      Toast.success(tr('new_friends.toast_reject_success', 'Rejected'));
    } catch (_error) {
      Toast.error(tr('new_friends.toast_action_failed', 'Action failed, please try again'));
      await loadRequests();
    }
  }, [loadRequests, tr]);

  const handleAddFriend = useCallback(() => {
    if (onAddFriend) {
      onAddFriend();
      return;
    }
    navigate('/add-friend');
  }, [navigate, onAddFriend]);

  const handleRequestOpen = useCallback(async (request: FriendRequest) => {
    if (request.status !== 'accepted') return;
    if (onRequestClick) {
      onRequestClick(request);
      return;
    }
    const contact = await contactsService.findByName(request.fromUserName);
    if (contact?.id) {
      navigate('/contact-profile', { id: contact.id });
      return;
    }
    navigate('/add-friend');
  }, [navigate, onRequestClick]);

  const orderedRequests = useMemo(
    () => [...requests].sort((a, b) => b.createTime - a.createTime),
    [requests]
  );

  return (
    <div className="new-friends-page">
      <Navbar
        title={tr('new_friends.title', 'New Friends')}
        onBack={onBack}
        rightElement={
          <button type="button" className="new-friends-page__add-btn" onClick={handleAddFriend}>
            {tr('new_friends.add_friend', 'Add Friend')}
          </button>
        }
      />

      <div className="new-friends-page__tip" role="status">
        <Icon name="sparkles" size={14} color="var(--primary-color)" />
        <span>{tr('new_friends.tip', 'Add friends by ID, phone number or scan')}</span>
      </div>

      <div className="new-friends-page__section-title">{tr('new_friends.section_recent', 'Recent')}</div>
      <div className="new-friends-page__list">
        {loading ? (
          <div className="new-friends-page__status">{tr('new_friends.loading', 'Loading...')}</div>
        ) : orderedRequests.length > 0 ? (
          orderedRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isAccepted = req.status === 'accepted';

            return (
              <div
                key={req.id}
                className={`new-friends-page__item${isAccepted ? ' is-clickable' : ''}`}
                onClick={() => {
                  void handleRequestOpen(req);
                }}
                role={isAccepted ? 'button' : undefined}
                tabIndex={isAccepted ? 0 : -1}
                onKeyDown={(event) => {
                  if (!isAccepted) return;
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  void handleRequestOpen(req);
                }}
              >
                <Avatar src={req.fromUserAvatar} name={req.fromUserName} size="lg" shape="rounded" />
                <div className="new-friends-page__main">
                  <div className="new-friends-page__row-top">
                    <div className="new-friends-page__name">{req.fromUserName}</div>
                    <div className="new-friends-page__time">{DateUtils.formatRelative(req.createTime)}</div>
                  </div>
                  <div className="new-friends-page__message">
                    {req.message || tr('new_friends.default_message', 'Wants to add you as a friend')}
                  </div>
                </div>
                {isPending ? (
                  <div className="new-friends-page__actions">
                    <button type="button" className="new-friends-page__accept" onClick={(e) => void handleAccept(e, req.id)}>
                      {tr('new_friends.accept', 'Accept')}
                    </button>
                    <button type="button" className="new-friends-page__reject" onClick={(e) => void handleReject(e, req.id)}>
                      {tr('new_friends.reject', 'Reject')}
                    </button>
                  </div>
                ) : (
                  <div className="new-friends-page__tail">
                    <span className={`new-friends-page__status-tag${isAccepted ? ' is-accepted' : ' is-rejected'}`}>
                      {isAccepted ? tr('new_friends.accepted', 'Added') : tr('new_friends.rejected', 'Rejected')}
                    </span>
                    {isAccepted ? <Icon name="arrow-right" size={14} color="var(--text-placeholder)" /> : null}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="new-friends-page__empty">
            <div className="new-friends-page__empty-icon">
              <Icon name="addUser" size={26} />
            </div>
            <div className="new-friends-page__empty-title">{tr('new_friends.empty_title', 'No new friend requests')}</div>
            <div className="new-friends-page__empty-subtitle">
              {tr('new_friends.empty_subtitle', 'Tap the top-right button to add new friends')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewFriendsPage;
