
import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Navbar, Avatar, Toast, Icon } from '@sdkwork/react-mobile-commons';
import { contactsService } from '../services/ContactsService';
import type { Contact } from '../types';
import './ContactsPage.css';

interface ContactsPageProps {
  t?: (key: string) => string;
  mode?: 'select' | 'view';
  action?: 'forward' | 'create_group';
  onBack?: () => void;
  onContactClick?: (contact: Contact) => void;
  onNewFriendsClick?: () => void;
  onGroupsClick?: () => void;
  onAgentsClick?: () => void;
  onSearchClick?: () => void;
  onConfirmSelection?: (selectedIds: string[]) => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({
  t,
  mode = 'view',
  action,
  onBack,
  onContactClick,
  onNewFriendsClick,
  onGroupsClick,
  onAgentsClick,
  onSearchClick,
  onConfirmSelection,
  onNavigate,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const indexBarRef = useRef<HTMLDivElement>(null);
  const hideIndexTimerRef = useRef<number | null>(null);
  const isMouseIndexingRef = useRef(false);
  const [groups, setGroups] = useState<Record<string, Contact[]>>({});
  const [sortedKeys, setSortedKeys] = useState<string[]>([]);
  const [viewStatus, setViewStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState('');
  const tr = useCallback(
    (key: string, fallback: string, params?: Record<string, string | number>) => {
      const value = t?.(key);
      const resolved = value && value !== key ? value : fallback;
      if (!params) return resolved;
      return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, String(paramValue)),
        resolved
      );
    },
    [t]
  );

  const loadData = useCallback(async () => {
    setViewStatus('loading');
    try {
      const result = await contactsService.getGroupedContacts();
      if (result.groups && result.sortedKeys) {
        setGroups(result.groups);
        setSortedKeys(result.sortedKeys);
      }
      const requests = await contactsService.getFriendRequests();
      setPendingRequestCount(requests.filter((r) => r.status === 'pending').length);
      setViewStatus('success');
    } catch (_error) {
      setViewStatus('error');
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  React.useEffect(() => {
    return () => {
      if (hideIndexTimerRef.current !== null) {
        window.clearTimeout(hideIndexTimerRef.current);
      }
    };
  }, []);

  const handleScrollToIndex = useCallback((char: string, behavior: ScrollBehavior = 'smooth') => {
    if (!char) return;
    const targetId = char === '↑' ? 'top-anchor' : `anchor-${char}`;
    const element = document.getElementById(targetId);
    if (element && scrollRef.current) {
      const topOffset = element.offsetTop - (char === '↑' ? 0 : 54);
      scrollRef.current.scrollTo({ top: topOffset, behavior });
    }
  }, []);

  const showIndexIndicator = useCallback((char: string, keepVisible = false) => {
    if (!char) return;
    setActiveIndex(char);
    if (hideIndexTimerRef.current !== null) {
      window.clearTimeout(hideIndexTimerRef.current);
      hideIndexTimerRef.current = null;
    }
    if (!keepVisible) {
      hideIndexTimerRef.current = window.setTimeout(() => {
        setActiveIndex('');
      }, 420);
    }
  }, []);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleConfirmAction = async () => {
    if (selectedIds.size === 0) return;

    if (action === 'forward') {
      Toast.loading(tr('contacts.forwarding', 'Forwarding...'));
      await new Promise((resolve) => setTimeout(resolve, 700));
      Toast.success(tr('contacts.forwarded', 'Forwarded to {count} contacts', { count: selectedIds.size }));
      onBack?.();
      return;
    }

    Toast.loading(tr('contacts.processing', 'Processing...'));
    onConfirmSelection?.(Array.from(selectedIds));
  };

  const handleContactOpen = (contact: Contact) => {
    if (mode === 'select') {
      toggleSelection(contact.id);
      return;
    }

    if (onContactClick) {
      onContactClick(contact);
      return;
    }

    onNavigate?.('/contact-profile', { id: contact.id });
  };

  const isSelectMode = mode === 'select';
  const title = isSelectMode
    ? (action === 'forward'
      ? tr('contacts.select_forward', 'Select Forward Target')
      : tr('contacts.select_contact', 'Select Contact'))
    : tr('contacts.title', 'Contacts');
  const actionLabel = action === 'forward' ? tr('contacts.action_forward', 'Forward') : tr('contacts.action_done', 'Done');
  const indexList = useMemo(() => ['↑', ...sortedKeys], [sortedKeys]);
  const totalCount = Object.values(groups).reduce((acc, curr) => acc + curr.length, 0);

  const resolveIndexByClientY = useCallback((clientY: number): string => {
    const bar = indexBarRef.current;
    if (!bar || indexList.length === 0) return '';
    const rect = bar.getBoundingClientRect();
    if (rect.height <= 0) return '';
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height - 1);
    const index = Math.floor((y / rect.height) * indexList.length);
    return indexList[index] || '';
  }, [indexList]);

  const handleIndexTouchAt = useCallback((clientY: number) => {
    const char = resolveIndexByClientY(clientY);
    if (!char) return;
    handleScrollToIndex(char, 'auto');
    showIndexIndicator(char, true);
  }, [handleScrollToIndex, resolveIndexByClientY, showIndexIndicator]);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseIndexingRef.current) return;
      handleIndexTouchAt(event.clientY);
    };

    const handleMouseUp = () => {
      if (!isMouseIndexingRef.current) return;
      isMouseIndexingRef.current = false;
      if (activeIndex) {
        showIndexIndicator(activeIndex, false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeIndex, handleIndexTouchAt, showIndexIndicator]);

  const rightElement = isSelectMode ? (
    <button
      type="button"
      className="contacts-page__confirm-btn"
      onClick={handleConfirmAction}
      disabled={selectedIds.size === 0}
    >
      {actionLabel}
      {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
    </button>
  ) : (
    <button type="button" className="contacts-page__new-friend-btn" onClick={onNewFriendsClick}>
      <Icon name="addUser" size={20} />
    </button>
  );

  return (
    <div className="contacts-page">
      <Navbar title={title} rightElement={rightElement} showBack={isSelectMode} onBack={onBack} />

      <div ref={scrollRef} className="contacts-page__scroll">
        <div id="top-anchor" />

        {!isSelectMode ? (
          <>
            <div className="contacts-page__search-wrap">
              <button type="button" className="contacts-page__search-btn" onClick={onSearchClick}>
                <Icon name="search" size={16} />
                <span>{tr('common.search', 'Search')}</span>
              </button>
            </div>

            <div className="contacts-page__quick-panel">
              <button type="button" className="contacts-page__quick-item" onClick={onNewFriendsClick}>
                <span className="contacts-page__quick-icon is-orange">
                  <Icon name="addUser" size={18} color="#fff" />
                </span>
                <span className="contacts-page__quick-title">{tr('contacts.new_friends', 'New Friends')}</span>
                {pendingRequestCount > 0 ? (
                  <span className="contacts-page__quick-badge">{pendingRequestCount > 99 ? '99+' : pendingRequestCount}</span>
                ) : null}
                <Icon name="arrow-right" size={16} color="var(--text-secondary)" />
              </button>

              <button type="button" className="contacts-page__quick-item" onClick={onGroupsClick}>
                <span className="contacts-page__quick-icon is-green">
                  <Icon name="group" size={18} color="#fff" />
                </span>
                <span className="contacts-page__quick-title">{tr('contacts.groups', 'Group Chats')}</span>
                <Icon name="arrow-right" size={16} color="var(--text-secondary)" />
              </button>

              <button type="button" className="contacts-page__quick-item" onClick={onAgentsClick}>
                <span className="contacts-page__quick-icon is-blue">
                  <Icon name="agents" size={18} color="#fff" />
                </span>
                <span className="contacts-page__quick-title">{tr('contacts.agents', 'Agents')}</span>
                <Icon name="arrow-right" size={16} color="var(--text-secondary)" />
              </button>
            </div>
          </>
        ) : null}

        {viewStatus === 'loading' ? (
          <div className="contacts-page__status">{tr('contacts.loading', 'Loading...')}</div>
        ) : null}

        {viewStatus === 'error' ? (
          <div className="contacts-page__status">
            <span>{tr('contacts.load_failed', 'Load failed')}</span>
            <button type="button" onClick={() => void loadData()}>
              {tr('contacts.retry', 'Retry')}
            </button>
          </div>
        ) : null}

        {viewStatus === 'success' ? (
          <>
            {sortedKeys.map((char) => (
              <section key={char} id={`anchor-${char}`} className="contacts-page__group">
                <div className="contacts-page__group-header">{char}</div>
                <div className="contacts-page__group-list">
                  {groups[char].map((contact, index) => (
                    <button
                      key={contact.id}
                      type="button"
                      className={`contacts-page__row${index === groups[char].length - 1 ? ' is-last' : ''}`}
                      onClick={() => handleContactOpen(contact)}
                    >
                      {isSelectMode ? (
                        <span className={`contacts-page__selector${selectedIds.has(contact.id) ? ' is-selected' : ''}`}>
                          {selectedIds.has(contact.id) ? <Icon name="check" size={13} color="#fff" /> : null}
                        </span>
                      ) : null}
                      <Avatar src={contact.avatar} name={contact.name} size="md" shape="rounded" />
                      <span className="contacts-page__row-main">
                        <span className="contacts-page__row-name">{contact.name}</span>
                        {!isSelectMode ? (
                          <span className="contacts-page__row-meta">
                            {tr('contacts.wxid_prefix', 'ID')}: {contact.wxid}
                          </span>
                        ) : null}
                      </span>
                      {!isSelectMode ? <Icon name="arrow-right" size={16} color="var(--text-secondary)" /> : null}
                    </button>
                  ))}
                </div>
              </section>
            ))}

            <div className="contacts-page__footer-count">
              {tr('contacts.total_friends', '{count} contacts', { count: totalCount })}
            </div>
          </>
        ) : null}
      </div>

      {viewStatus === 'success' ? (
        <div
          ref={indexBarRef}
          className="contacts-page__index-bar"
          onTouchStart={(event) => {
            const firstTouch = event.touches[0];
            if (!firstTouch) return;
            handleIndexTouchAt(firstTouch.clientY);
          }}
          onTouchMove={(event) => {
            const firstTouch = event.touches[0];
            if (!firstTouch) return;
            event.preventDefault();
            handleIndexTouchAt(firstTouch.clientY);
          }}
          onTouchEnd={() => {
            if (!activeIndex) return;
            showIndexIndicator(activeIndex, false);
          }}
          onMouseDown={(event) => {
            isMouseIndexingRef.current = true;
            handleIndexTouchAt(event.clientY);
          }}
        >
          {indexList.map((char) => (
            <button
              key={char}
              type="button"
              className={activeIndex === char ? 'is-active' : ''}
              onClick={() => {
                handleScrollToIndex(char, 'smooth');
                showIndexIndicator(char, false);
              }}
            >
              {char}
            </button>
          ))}
        </div>
      ) : null}
      {viewStatus === 'success' && activeIndex ? (
        <div className="contacts-page__index-indicator">{activeIndex}</div>
      ) : null}
    </div>
  );
};

export default ContactsPage;
