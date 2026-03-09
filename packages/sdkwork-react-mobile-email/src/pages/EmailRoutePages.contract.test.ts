import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('email module route pages contract', () => {
  it('keeps thread page wired to workspace snapshot and reply callback', () => {
    const source = fs.readFileSync(path.join(__dirname, 'EmailThreadPage.tsx'), 'utf8');

    expect(source).toContain('entrySource?: string;');
    expect(source).toContain("import { InlineFeedback } from '@sdkwork/react-mobile-commons';");
    expect(source).toContain('useEmailWorkspace');
    expect(source).toContain('resolveThread(');
    expect(source).toContain('const feedbackText = React.useMemo(');
    expect(source).toContain("entrySource === 'compose'");
    expect(source).toContain("entrySource === 'reply'");
    expect(source).toContain("tr('email.send_success', 'Email sent successfully')");
    expect(source).toContain("tr('email.reply_ready', 'Reply draft is ready')");
    expect(source).toContain('const FEEDBACK_VISIBLE_MS = 2800;');
    expect(source).toContain('const [visibleFeedback, setVisibleFeedback] = React.useState(');
    expect(source).toContain('window.setTimeout(() => setVisibleFeedback(');
    expect(source).toContain('window.clearTimeout(timer);');
    expect(source).toContain('<InlineFeedback');
    expect(source).toContain('message={visibleFeedback}');
    expect(source).toContain("containerClassName=\"email-thread-page__feedback is-visible\"");
    expect(source).toContain("textClassName=\"email-thread-page__feedback-text\"");
    expect(source).toContain("dismissButtonClassName=\"email-thread-page__feedback-close\"");
    expect(source).toContain("onDismiss={() => setVisibleFeedback('')}");
    expect(source).toContain("tr('email.feedback_close', 'Dismiss feedback')");
    expect(source).toContain('email-thread-page__command-shell');
    expect(source).toContain('email-thread-page__hero-card');
    expect(source).toContain('email-thread-page__content-surface');
    expect(source).toContain('email-thread-page__action-row');
    expect(source).toContain("tr('email.thread_kicker', 'Conversation')");
    expect(source).toContain("tr('email.thread_summary_label', 'Latest update')");
    expect(source).toContain('email-thread-page__feedback');
    expect(source).toContain('thread?.id || threadId ||');
    expect(source).toContain('email-thread-page__empty');
  });

  it('keeps compose page wired to send callback and reply hint', () => {
    const source = fs.readFileSync(path.join(__dirname, 'EmailComposePage.tsx'), 'utf8');

    expect(source).toContain("const COMPOSE_DRAFT_KEY_PREFIX = 'sdkwork.email.compose.';");
    expect(source).toContain('useEmailWorkspace');
    expect(source).toContain('const { snapshot, sendThread } = useEmailWorkspace();');
    expect(source).toContain('const replyThread = React.useMemo(');
    expect(source).toContain('window.localStorage.getItem');
    expect(source).toContain('window.localStorage.setItem');
    expect(source).toContain('window.localStorage.removeItem');
    expect(source).toContain('const replyDraft = {');
    expect(source).toContain("recipient: replyThread.sender.replace(/^To\\s+/i, ''),");
    expect(source).toContain('setRecipient(replyDraft.recipient);');
    expect(source).toContain('setSubject(replyDraft.subject);');
    expect(source).toContain('const [recipient, setRecipient] = React.useState');
    expect(source).toContain('const [subject, setSubject] = React.useState');
    expect(source).toContain('const [body, setBody] = React.useState');
    expect(source).toContain('draftFromThreadId ? (');
    expect(source).toContain('window.confirm(');
    expect(source).toContain('beforeunload');
    expect(source).toContain('onClick={handleBack}');
    expect(source).toContain('const thread = sendThread({');
    expect(source).toContain('onSend?.(thread.id);');
    expect(source).toContain('disabled={!recipient.trim()}');
    expect(source).toContain('email-compose-page__command-shell');
    expect(source).toContain('email-compose-page__draft-shell');
    expect(source).toContain('email-compose-page__editor-panel');
    expect(source).toContain('email-compose-page__editor-group');
    expect(source).toContain("tr('email.compose_kicker', 'Draft workspace')");
    expect(source).toContain("tr('email.compose_workspace_title', 'Shape the next reply')");
    expect(source).toContain(
      "tr('email.compose_workspace_subtitle', 'Keep recipients, context, and follow-up aligned before you send.')"
    );
  });
});
