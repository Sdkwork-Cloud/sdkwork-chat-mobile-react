import { describe, expect, it } from 'vitest';
import { createNotesService } from '../services/NotesService';
import { createNotesWorkspaceController } from './notesWorkspaceController';

describe('notesWorkspaceController', () => {
  it('loads initial workspace snapshot from service', () => {
    const service = createNotesService();
    const controller = createNotesWorkspaceController(service);
    const snapshot = controller.getSnapshot();

    expect(snapshot.docs.length).toBeGreaterThan(0);
    expect(snapshot.tasks.length).toBeGreaterThan(0);
    expect(snapshot.wiki.length).toBeGreaterThan(0);
    expect(snapshot.activity.length).toBeGreaterThan(0);
  });

  it('syncs local snapshot after creating a draft', () => {
    const service = createNotesService();
    const controller = createNotesWorkspaceController(service);
    const before = controller.getSnapshot().docs.length;

    const draft = controller.createQuickDraft();
    const snapshot = controller.getSnapshot();

    expect(snapshot.docs.length).toBe(before + 1);
    expect(snapshot.docs[0].id).toBe(draft.id);
  });

  it('syncs local snapshot after creating a document from editor payload', () => {
    const service = createNotesService();
    const controller = createNotesWorkspaceController(service);
    const before = controller.getSnapshot().docs.length;

    const doc = controller.createDoc({
      title: 'Notes module release',
      content: 'Final QA run with tabbar routing and editor flows.',
    });
    const snapshot = controller.getSnapshot();

    expect(snapshot.docs.length).toBe(before + 1);
    expect(snapshot.docs[0].id).toBe(doc.id);
    expect(snapshot.docs[0].title).toBe('Notes module release');
  });

  it('refreshes snapshot when service changes externally', () => {
    const service = createNotesService();
    const controller = createNotesWorkspaceController(service);
    const before = controller.getSnapshot().docs.length;

    service.createQuickDraft();
    controller.refresh();
    const snapshot = controller.getSnapshot();

    expect(snapshot.docs.length).toBe(before + 1);
  });
});
