import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('notes module route pages contract', () => {
  it('keeps document page wired to workspace snapshot and edit callback', () => {
    const source = fs.readFileSync(path.join(__dirname, 'NotesDocPage.tsx'), 'utf8');

    expect(source).toContain('entrySource?: string;');
    expect(source).toContain("import { InlineFeedback } from '@sdkwork/react-mobile-commons';");
    expect(source).toContain('useNotesWorkspace');
    expect(source).toContain('snapshot.docs.find');
    expect(source).toContain('const feedbackText = React.useMemo(');
    expect(source).toContain("entrySource === 'create'");
    expect(source).toContain("entrySource === 'edit'");
    expect(source).toContain("tr('notes.create_success', 'Note created successfully')");
    expect(source).toContain("tr('notes.edit_ready', 'Editing mode')");
    expect(source).toContain('const FEEDBACK_VISIBLE_MS = 2800;');
    expect(source).toContain('const [visibleFeedback, setVisibleFeedback] = React.useState(');
    expect(source).toContain('window.setTimeout(() => setVisibleFeedback(');
    expect(source).toContain('window.clearTimeout(timer);');
    expect(source).toContain('<InlineFeedback');
    expect(source).toContain('message={visibleFeedback}');
    expect(source).toContain("containerClassName=\"notes-doc-page__feedback is-visible\"");
    expect(source).toContain("textClassName=\"notes-doc-page__feedback-text\"");
    expect(source).toContain("dismissButtonClassName=\"notes-doc-page__feedback-close\"");
    expect(source).toContain("onDismiss={() => setVisibleFeedback('')}");
    expect(source).toContain("tr('notes.feedback_close', 'Dismiss feedback')");
    expect(source).toContain('notes-doc-page__command-shell');
    expect(source).toContain('notes-doc-page__hero-card');
    expect(source).toContain('notes-doc-page__reading-surface');
    expect(source).toContain("tr('notes.doc_kicker', 'Team document')");
    expect(source).toContain("tr('notes.doc_summary_label', 'Summary')");
    expect(source).toContain("tr('notes.doc_content_label', 'Content')");
    expect(source).toContain('notes-doc-page__feedback');
    expect(source).toContain('onEdit?.(doc?.id || docId ||');
    expect(source).toContain('notes-doc-page__empty');
  });

  it('keeps create page wired to creation callback and template hint', () => {
    const source = fs.readFileSync(path.join(__dirname, 'NotesCreatePage.tsx'), 'utf8');

    expect(source).toContain("const CREATE_DRAFT_KEY_PREFIX = 'sdkwork.notes.create.';");
    expect(source).toContain('useNotesWorkspace');
    expect(source).toContain('const { snapshot, createDoc } = useNotesWorkspace();');
    expect(source).toContain('const templateDoc = React.useMemo(');
    expect(source).toContain('window.localStorage.getItem');
    expect(source).toContain('window.localStorage.setItem');
    expect(source).toContain('window.localStorage.removeItem');
    expect(source).toContain('if (templateDoc) {');
    expect(source).toContain('const templateDraft = {');
    expect(source).toContain('title: templateDoc.title,');
    expect(source).toContain('setTitle(templateDraft.title);');
    expect(source).toContain('setContent(templateDraft.content);');
    expect(source).toContain('const [title, setTitle] = React.useState');
    expect(source).toContain('const [content, setContent] = React.useState');
    expect(source).toContain('templateDocId ? (');
    expect(source).toContain('window.confirm(');
    expect(source).toContain('beforeunload');
    expect(source).toContain('onClick={handleBack}');
    expect(source).toContain('const doc = createDoc({');
    expect(source).toContain('onCreated?.(doc.id);');
    expect(source).toContain('disabled={!title.trim() && !content.trim()}');
    expect(source).toContain('notes-create-page__command-shell');
    expect(source).toContain('notes-create-page__draft-shell');
    expect(source).toContain('notes-create-page__editor-panel');
    expect(source).toContain("tr('notes.create_kicker', 'Draft workspace')");
    expect(source).toContain("tr('notes.create_workspace_title', 'Shape the next note')");
    expect(source).toContain("tr('notes.create_workspace_subtitle', 'Capture the brief first, then turn it into a durable team doc.')");
    expect(source).toContain("tr('notes.create_template_label', 'Working from template')");
  });
});
