import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('email and notes route contract', () => {
  it('keeps discover modules mounted and wired to dedicated module routes', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain("import('@sdkwork/react-mobile-email')");
    expect(source).toContain("import('@sdkwork/react-mobile-notes')");
    expect(source).toContain('[ROUTE_PATHS.email]: { component: EmailPage },');
    expect(source).toContain('[ROUTE_PATHS.emailThread]: { component: EmailThreadPage },');
    expect(source).toContain('[ROUTE_PATHS.emailCompose]: { component: EmailComposePage },');
    expect(source).toContain('[ROUTE_PATHS.notes]: { component: NotesPage },');
    expect(source).toContain('[ROUTE_PATHS.notesDoc]: { component: NotesDocPage },');
    expect(source).toContain('[ROUTE_PATHS.notesCreate]: { component: NotesCreatePage },');

    expect(source).toContain('if (path === ROUTE_PATHS.email) {');
    expect(source).toContain('onCompose: () =>');
    expect(source).toContain('onThreadClick: (threadId: string) =>');
    expect(source).toContain('navigate(ROUTE_PATHS.emailCompose');
    expect(source).toContain('navigate(ROUTE_PATHS.emailThread, { id: threadId })');
    expect(source).toContain("source: draftFromThreadId ? 'reply' : 'compose'");
    expect(source).toContain('if (path === ROUTE_PATHS.emailThread) {');
    expect(source).toContain("const entrySource = (currentParams.source || '').trim();");
    expect(source).toContain('entrySource: entrySource || undefined');

    expect(source).toContain('if (path === ROUTE_PATHS.notes) {');
    expect(source).toContain('onCreate: () =>');
    expect(source).toContain('onOpenDoc: (docId: string) =>');
    expect(source).toContain('navigate(ROUTE_PATHS.notesCreate');
    expect(source).toContain('navigate(ROUTE_PATHS.notesDoc, { id: docId })');
    expect(source).toContain("source: templateDocId ? 'edit' : 'create'");
    expect(source).toContain('if (path === ROUTE_PATHS.notesDoc) {');
    expect(source).toContain('entrySource: entrySource || undefined');
  });
});
