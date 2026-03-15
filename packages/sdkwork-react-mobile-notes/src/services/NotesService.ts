import { getPersistStorage } from '@sdkwork/react-mobile-core';

export type NotesPrimaryTab = 'docs' | 'tasks' | 'wiki' | 'activity';

export interface NotesDoc {
  id: string;
  title: string;
  summary: string;
  content: string;
  owner: string;
  updatedAt: string;
}

export interface CreateNotesDocInput {
  title?: string;
  content?: string;
  templateDocId?: string;
}

export interface NotesTask {
  id: string;
  title: string;
  status: 'In Progress' | 'Todo' | 'Done';
  owner: string;
  due: string;
}

export interface NotesWikiEntry {
  id: string;
  title: string;
  detail: string;
}

export interface NotesActivity {
  id: string;
  actor: string;
  action: string;
  time: string;
}

export interface NotesWorkspaceSnapshot {
  docs: NotesDoc[];
  tasks: NotesTask[];
  wiki: NotesWikiEntry[];
  activity: NotesActivity[];
}

export interface NotesDraftState {
  title: string;
  content: string;
}

interface NotesWorkspaceState extends NotesWorkspaceSnapshot {
  sequence: number;
}

const seedWorkspaceState = (): NotesWorkspaceState => ({
  sequence: 0,
  docs: [
    {
      id: 'doc-1',
      title: 'Product launch playbook',
      summary: 'Roadmap, QA checklist, and release owners in a single page.',
      content: 'Roadmap, QA checklist, release owners, and incident drill checklist in one place.',
      owner: 'Product Team',
      updatedAt: 'Updated 2h ago',
    },
    {
      id: 'doc-2',
      title: 'SDK integration guide',
      summary: 'Contract details for scanner protocol, route intent, and callback handling.',
      content: 'Scanner HTTP protocol, route intent parser, fallback rules, and callback contracts.',
      owner: 'Engineering',
      updatedAt: 'Updated yesterday',
    },
    {
      id: 'doc-3',
      title: 'Design system mobile baseline',
      summary: 'Tabbar spacing, card rhythm, and typography constraints.',
      content: 'Tabbar spacing rhythm, card density scale, typography tokens, and touch target rules.',
      owner: 'Design Ops',
      updatedAt: 'Updated Mon',
    },
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Review drive transfer queue edge cases',
      status: 'In Progress',
      owner: 'Kai',
      due: 'Today',
    },
    {
      id: 'task-2',
      title: 'Finalize discover module icon mappings',
      status: 'Todo',
      owner: 'Lin',
      due: 'Tomorrow',
    },
    {
      id: 'task-3',
      title: 'Verify QR HTTP protocol parser',
      status: 'Done',
      owner: 'Qin',
      due: 'Yesterday',
    },
  ],
  wiki: [
    {
      id: 'wiki-1',
      title: 'Architecture',
      detail: 'Routing policy, module boundaries, and shared contracts',
    },
    {
      id: 'wiki-2',
      title: 'Operations',
      detail: 'Release cadence, incident playbooks, and ownership matrix',
    },
    {
      id: 'wiki-3',
      title: 'Growth',
      detail: 'Campaign templates, onboarding scripts, and retention loops',
    },
  ],
  activity: [
    { id: 'act-1', actor: 'Mina', action: 'commented on "Product launch playbook"', time: '5m ago' },
    { id: 'act-2', actor: 'Devon', action: 'completed task "Verify QR HTTP protocol parser"', time: '27m ago' },
    { id: 'act-3', actor: 'Jude', action: 'edited "Design system mobile baseline"', time: '1h ago' },
  ],
});

