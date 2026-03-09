import React from 'react';
import { useEmailWorkspace } from '../hooks/useEmailWorkspace';
import './EmailComposePage.css';

const COMPOSE_DRAFT_KEY_PREFIX = 'sdkwork.email.compose.';

interface ComposeDraftState {
  recipient: string;
  subject: string;
  body: string;
}

interface PersistedComposeDraft extends ComposeDraftState {
  updatedAt: number;
}

const EMPTY_DRAFT: ComposeDraftState = {
  recipient: '',
  subject: '',
  body: '',
};

const buildDraftStorageKey = (draftFromThreadId?: string) => {
  const scope = (draftFromThreadId || '').trim() || 'new';
  return `${COMPOSE_DRAFT_KEY_PREFIX}${scope}`;
};

const readComposeDraft = (storageKey: string): ComposeDraftState | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedComposeDraft>;
    return {
      recipient: typeof parsed.recipient === 'string' ? parsed.recipient : '',
      subject: typeof parsed.subject === 'string' ? parsed.subject : '',
      body: typeof parsed.body === 'string' ? parsed.body : '',
    };
  } catch {
    return null;
  }
};

const persistComposeDraft = (storageKey: string, draft: ComposeDraftState) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const payload: PersistedComposeDraft = {
      ...draft,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Ignore quota/storage exceptions to keep compose page interactive.
  }
};

const clearComposeDraft = (storageKey: string) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage exceptions.
  }
};

interface EmailComposePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  draftFromThreadId?: string;
  onSend?: (draftId: string) => void;
}

