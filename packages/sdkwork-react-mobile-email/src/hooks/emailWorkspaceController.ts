import type { EmailComposeInput, EmailService, EmailThread, EmailWorkspaceSnapshot } from '../services/EmailService';

export interface EmailWorkspaceController {
  getSnapshot(): EmailWorkspaceSnapshot;
  refresh(): EmailWorkspaceSnapshot;
  composeSystemThread(): EmailThread;
  sendThread(input: EmailComposeInput): EmailThread;
}

export const createEmailWorkspaceController = (service: EmailService): EmailWorkspaceController => {
  let snapshot = service.getSnapshot();

  const refresh = () => {
    snapshot = service.getSnapshot();
    return snapshot;
  };

  const composeSystemThread = () => {
    const thread = service.composeSystemThread();
    refresh();
    return thread;
  };

  const sendThread = (input: EmailComposeInput) => {
    const thread = service.sendThread(input);
    refresh();
    return thread;
  };

  return {
    getSnapshot: () => snapshot,
    refresh,
    composeSystemThread,
    sendThread,
  };
};
