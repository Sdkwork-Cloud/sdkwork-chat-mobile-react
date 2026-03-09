import React from 'react';
import { notesService, type CreateNotesDocInput, type NotesWorkspaceSnapshot } from '../services/notesService';
import { createNotesWorkspaceController } from './notesWorkspaceController';

const EMPTY_WORKSPACE: NotesWorkspaceSnapshot = {
  docs: [],
  tasks: [],
  wiki: [],
  activity: [],
};

export const useNotesWorkspace = () => {
  const controllerRef = React.useRef<ReturnType<typeof createNotesWorkspaceController> | null>(null);
  const controller = controllerRef.current ?? createNotesWorkspaceController(notesService);
  if (!controllerRef.current) controllerRef.current = controller;
  const [snapshot, setSnapshot] = React.useState<NotesWorkspaceSnapshot>(
    controller.getSnapshot() || EMPTY_WORKSPACE
  );

  const refresh = React.useCallback(() => {
    setSnapshot(controller.refresh());
  }, [controller]);

  const createQuickDraft = React.useCallback(() => {
    const draft = controller.createQuickDraft();
    setSnapshot(controller.getSnapshot());
    return draft;
  }, [controller]);

  const createDoc = React.useCallback((input: CreateNotesDocInput) => {
    const doc = controller.createDoc(input);
    setSnapshot(controller.getSnapshot());
    return doc;
  }, [controller]);

  return {
    snapshot,
    refresh,
    createQuickDraft,
    createDoc,
  };
};
