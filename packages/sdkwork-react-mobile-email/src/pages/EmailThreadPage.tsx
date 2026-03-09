import React from 'react';
import { InlineFeedback } from '@sdkwork/react-mobile-commons';
import { useEmailWorkspace } from '../hooks/useEmailWorkspace';
import type { EmailThread } from '../services/emailService';
import './EmailThreadPage.css';

const FEEDBACK_VISIBLE_MS = 2800;

interface EmailThreadPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  threadId?: string;
  entrySource?: string;
  onReply?: (threadId: string) => void;
}

const resolveThread = (threadId: string | undefined, threads: EmailThread[]): EmailThread | null => {
  if (!threadId) return null;
  return threads.find((item) => item.id === threadId) ?? null;
};

export const EmailThreadPage: React.FC<EmailThreadPageProps> = ({ t, onBack, threadId, entrySource, onReply }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const { snapshot } = useEmailWorkspace();
  const thread = React.useMemo(
    () => resolveThread(threadId, [...snapshot.inbox, ...snapshot.starred, ...snapshot.sent]),
    [threadId, snapshot.inbox, snapshot.starred, snapshot.sent]
  );
  const feedbackText = React.useMemo(() => {
    if (entrySource === 'compose') {
      return tr('email.send_success', 'Email sent successfully');
    }
    if (entrySource === 'reply') {
      return tr('email.reply_ready', 'Reply draft is ready');
    }
    return '';
  }, [entrySource, tr]);
  const [visibleFeedback, setVisibleFeedback] = React.useState('');

  React.useEffect(() => {
    setVisibleFeedback(feedbackText);
    if (!feedbackText) return undefined;
    const timer = window.setTimeout(() => setVisibleFeedback(''), FEEDBACK_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [feedbackText]);

  const handleReply = React.useCallback(() => {
    onReply?.(thread?.id || threadId || '');
  }, [onReply, thread?.id, threadId]);

  return (
    <div className="email-thread-page">
      <header className="email-thread-page__command-shell">
        <button
          type="button"
          className="email-thread-page__nav-pill"
          onClick={onBack}
          aria-label={tr('email.back', 'Back')}
        >
          <span aria-hidden="true">&lt;</span>
        </button>
        <div className="email-thread-page__title-cluster">
          <div className="email-thread-page__kicker">{tr('email.thread_kicker', 'Conversation')}</div>
          <div className="email-thread-page__header-title">{tr('email.thread_title', 'Thread')}</div>
        </div>
        <button
          type="button"
          className="email-thread-page__reply-pill"
          onClick={handleReply}
          aria-label={tr('email.reply', 'Reply')}
        >
          <span>{tr('email.reply', 'Reply')}</span>
        </button>
      </header>

      <div className="email-thread-page__body">
        {visibleFeedback ? (
          <InlineFeedback
            message={visibleFeedback}
            dismissLabel={tr('email.feedback_close', 'Dismiss feedback')}
            onDismiss={() => setVisibleFeedback('')}
            containerClassName="email-thread-page__feedback is-visible"
            textClassName="email-thread-page__feedback-text"
            dismissButtonClassName="email-thread-page__feedback-close"
          />
        ) : null}
        {thread ? (
          <>
            <section className="email-thread-page__hero-card">
              <div className="email-thread-page__hero-topline">
                <span className="email-thread-page__hero-sender">{thread.sender}</span>
                <span className="email-thread-page__hero-time">{thread.time}</span>
              </div>
              <h1 className="email-thread-page__subject">{thread.subject}</h1>
              <p className="email-thread-page__hero-summary">{thread.snippet}</p>
              <div className="email-thread-page__meta-row">
                {thread.category ? (
                  <span className="email-thread-page__meta-pill">{thread.category}</span>
                ) : null}
                {feedbackText ? (
                  <span className="email-thread-page__meta-pill is-soft">{feedbackText}</span>
                ) : null}
              </div>
            </section>

            <section className="email-thread-page__content-surface">
              <div className="email-thread-page__section-label">
                {tr('email.thread_summary_label', 'Latest update')}
              </div>
              <p className="email-thread-page__content">{thread.snippet}</p>
              <p className="email-thread-page__content">
                {tr(
                  'email.thread_body',
                  'This thread is rendered by the module route and is ready for real API detail integration.'
                )}
              </p>
              <div className="email-thread-page__action-row">
                <button
                  type="button"
                  className="email-thread-page__action-btn is-primary"
                  onClick={handleReply}
                >
                  {tr('email.reply', 'Reply')}
                </button>
                <button type="button" className="email-thread-page__action-btn" onClick={onBack}>
                  {tr('email.back', 'Back')}
                </button>
              </div>
            </section>
          </>
        ) : (
          <section className="email-thread-page__empty">
            <div className="email-thread-page__empty-title">{tr('email.empty_thread', 'Thread not found')}</div>
            <div className="email-thread-page__empty-description">
              {tr(
                'email.thread_body',
                'This thread is rendered by the module route and is ready for real API detail integration.'
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EmailThreadPage;
