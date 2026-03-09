import React from 'react';
import { useEmailWorkspace } from '../hooks/useEmailWorkspace';
import type { EmailPrimaryTab, EmailThread } from '../services/emailService';
import './EmailPage.css';

interface EmailPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onCompose?: () => void;
  onThreadClick?: (threadId: string) => void;
}

const PRIMARY_TABS: Array<{ id: EmailPrimaryTab; labelKey: string; fallbackLabel: string; shortLabel: string }> = [
  { id: 'inbox', labelKey: 'email.tabs.inbox', fallbackLabel: 'Inbox', shortLabel: 'I' },
  { id: 'starred', labelKey: 'email.tabs.starred', fallbackLabel: 'Starred', shortLabel: 'S' },
  { id: 'sent', labelKey: 'email.tabs.sent', fallbackLabel: 'Sent', shortLabel: 'T' },
  { id: 'spaces', labelKey: 'email.tabs.spaces', fallbackLabel: 'Spaces', shortLabel: 'P' },
];

const renderThreadItem = (thread: EmailThread, onThreadClick?: (threadId: string) => void) => (
  <button
    key={thread.id}
    type="button"
    className="email-page__thread-item"
    onClick={() => onThreadClick?.(thread.id)}
  >
    <div className="email-page__thread-top">
      <span className={`email-page__thread-dot${thread.unread ? ' is-unread' : ''}`} />
      <span className="email-page__thread-sender">{thread.sender}</span>
      <span className="email-page__thread-time">{thread.time}</span>
    </div>
    <div className="email-page__thread-subject">{thread.subject}</div>
    <div className="email-page__thread-bottom">
      {thread.category ? <span className="email-page__thread-tag">{thread.category}</span> : null}
      <span className="email-page__thread-snippet">{thread.snippet}</span>
    </div>
  </button>
);