const cloneDocs = (docs: NotesDoc[]): NotesDoc[] => docs.map((item) => ({ ...item }));
const cloneTasks = (tasks: NotesTask[]): NotesTask[] => tasks.map((item) => ({ ...item }));
const cloneWikiEntries = (wiki: NotesWikiEntry[]): NotesWikiEntry[] => wiki.map((item) => ({ ...item }));
const cloneActivities = (activity: NotesActivity[]): NotesActivity[] => activity.map((item) => ({ ...item }));

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeDraft(draft: NotesDraftState): NotesDraftState {
  return {
    title: draft.title,
    content: draft.content,
  };
}

export function readDraft(storageKey: string): NotesDraftState | null {
  const key = storageKey.trim();
  if (!key) {
    return null;
  }

  const parsed = safeJsonParse<Partial<NotesDraftState>>(getPersistStorage().getItem(key));
  if (!parsed) {
    return null;
  }

  return normalizeDraft({
    title: typeof parsed.title === 'string' ? parsed.title : '',
    content: typeof parsed.content === 'string' ? parsed.content : '',
  });
}

export function persistDraft(storageKey: string, draft: NotesDraftState): void {
  const key = storageKey.trim();
  if (!key) {
    return;
  }
  getPersistStorage().setItem(key, JSON.stringify(normalizeDraft(draft)));
}

export function clearDraft(storageKey: string): void {
  const key = storageKey.trim();
  if (!key) {
    return;
  }
  getPersistStorage().removeItem(key);
}

export interface NotesService {
  getSnapshot(): NotesWorkspaceSnapshot;
  createQuickDraft(): NotesDoc;
  createDoc(input: CreateNotesDocInput): NotesDoc;
  reset(): void;
}

export const createNotesService = (): NotesService => {
  let state = seedWorkspaceState();

  const getSnapshot = (): NotesWorkspaceSnapshot => ({
    docs: cloneDocs(state.docs),
    tasks: cloneTasks(state.tasks),
    wiki: cloneWikiEntries(state.wiki),
    activity: cloneActivities(state.activity),
  });

  const resolveSummary = (content: string): string => {
    const normalized = content.trim();
    if (!normalized) {
      return 'Created from the mobile notes editor.';
    }
    if (normalized.length <= 96) {
      return normalized;
    }
    return `${normalized.slice(0, 93)}...`;
  };

  const createDoc = (input: CreateNotesDocInput): NotesDoc => {
    state = {
      ...state,
      sequence: state.sequence + 1,
    };

    const title = (input.title || '').trim() || 'Untitled note';
    const content = (input.content || '').trim() || 'Start writing your collaborative note.';

    const doc: NotesDoc = {
      id: `doc-user-${state.sequence}`,
      title,
      summary: resolveSummary(content),
      content,
      owner: 'You',
      updatedAt: 'Updated now',
    };

    state.docs = [doc, ...state.docs];
    state.activity = [
      {
        id: `act-user-doc-${state.sequence}`,
        actor: 'You',
        action: `created "${doc.title}"${input.templateDocId ? ` from ${input.templateDocId}` : ''}`,
        time: 'just now',
      },
      ...state.activity,
    ];

    return { ...doc };
  };

  const createQuickDraft = (): NotesDoc => {
    state = {
      ...state,
      sequence: state.sequence + 1,
    };

    const draft: NotesDoc = {
      id: `doc-draft-${state.sequence}`,
      title: 'New collaborative draft',
      summary: 'Quick draft generated from the notes module on mobile.',
      content: 'Quick draft generated from the notes module on mobile.',
      owner: 'You',
      updatedAt: 'Updated now',
    };

    state.docs = [draft, ...state.docs];
    state.activity = [
      {
        id: `act-draft-${state.sequence}`,
        actor: 'You',
        action: `created "${draft.title}"`,
        time: 'just now',
      },
      ...state.activity,
    ];

    return { ...draft };
  };

  const reset = () => {
    state = seedWorkspaceState();
  };

  return {
    getSnapshot,
    createQuickDraft,
    createDoc,
    reset,
  };
};

export const notesService = createNotesService();
