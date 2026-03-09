export type EmailPrimaryTab = 'inbox' | 'starred' | 'sent' | 'spaces';

export interface EmailThread {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  time: string;
  unread?: boolean;
  category?: string;
}

export interface EmailSpaceCard {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
}

export interface EmailCategorySummary {
  id: string;
  label: string;
  count: number;
  accent: string;
}

export interface EmailWorkspaceSnapshot {
  summaries: EmailCategorySummary[];
  inbox: EmailThread[];
  starred: EmailThread[];
  sent: EmailThread[];
  spaces: EmailSpaceCard[];
}

export interface EmailComposeInput {
  recipient?: string;
  subject?: string;
  body?: string;
  replyToThreadId?: string;
}

interface EmailWorkspaceState {
  sequence: number;
  inbox: EmailThread[];
  starred: EmailThread[];
  sent: EmailThread[];
  spaces: EmailSpaceCard[];
}

const seedWorkspaceState = (): EmailWorkspaceState => ({
  sequence: 0,
  inbox: [
    {
      id: 'mail-inbox-1',
      sender: 'OpenChat Team',
      subject: 'Weekly release digest',
      snippet: 'Discover, Drive, and order workflows were refreshed for mobile-first behavior.',
      time: '09:30',
      unread: true,
      category: 'Updates',
    },
    {
      id: 'mail-inbox-2',
      sender: 'Design Ops',
      subject: 'Review request: avatar spacing update',
      snippet: 'Please verify bubble spacing and avatar rhythm in the latest branch.',
      time: 'Yesterday',
      category: 'Review',
    },
    {
      id: 'mail-inbox-3',
      sender: 'Security Notice',
      subject: 'Credential policy reminder',
      snippet: 'Rotate integration secrets and check deployment config before release.',
      time: 'Mon',
      category: 'System',
    },
  ],
  starred: [
    {
      id: 'mail-starred-1',
      sender: 'Architecture Board',
      subject: 'QR protocol ratification',
      snippet: 'HTTP link protocol standard has been accepted for scanner intent routing.',
      time: '10:12',
      category: 'Priority',
    },
    {
      id: 'mail-starred-2',
      sender: 'Partner Team',
      subject: 'Integration checklist',
      snippet: 'Confirm route handoff and callback contract for external app deep-link flow.',
      time: 'Thu',
      category: 'External',
    },
  ],
  sent: [
    {
      id: 'mail-sent-1',
      sender: 'To Product Core',
      subject: 'Drive tabbar proposal',
      snippet: 'Shared the five-tab structure and transfer center UX rationale.',
      time: '08:42',
      category: 'Sent',
    },
    {
      id: 'mail-sent-2',
      sender: 'To Mobile QA',
      subject: 'Regression scope update',
      snippet: 'Sent targeted checks for Discover domain routes and module-level tabbars.',
      time: 'Tue',
      category: 'Sent',
    },
  ],
  spaces: [
    {
      id: 'space-1',
      title: 'Engineering',
      subtitle: 'Shared release notes, PRD snapshots, and deployment logs',
      accent: '#2f6fed',
    },
    {
      id: 'space-2',
      title: 'Design Review',
      subtitle: 'Asset briefs, prototype comments, and accessibility checklists',
      accent: '#d97706',
    },
    {
      id: 'space-3',
      title: 'Operations',
      subtitle: 'Playbooks for incidents, rollout plans, and runbook ownership',
      accent: '#0f766e',
    },
  ],
});

const cloneThreads = (threads: EmailThread[]): EmailThread[] => threads.map((thread) => ({ ...thread }));
const cloneSpaces = (spaces: EmailSpaceCard[]): EmailSpaceCard[] => spaces.map((space) => ({ ...space }));

const buildSummaries = (state: EmailWorkspaceState): EmailCategorySummary[] => [
  { id: 'primary', label: 'Primary', count: state.inbox.length, accent: '#2f6fed' },
  { id: 'updates', label: 'Updates', count: state.starred.length, accent: '#6366f1' },
  { id: 'forums', label: 'Forums', count: state.spaces.length, accent: '#0f766e' },
];

export interface EmailService {
  getSnapshot(): EmailWorkspaceSnapshot;
  composeSystemThread(): EmailThread;
  sendThread(input: EmailComposeInput): EmailThread;
  reset(): void;
}

export const createEmailService = (): EmailService => {
  let state = seedWorkspaceState();

  const getSnapshot = (): EmailWorkspaceSnapshot => ({
    summaries: buildSummaries(state),
    inbox: cloneThreads(state.inbox),
    starred: cloneThreads(state.starred),
    sent: cloneThreads(state.sent),
    spaces: cloneSpaces(state.spaces),
  });

  const composeSystemThread = (): EmailThread => {
    state = {
      ...state,
      sequence: state.sequence + 1,
    };

    const newThread: EmailThread = {
      id: `mail-sent-system-${state.sequence}`,
      sender: 'To Team',
      subject: 'New draft prepared',
      snippet: 'A new compose draft is ready for business follow-up.',
      time: 'Now',
      category: 'Sent',
    };

    state.sent = [newThread, ...state.sent];
    return { ...newThread };
  };

  const sendThread = (input: EmailComposeInput): EmailThread => {
    state = {
      ...state,
      sequence: state.sequence + 1,
    };

    const recipient = (input.recipient || '').trim() || 'Team';
    const subject = (input.subject || '').trim() || 'Untitled message';
    const body = (input.body || '').trim();
    const snippet = body || 'Message sent from the mobile compose flow.';

    const newThread: EmailThread = {
      id: `mail-sent-user-${state.sequence}`,
      sender: `To ${recipient}`,
      subject,
      snippet,
      time: 'Now',
      category: input.replyToThreadId ? 'Reply' : 'Sent',
    };

    state.sent = [newThread, ...state.sent];
    return { ...newThread };
  };

  const reset = () => {
    state = seedWorkspaceState();
  };

  return {
    getSnapshot,
    composeSystemThread,
    sendThread,
    reset,
  };
};

export const emailService = createEmailService();
