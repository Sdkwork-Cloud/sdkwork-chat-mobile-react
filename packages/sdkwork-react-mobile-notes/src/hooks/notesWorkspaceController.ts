import type { CreateNotesDocInput, NotesDoc, NotesService, NotesWorkspaceSnapshot } from '../services/NotesService';

export interface NotesWorkspaceController {
  getSnapshot(): NotesWorkspaceSnapshot;
  refresh(): NotesWorkspaceSnapshot;
  createQuickDraft(): NotesDoc;
  createDoc(input: CreateNotesDocInput): NotesDoc;
}

export const createNotesWorkspaceController = (service: NotesService): NotesWorkspaceController => {
  let snapshot = service.getSnapshot();

  const refresh = () => {
    snapshot = service.getSnapshot();
    return snapshot;
  };

  const createQuickDraft = () => {
    const draft = service.createQuickDraft();
    refresh();
    return draft;
  };

  const createDoc = (input: CreateNotesDocInput) => {
    const doc = service.createDoc(input);
    refresh();
    return doc;
  };

  return {
    getSnapshot: () => snapshot,
    refresh,
    createQuickDraft,
    createDoc,
  };
};