export const EmailComposePage: React.FC<EmailComposePageProps> = ({ t, onBack, draftFromThreadId, onSend }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const [recipient, setRecipient] = React.useState(EMPTY_DRAFT.recipient);
  const [subject, setSubject] = React.useState(EMPTY_DRAFT.subject);
  const [body, setBody] = React.useState(EMPTY_DRAFT.body);
  const [hasHydratedDraft, setHasHydratedDraft] = React.useState(false);
  const draftBaselineRef = React.useRef<ComposeDraftState>(EMPTY_DRAFT);
  const draftStorageKey = React.useMemo(() => buildDraftStorageKey(draftFromThreadId), [draftFromThreadId]);
  const { snapshot, sendThread } = useEmailWorkspace();
  const replyThread = React.useMemo(
    () => [...snapshot.inbox, ...snapshot.starred, ...snapshot.sent].find((item) => item.id === draftFromThreadId) ?? null,
    [snapshot.inbox, snapshot.starred, snapshot.sent, draftFromThreadId]
  );

  React.useEffect(() => {
    setHasHydratedDraft(false);
    draftBaselineRef.current = EMPTY_DRAFT;
  }, [draftStorageKey]);

  React.useEffect(() => {
    if (hasHydratedDraft) return;

    const persistedDraft = readComposeDraft(draftStorageKey);
    if (persistedDraft) {
      setRecipient(persistedDraft.recipient);
      setSubject(persistedDraft.subject);
      setBody(persistedDraft.body);
      draftBaselineRef.current = persistedDraft;
      setHasHydratedDraft(true);
      return;
    }

    if (replyThread) {
      const replyDraft = {
        recipient: replyThread.sender.replace(/^To\s+/i, ''),
        subject: `Re: ${replyThread.subject}`,
        body: `\n\n---\n${replyThread.snippet}`,
      };
      setRecipient(replyDraft.recipient);
      setSubject(replyDraft.subject);
      setBody(replyDraft.body);
      draftBaselineRef.current = replyDraft;
      setHasHydratedDraft(true);
      return;
    }

    draftBaselineRef.current = EMPTY_DRAFT;
    setHasHydratedDraft(true);
  }, [hasHydratedDraft, draftStorageKey, replyThread]);

  React.useEffect(() => {
    if (!hasHydratedDraft) return;
    const currentDraft = { recipient, subject, body };
    if (!recipient.trim() && !subject.trim() && !body.trim()) {
      clearComposeDraft(draftStorageKey);
      return;
    }
    persistComposeDraft(draftStorageKey, currentDraft);
  }, [hasHydratedDraft, draftStorageKey, recipient, subject, body]);

  const isDirty = React.useMemo(() => {
    if (!hasHydratedDraft) return false;
    const baseline = draftBaselineRef.current;
    return recipient !== baseline.recipient || subject !== baseline.subject || body !== baseline.body;
  }, [hasHydratedDraft, recipient, subject, body]);

  const handleBack = React.useCallback(() => {
    if (isDirty && typeof window !== 'undefined') {
      const confirmed = window.confirm(tr('email.discard_confirm', 'Discard unsaved email draft and leave?'));
      if (!confirmed) return;
    }
    onBack?.();
  }, [isDirty, onBack, tr]);

  React.useEffect(() => {
    if (!isDirty || typeof window === 'undefined') return undefined;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const handleSend = React.useCallback(() => {
    if (!recipient.trim()) return;
    const thread = sendThread({
      recipient,
      subject,
      body,
      replyToThreadId: draftFromThreadId,
    });
    clearComposeDraft(draftStorageKey);
    onSend?.(thread.id);
  }, [sendThread, recipient, subject, body, draftFromThreadId, draftStorageKey, onSend]);

  return (
    <div className="email-compose-page">
      <header className="email-compose-page__command-shell">
        <button
          type="button"
          className="email-compose-page__nav-pill"
          onClick={handleBack}
          aria-label={tr('email.back', 'Back')}
        >
          <span aria-hidden="true">&lt;</span>
        </button>
        <div className="email-compose-page__title-cluster">
          <div className="email-compose-page__kicker">{tr('email.compose_kicker', 'Draft workspace')}</div>
          <div className="email-compose-page__header-title">{tr('email.compose_title', 'Compose')}</div>
        </div>
        <button
          type="button"
          className="email-compose-page__send-pill"
          onClick={handleSend}
          disabled={!recipient.trim()}
          aria-label={tr('email.send', 'Send')}
        >
          <span>{tr('email.send', 'Send')}</span>
        </button>
      </header>

      <div className="email-compose-page__body">
        <section className="email-compose-page__draft-shell">
          <div className="email-compose-page__draft-kicker">{tr('email.compose_kicker', 'Draft workspace')}</div>
          <h1 className="email-compose-page__draft-title">
            {tr('email.compose_workspace_title', 'Shape the next reply')}
          </h1>
          <p className="email-compose-page__draft-subtitle">
            {tr('email.compose_workspace_subtitle', 'Keep recipients, context, and follow-up aligned before you send.')}
          </p>

          {draftFromThreadId ? (
            <div className="email-compose-page__reply-context">
              <div className="email-compose-page__reply-label">{tr('email.reply_hint', 'Replying to thread')}</div>
              <div className="email-compose-page__reply-value">
                {replyThread ? `${replyThread.sender} - ${replyThread.subject}` : draftFromThreadId}
              </div>
            </div>
          ) : null}
        </section>

        <section className="email-compose-page__editor-panel">
          <label className="email-compose-page__editor-group">
            <span className="email-compose-page__field-label">{tr('email.recipient', 'To')}</span>
            <input
              className="email-compose-page__input"
              type="text"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder={tr('email.recipient_placeholder', 'Recipient')}
            />
          </label>
          <label className="email-compose-page__editor-group">
            <span className="email-compose-page__field-label">{tr('email.subject', 'Subject')}</span>
            <input
              className="email-compose-page__input"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={tr('email.subject_placeholder', 'Write a subject')}
            />
          </label>
          <label className="email-compose-page__editor-group is-body">
            <span className="email-compose-page__field-label">{tr('email.body', 'Body')}</span>
            <textarea
              className="email-compose-page__textarea"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={tr('email.body_placeholder', 'Write your message')}
            />
          </label>
        </section>
      </div>
    </div>
  );
};

export default EmailComposePage;
