import React from 'react';
import { emailService, type EmailComposeInput, type EmailWorkspaceSnapshot } from '../services/emailService';
import { createEmailWorkspaceController } from './emailWorkspaceController';

const EMPTY_WORKSPACE: EmailWorkspaceSnapshot = {
  summaries: [],
  inbox: [],
  starred: [],
  sent: [],
  spaces: [],
};

export const useEmailWorkspace = () => {
  const controllerRef = React.useRef<ReturnType<typeof createEmailWorkspaceController> | null>(null);
  const controller = controllerRef.current ?? createEmailWorkspaceController(emailService);
  if (!controllerRef.current) controllerRef.current = controller;
  const [snapshot, setSnapshot] = React.useState<EmailWorkspaceSnapshot>(
    controller.getSnapshot() || EMPTY_WORKSPACE
  );

  const refresh = React.useCallback(() => {
    setSnapshot(controller.refresh());
  }, [controller]);

  const composeSystemThread = React.useCallback(() => {
    const nextThread = controller.composeSystemThread();
    setSnapshot(controller.getSnapshot());
    return nextThread;
  }, [controller]);

  const sendThread = React.useCallback((input: EmailComposeInput) => {
    const nextThread = controller.sendThread(input);
    setSnapshot(controller.getSnapshot());
    return nextThread;
  }, [controller]);

  return {
    snapshot,
    refresh,
    composeSystemThread,
    sendThread,
  };
};
