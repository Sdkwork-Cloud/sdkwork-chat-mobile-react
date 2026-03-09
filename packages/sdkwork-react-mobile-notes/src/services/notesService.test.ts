import { describe, expect, it } from 'vitest';
import { createNotesService } from './notesService';

describe('notesService', () => {
  it('returns seeded workspace snapshot', () => {
    const service = createNotesService();
    const snapshot = service.getSnapshot();

    expect(snapshot.docs.length).toBeGreaterThan(0);
    expect(snapshot.tasks.length).toBeGreaterThan(0);
    expect(snapshot.wiki.length).toBeGreaterThan(0);
    expect(snapshot.activity.length).toBeGreaterThan(0);
  });

  it('prepends a quick draft doc when creating a document', () => {
    const service = createNotesService();
    const before = service.getSnapshot().docs.length;
    const doc = service.createQuickDraft();
    const snapshot = service.getSnapshot();

    expect(doc.id.startsWith('doc-draft-')).toBe(true);
    expect(snapshot.docs.length).toBe(before + 1);
    expect(snapshot.docs[0].id).toBe(doc.id);
  });

  it('creates a collaborative document with input payload', () => {
    const service = createNotesService();
    const before = service.getSnapshot().docs.length;

    const doc = service.createDoc({
      title: 'Release checklist',
      content: 'Step 1: verify routes. Step 2: validate scan intent. Step 3: smoke test build.',
      templateDocId: 'doc-2',
    });
    const snapshot = service.getSnapshot();

    expect(doc.id.startsWith('doc-user-')).toBe(true);
    expect(doc.title).toBe('Release checklist');
    expect(doc.content).toContain('verify routes');
    expect(snapshot.docs.length).toBe(before + 1);
    expect(snapshot.docs[0].id).toBe(doc.id);
  });

  it('resets workspace to seeded state', () => {
    const service = createNotesService();
    service.createQuickDraft();
    service.reset();

    const snapshot = service.getSnapshot();
    expect(snapshot.docs[0].id).toBe('doc-1');
  });
});
