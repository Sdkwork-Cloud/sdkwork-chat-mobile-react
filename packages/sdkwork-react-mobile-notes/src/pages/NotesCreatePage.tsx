import React from 'react';
import { clearDraft, persistDraft, readDraft, type NotesDraftState } from '../services/NotesService';
import { useNotesWorkspace } from '../hooks/useNotesWorkspace';
import './NotesCreatePage.css';

const CREATE_DRAFT_KEY_PREFIX = 'sdkwork.notes.create.';

const EMPTY_DRAFT: NotesDraftState = {
  title: '',
  content: '',
};

const buildDraftStorageKey = (templateDocId?: string) => {
  const scope = (templateDocId || '').trim() || 'new';
  return `${CREATE_DRAFT_KEY_PREFIX}${scope}`;
};

interface NotesCreatePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  templateDocId?: string;
  onCreated?: (docId: string) => void;
}

export const NotesCreatePage: React.FC<NotesCreatePageProps> = ({ t, onBack, templateDocId, onCreated }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const [title, setTitle] = React.useState(EMPTY_DRAFT.title);
  const [content, setContent] = React.useState(EMPTY_DRAFT.content);
  const [hasHydratedDraft, setHasHydratedDraft] = React.useState(false);
  const draftBaselineRef = React.useRef<NotesDraftState>(EMPTY_DRAFT);
  const draftStorageKey = React.useMemo(() => buildDraftStorageKey(templateDocId), [templateDocId]);
  const { snapshot, createDoc } = useNotesWorkspace();
  const templateDoc = React.useMemo(
    () => snapshot.docs.find((item) => item.id === templateDocId) ?? null,
    [snapshot.docs, templateDocId]
  );

  React.useEffect(() => {
    setHasHydratedDraft(false);
    draftBaselineRef.current = EMPTY_DRAFT;
  }, [draftStorageKey]);

  React.useEffect(() => {
    if (hasHydratedDraft) return;

    const persistedDraft = readDraft(draftStorageKey);
    if (persistedDraft) {
      setTitle(persistedDraft.title);
      setContent(persistedDraft.content);
      draftBaselineRef.current = persistedDraft;
      setHasHydratedDraft(true);
      return;
    }

    if (templateDoc) {
      const templateDraft = {
        title: templateDoc.title,
        content: templateDoc.content,
      };
      setTitle(templateDraft.title);
      setContent(templateDraft.content);
      draftBaselineRef.current = templateDraft;
      setHasHydratedDraft(true);
      return;
    }

    draftBaselineRef.current = EMPTY_DRAFT;
    setHasHydratedDraft(true);
  }, [hasHydratedDraft, draftStorageKey, templateDoc]);

  React.useEffect(() => {
    if (!hasHydratedDraft) return;
    const currentDraft = { title, content };
    if (!title.trim() && !content.trim()) {
      clearDraft(draftStorageKey);
      return;
    }
    persistDraft(draftStorageKey, currentDraft);
  }, [hasHydratedDraft, draftStorageKey, title, content]);

  const isDirty = React.useMemo(() => {
    if (!hasHydratedDraft) return false;
    const baseline = draftBaselineRef.current;
    return title !== baseline.title || content !== baseline.content;
  }, [hasHydratedDraft, title, content]);

  const handleBack = React.useCallback(() => {
    if (isDirty && typeof window !== 'undefined') {
      const confirmed = window.confirm(tr('notes.discard_confirm', 'Discard unsaved note and leave?'));
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

  const handleCreate = React.useCallback(() => {
    if (!title.trim() && !content.trim()) return;
    const doc = createDoc({
      title,
      content,
      templateDocId,
    });
    clearDraft(draftStorageKey);
    onCreated?.(doc.id);
  }, [createDoc, title, content, templateDocId, draftStorageKey, onCreated]);

  return (
    <div className="notes-create-page">
      <header className="notes-create-page__command-shell">
        <button
          type="button"
          className="notes-create-page__nav-pill"
          onClick={handleBack}
          aria-label={tr('notes.back', 'Back')}
        >
          <span aria-hidden="true">&lt;</span>
        </button>

        <div className="notes-create-page__title-shell">
          <div className="notes-create-page__title-shell-label">{tr('notes.create_title', 'Create note')}</div>
          <div className="notes-create-page__title-shell-value">
            {title.trim() || tr('notes.create_workspace_title', 'Shape the next note')}
          </div>
        </div>

        <button
          type="button"
          className="notes-create-page__save-pill"
          onClick={handleCreate}
          disabled={!title.trim() && !content.trim()}
          aria-label={tr('notes.create_save', 'Save')}
        >
          <span aria-hidden="true">Save</span>
        </button>
      </header>

      <div className="notes-create-page__body">
        <section className="notes-create-page__draft-shell">
          <div className="notes-create-page__draft-kicker">{tr('notes.create_kicker', 'Draft workspace')}</div>
          <div className="notes-create-page__draft-title-row">
            <h1 className="notes-create-page__draft-title">
              {tr('notes.create_workspace_title', 'Shape the next note')}
            </h1>
            <span className="notes-create-page__draft-badge">{isDirty ? 'Edited' : 'Clean'}</span>
          </div>
          <p className="notes-create-page__draft-subtitle">
            {tr('notes.create_workspace_subtitle', 'Capture the brief first, then turn it into a durable team doc.')}
          </p>
        </section>

        {templateDocId ? (
          <div className="notes-create-page__template-hint">
            {tr('notes.create_template_label', 'Working from template')}: {templateDocId}
          </div>
        ) : null}

        {templateDocId ? (
          <div className="notes-create-page__hint">
            {tr('notes.editing_hint', 'Editing from document')}: {templateDocId}
          </div>
        ) : null}

        <section className="notes-create-page__editor-panel">
          <label className="notes-create-page__field">
            <span>{tr('notes.subject', 'Title')}</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={tr('notes.create_title_placeholder', 'Write a title')}
            />
          </label>

          <label className="notes-create-page__field is-textarea">
            <span>{tr('notes.body', 'Content')}</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={tr('notes.create_content_placeholder', 'Write your note content')}
            />
          </label>
        </section>
      </div>
    </div>
  );
};

export default NotesCreatePage;
