import React from 'react';
import { InlineFeedback } from '@sdkwork/react-mobile-commons';
import { useNotesWorkspace } from '../hooks/useNotesWorkspace';
import './NotesDocPage.css';

const FEEDBACK_VISIBLE_MS = 2800;

interface NotesDocPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  docId?: string;
  entrySource?: string;
  onEdit?: (docId: string) => void;
}

export const NotesDocPage: React.FC<NotesDocPageProps> = ({ t, onBack, docId, entrySource, onEdit }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const { snapshot } = useNotesWorkspace();
  const doc = React.useMemo(() => snapshot.docs.find((item) => item.id === docId) ?? null, [snapshot.docs, docId]);
  const feedbackText = React.useMemo(() => {
    if (entrySource === 'create') {
      return tr('notes.create_success', 'Note created successfully');
    }
    if (entrySource === 'edit') {
      return tr('notes.edit_ready', 'Editing mode');
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

  return (
    <div className="notes-doc-page">
      <header className="notes-doc-page__command-shell">
        <button
          type="button"
          className="notes-doc-page__nav-pill"
          onClick={onBack}
          aria-label={tr('notes.back', 'Back')}
        >
          <span aria-hidden="true">&lt;</span>
        </button>

        <div className="notes-doc-page__title-shell">
          <div className="notes-doc-page__title-shell-label">{tr('notes.doc_title', 'Document')}</div>
          <div className="notes-doc-page__title-shell-value">{doc?.title ?? tr('notes.doc_empty', 'Document not found')}</div>
        </div>

        <button
          type="button"
          className="notes-doc-page__action-pill"
          onClick={() => onEdit?.(doc?.id || docId || '')}
          aria-label={tr('notes.edit', 'Edit')}
        >
          <span aria-hidden="true">Edit</span>
        </button>
      </header>

      <div className="notes-doc-page__body">
        {visibleFeedback ? (
          <InlineFeedback
            message={visibleFeedback}
            dismissLabel={tr('notes.feedback_close', 'Dismiss feedback')}
            onDismiss={() => setVisibleFeedback('')}
            containerClassName="notes-doc-page__feedback is-visible"
            textClassName="notes-doc-page__feedback-text"
            dismissButtonClassName="notes-doc-page__feedback-close"
          />
        ) : null}

        {doc ? (
          <>
            <section className="notes-doc-page__hero-card">
              <div className="notes-doc-page__hero-kicker">{tr('notes.doc_kicker', 'Team document')}</div>
              <div className="notes-doc-page__hero-title-row">
                <h1 className="notes-doc-page__hero-title">{doc.title}</h1>
                <button
                  type="button"
                  className="notes-doc-page__hero-edit"
                  onClick={() => onEdit?.(doc?.id || docId || '')}
                >
                  {tr('notes.edit', 'Edit')}
                </button>
              </div>
              <div className="notes-doc-page__hero-meta">
                <span className="notes-doc-page__hero-chip">{doc.owner}</span>
                <span className="notes-doc-page__hero-chip">{doc.updatedAt}</span>
              </div>
            </section>

            <section className="notes-doc-page__reading-surface">
              <article className="notes-doc-page__reading-block">
                <div className="notes-doc-page__reading-label">{tr('notes.doc_summary_label', 'Summary')}</div>
                <p className="notes-doc-page__reading-copy">{doc.summary}</p>
              </article>

              <article className="notes-doc-page__reading-block">
                <div className="notes-doc-page__reading-label">{tr('notes.doc_content_label', 'Content')}</div>
                <p className="notes-doc-page__reading-copy">{doc.content}</p>
              </article>

              <article className="notes-doc-page__reading-block is-system">
                <div className="notes-doc-page__reading-label">{tr('notes.doc_title', 'Document')}</div>
                <p className="notes-doc-page__reading-copy">
                  {tr(
                    'notes.doc_body',
                    'This document route is now module-native and can be connected with real collaboration APIs.'
                  )}
                </p>
              </article>
            </section>
          </>
        ) : (
          <section className="notes-doc-page__empty">
            <div className="notes-doc-page__empty-title">{tr('notes.doc_empty', 'Document not found')}</div>
            <div className="notes-doc-page__empty-copy">
              {tr('notes.workspace_overview', 'Plan, document, and coordinate without leaving the workspace')}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default NotesDocPage;