export const EmailPage: React.FC<EmailPageProps> = ({ t, onBack, onCompose, onThreadClick }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const [activePrimaryTab, setActivePrimaryTab] = React.useState<EmailPrimaryTab>('inbox');
  const { snapshot } = useEmailWorkspace();
  const unreadCount = React.useMemo(
    () => snapshot.inbox.filter((thread) => thread.unread).length,
    [snapshot.inbox]
  );

  const tabLabelMap = React.useMemo(
    () =>
      PRIMARY_TABS.reduce<Record<EmailPrimaryTab, string>>(
        (acc, tab) => {
          acc[tab.id] = tr(tab.labelKey, tab.fallbackLabel);
          return acc;
        },
        {
          inbox: 'Inbox',
          starred: 'Starred',
          sent: 'Sent',
          spaces: 'Spaces',
        }
      ),
    [tr]
  );

  const tabCountMap = React.useMemo(
    () => ({
      inbox: snapshot.inbox.length,
      starred: snapshot.starred.length,
      sent: snapshot.sent.length,
      spaces: snapshot.spaces.length,
    }),
    [snapshot.inbox.length, snapshot.sent.length, snapshot.spaces.length, snapshot.starred.length]
  );

  const activeThreads = React.useMemo(() => {
    if (activePrimaryTab === 'inbox') return snapshot.inbox;
    if (activePrimaryTab === 'starred') return snapshot.starred;
    if (activePrimaryTab === 'sent') return snapshot.sent;
    return [];
  }, [activePrimaryTab, snapshot.inbox, snapshot.sent, snapshot.starred]);

  const activeCount = activePrimaryTab === 'spaces' ? snapshot.spaces.length : activeThreads.length;
  const priorityThreads = React.useMemo(
    () => (activePrimaryTab === 'inbox' ? snapshot.inbox.slice(0, 4) : activeThreads),
    [activePrimaryTab, activeThreads, snapshot.inbox]
  );
  const spacePreview = React.useMemo(() => snapshot.spaces.slice(0, 2), [snapshot.spaces]);

  const workbenchMetrics = React.useMemo(
    () => [
      { key: 'inbox', label: tr('email.metric_inbox', 'Inbox'), value: snapshot.inbox.length },
      { key: 'unread', label: tr('email.metric_unread', 'Unread'), value: unreadCount },
      { key: 'sent', label: tr('email.metric_sent', 'Sent'), value: snapshot.sent.length },
      { key: 'spaces', label: tr('email.metric_spaces', 'Spaces'), value: snapshot.spaces.length },
    ],
    [snapshot.inbox.length, snapshot.sent.length, snapshot.spaces.length, tr, unreadCount]
  );

  const workbenchTitle =
    activePrimaryTab === 'inbox'
      ? tr('email.workbench_title', 'Inbox first')
      : tabLabelMap[activePrimaryTab];

  const workbenchSubtitle =
    activePrimaryTab === 'inbox'
      ? tr(
          'email.workbench_subtitle',
          'Triage priority threads, jump to starred follow-ups, and keep shared spaces within reach.'
        )
      : activePrimaryTab === 'spaces'
        ? tr('email.open_spaces', 'Open spaces')
        : tr('email.overview_subtitle', 'Move from triage to follow-up without losing context');

  const sectionTitle =
    activePrimaryTab === 'inbox'
      ? tr('email.priority_title', 'Priority inbox')
      : tabLabelMap[activePrimaryTab];

  const sectionSubtitle =
    activePrimaryTab === 'spaces'
      ? tr('email.spaces_title', 'Shared spaces')
      : tr('email.overview_subtitle', 'Move from triage to follow-up without losing context');

  const handleCompose = React.useCallback(() => {
    onCompose?.();
  }, [onCompose]);

  const handleOpenSpaces = React.useCallback(() => {
    setActivePrimaryTab('spaces');
  }, []);

  const renderEmptyState = () => (
    <section className="email-page__empty-state">
      <div className="email-page__empty-title">{tr('email.empty_title', 'Nothing in this view yet')}</div>
      <div className="email-page__empty-description">
        {tr('email.empty_description', 'Switch tabs or start a fresh email to keep work moving.')}
      </div>
      <button type="button" className="email-page__empty-action" onClick={handleCompose}>
        {tr('email.compose', 'Compose')}
      </button>
    </section>
  );

  return (
    <div className="email-page">
      <header className="email-page__search-shell">
        <button
          type="button"
          className="email-page__nav-pill"
          onClick={onBack}
          aria-label={tr('email.back', 'Back')}
        >
          <span aria-hidden="true">&lt;</span>
        </button>

        <button type="button" className="email-page__search-field" aria-label={tr('email.search_placeholder', 'Search in mail')}>
          <span className="email-page__search-icon" aria-hidden="true" />
          <span className="email-page__search-placeholder">
            {tr('email.search_placeholder', 'Search in mail')}
          </span>
        </button>

        <button
          type="button"
          className="email-page__account-pill"
          onClick={handleOpenSpaces}
          aria-label={tr('email.open_spaces', 'Open spaces')}
        >
          WK
        </button>
      </header>

      <div className="email-page__body">
        <section className="email-page__workbench">
          <div className="email-page__workbench-head">
            <div className="email-page__workbench-copy">
              <div className="email-page__workbench-kicker">{tr('email.workbench_kicker', 'Mail workbench')}</div>
              <div className="email-page__workbench-title-row">
                <h1 className="email-page__workbench-title">{workbenchTitle}</h1>
                <span className="email-page__workbench-badge">{activeCount}</span>
              </div>
              <p className="email-page__workbench-subtitle">{workbenchSubtitle}</p>
            </div>

            <button type="button" className="email-page__compose-pill" onClick={handleCompose}>
              <span className="email-page__compose-pill-plus" aria-hidden="true">
                +
              </span>
              <span>{tr('email.compose', 'Compose')}</span>
            </button>
          </div>

          <div className="email-page__metric-grid">
            {workbenchMetrics.map((metric) => (
              <article key={metric.key} className="email-page__metric-card">
                <div className="email-page__metric-label">{metric.label}</div>
                <div className="email-page__metric-value">{metric.value}</div>
              </article>
            ))}
          </div>

          <div className="email-page__quick-actions">
            <button type="button" className="email-page__quick-action is-primary" onClick={handleCompose}>
              {tr('email.compose', 'Compose')}
            </button>
            <button
              type="button"
              className="email-page__quick-action"
              onClick={() => setActivePrimaryTab('starred')}
            >
              {tr('email.quick_starred', 'Review starred')}
            </button>
            <button type="button" className="email-page__quick-action" onClick={handleOpenSpaces}>
              {tr('email.open_spaces', 'Open spaces')}
            </button>
          </div>

          <div className="email-page__lane-row">
            {snapshot.summaries.map((item) => (
              <span
                key={item.id}
                className="email-page__lane-chip"
                style={{ ['--email-lane-accent' as string]: item.accent } as React.CSSProperties}
              >
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </span>
            ))}
          </div>
        </section>

        <section className="email-page__section-heading">
          <div>
            <div className="email-page__section-title">{sectionTitle}</div>
            <div className="email-page__section-subtitle">{sectionSubtitle}</div>
          </div>
          <span className="email-page__section-count">{activeCount}</span>
        </section>

        {activePrimaryTab === 'spaces' ? (
          snapshot.spaces.length > 0 ? (
            <section className="email-page__spaces-section">
              <div className="email-page__spaces-grid">
                {snapshot.spaces.map((space) => (
                  <article
                    key={space.id}
                    className="email-page__space-card"
                    style={{ ['--email-space-accent' as string]: space.accent } as React.CSSProperties}
                  >
                    <div className="email-page__space-title">{space.title}</div>
                    <div className="email-page__space-subtitle">{space.subtitle}</div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            renderEmptyState()
          )
        ) : priorityThreads.length > 0 ? (
          <>
            <section className="email-page__priority-list">
              {priorityThreads.map((thread) => renderThreadItem(thread, onThreadClick))}
            </section>

            <section className="email-page__spaces-section">
              <div className="email-page__subsection-heading">
                <div>
                  <div className="email-page__subsection-title">{tr('email.spaces_title', 'Shared spaces')}</div>
                  <div className="email-page__subsection-subtitle">{tr('email.open_spaces', 'Open spaces')}</div>
                </div>
                <button
                  type="button"
                  className="email-page__subsection-link"
                  onClick={handleOpenSpaces}
                >
                  {tr('email.tabs.spaces', 'Spaces')}
                </button>
              </div>

              {spacePreview.length > 0 ? (
                <div className="email-page__spaces-grid is-preview">
                  {spacePreview.map((space) => (
                    <article
                      key={space.id}
                      className="email-page__space-card"
                      style={{ ['--email-space-accent' as string]: space.accent } as React.CSSProperties}
                    >
                      <div className="email-page__space-title">{space.title}</div>
                      <div className="email-page__space-subtitle">{space.subtitle}</div>
                    </article>
                  ))}
                </div>
              ) : (
                renderEmptyState()
              )}
            </section>
          </>
        ) : (
          renderEmptyState()
        )}
      </div>

      <nav className="email-page__tabbar" role="tablist" aria-label={tr('email.tabs.label', 'Email tabs')}>
        {PRIMARY_TABS.map((tab) => {
          const active = tab.id === activePrimaryTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
              className={`email-page__tabbar-item${active ? ' email-page__tabbar-item--active' : ''}`}
              onClick={() => setActivePrimaryTab(tab.id)}
            >
              <span className="email-page__tabbar-icon" aria-hidden="true">
                {tab.shortLabel}
              </span>
              <span>{tr(tab.labelKey, tab.fallbackLabel)}</span>
              <span className="email-page__tabbar-badge">{tabCountMap[tab.id]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default EmailPage;
