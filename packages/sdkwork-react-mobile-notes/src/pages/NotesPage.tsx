import React from 'react';
import { useNotesWorkspace } from '../hooks/useNotesWorkspace';
import type { NotesPrimaryTab, NotesTask } from '../services/notesService';
import './NotesPage.css';

interface NotesPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onCreate?: () => void;
  onOpenDoc?: (docId: string) => void;
}

const PRIMARY_TABS: Array<{ id: NotesPrimaryTab; labelKey: string; fallbackLabel: string; shortLabel: string }> = [
  { id: 'docs', labelKey: 'notes.tabs.docs', fallbackLabel: 'Docs', shortLabel: 'D' },
  { id: 'tasks', labelKey: 'notes.tabs.tasks', fallbackLabel: 'Tasks', shortLabel: 'T' },
  { id: 'wiki', labelKey: 'notes.tabs.wiki', fallbackLabel: 'Wiki', shortLabel: 'W' },
  { id: 'activity', labelKey: 'notes.tabs.activity', fallbackLabel: 'Activity', shortLabel: 'A' },
];

const getTaskStatusClassName = (status: NotesTask['status']) => {
  if (status === 'In Progress') return 'status-in-progress';
  if (status === 'Done') return 'status-done';
  return 'status-todo';
};

export const NotesPage: React.FC<NotesPageProps> = ({ t, onBack, onCreate, onOpenDoc }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const [activePrimaryTab, setActivePrimaryTab] = React.useState<NotesPrimaryTab>('docs');
  const { snapshot } = useNotesWorkspace();
  const openTaskCount = React.useMemo(
    () => snapshot.tasks.filter((task) => task.status !== 'Done').length,
    [snapshot.tasks]
  );

  const tabLabelMap = React.useMemo(
    () =>
      PRIMARY_TABS.reduce<Record<NotesPrimaryTab, string>>(
        (acc, tab) => {
          acc[tab.id] = tr(tab.labelKey, tab.fallbackLabel);
          return acc;
        },
        {
          docs: 'Docs',
          tasks: 'Tasks',
          wiki: 'Wiki',
          activity: 'Activity',
        }
      ),
    [tr]
  );

  const tabCountMap = React.useMemo(
    () => ({
      docs: snapshot.docs.length,
      tasks: snapshot.tasks.length,
      wiki: snapshot.wiki.length,
      activity: snapshot.activity.length,
    }),
    [snapshot.activity.length, snapshot.docs.length, snapshot.tasks.length, snapshot.wiki.length]
  );

  const spotlightMetrics = React.useMemo(
    () => [
      { key: 'docs', label: tr('notes.metric_docs', 'Docs'), value: snapshot.docs.length },
      { key: 'open-tasks', label: tr('notes.metric_open_tasks', 'Open tasks'), value: openTaskCount },
      { key: 'wiki', label: tr('notes.metric_wiki', 'Wiki'), value: snapshot.wiki.length },
      { key: 'activity', label: tr('notes.metric_activity', 'Activity'), value: snapshot.activity.length },
    ],
    [openTaskCount, snapshot.activity.length, snapshot.docs.length, snapshot.wiki.length, tr]
  );

  const docsPreview = React.useMemo(() => snapshot.docs.slice(0, 2), [snapshot.docs]);
  const wikiPreview = React.useMemo(() => snapshot.wiki.slice(0, 1), [snapshot.wiki]);
  const activityPreview = React.useMemo(() => snapshot.activity.slice(0, 1), [snapshot.activity]);

  const handleCreate = React.useCallback(() => {
    onCreate?.();
  }, [onCreate]);

  const handleOpenTasks = React.useCallback(() => {
    setActivePrimaryTab('tasks');
  }, []);

  const handleOpenWiki = React.useCallback(() => {
    setActivePrimaryTab('wiki');
  }, []);

  const panelTitle =
    activePrimaryTab === 'docs'
      ? tr('notes.knowledge_title', 'Knowledge in motion')
      : tabLabelMap[activePrimaryTab];

  const panelSubtitle =
    activePrimaryTab === 'docs'
      ? tr('notes.workbench_subtitle', 'Capture decisions, align tasks, and keep docs moving in one shared space.')
      : tr('notes.workspace_subtitle', 'Notion-style collaboration hub for docs, tasks, and decisions');

  const renderEmptyState = () => (
    <section className="notes-page__empty-state">
      <div className="notes-page__empty-title">{tr('notes.empty_title', 'Nothing to review here yet')}</div>
      <div className="notes-page__empty-description">
        {tr('notes.empty_description', 'Create a new note or switch tabs to keep collaboration moving.')}
      </div>
      <button type="button" className="notes-page__empty-action" onClick={handleCreate}>
        {tr('notes.create', 'Create')}
      </button>
    </section>
  );

  return (
    <div className="notes-page">
      <header className="notes-page__command-shell">
        <button
          type="button"
          className="notes-page__nav-pill"
          onClick={onBack}
          aria-label={tr('notes.back', 'Back')}
        >
          <span aria-hidden="true">&lt;</span>
        </button>

        <button
          type="button"
          className="notes-page__search-field"
          aria-label={tr('notes.search_placeholder', 'Search docs, tasks, or wiki')}
        >
          <span className="notes-page__search-icon" aria-hidden="true" />
          <span className="notes-page__search-placeholder">
            {tr('notes.search_placeholder', 'Search docs, tasks, or wiki')}
          </span>
        </button>

        <button
          type="button"
          className="notes-page__workspace-pill"
          onClick={handleOpenWiki}
          aria-label={tr('notes.quick_open_wiki', 'Open wiki')}
        >
          WK
        </button>
      </header>

      <div className="notes-page__body">
        <section className="notes-page__workspace-panel">
          <div className="notes-page__workspace-head">
            <div className="notes-page__workspace-copy">
              <div className="notes-page__workspace-kicker">
                {tr('notes.workbench_kicker', 'Collaboration workbench')}
              </div>
              <div className="notes-page__workspace-title-row">
                <h1 className="notes-page__workspace-title">
                  {tr('notes.workbench_title', 'Team knowledge base')}
                </h1>
                <span className="notes-page__workspace-badge">{tabCountMap.docs}</span>
              </div>
              <p className="notes-page__workspace-subtitle">
                {tr(
                  'notes.workbench_subtitle',
                  'Capture decisions, align tasks, and keep docs moving in one shared space.'
                )}
              </p>
            </div>

            <button type="button" className="notes-page__create-pill" onClick={handleCreate}>
              <span className="notes-page__create-pill-plus" aria-hidden="true">
                +
              </span>
              <span>{tr('notes.quick_new_doc', 'New doc')}</span>
            </button>
          </div>

          <div className="notes-page__spotlight-grid">
            {spotlightMetrics.map((metric) => (
              <article key={metric.key} className="notes-page__spotlight-card">
                <div className="notes-page__spotlight-label">{metric.label}</div>
                <div className="notes-page__spotlight-value">{metric.value}</div>
              </article>
            ))}
          </div>

          <div className="notes-page__quick-actions">
            <button type="button" className="notes-page__quick-action is-primary" onClick={handleCreate}>
              {tr('notes.quick_new_doc', 'New doc')}
            </button>
            <button type="button" className="notes-page__quick-action" onClick={handleOpenTasks}>
              {tr('notes.open_tasks', 'Open tasks')}
            </button>
            <button type="button" className="notes-page__quick-action" onClick={handleOpenWiki}>
              {tr('notes.quick_open_wiki', 'Open wiki')}
            </button>
          </div>
        </section>

        <section className="notes-page__knowledge-strip">
          <div className="notes-page__subsection-heading">
            <div>
              <div className="notes-page__subsection-title">{tr('notes.knowledge_title', 'Knowledge in motion')}</div>
              <div className="notes-page__subsection-subtitle">{tr('notes.workspace_overview', 'Plan, document, and coordinate without leaving the workspace')}</div>
            </div>
          </div>

          <div className="notes-page__knowledge-grid">
            {docsPreview.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className="notes-page__knowledge-card"
                onClick={() => onOpenDoc?.(doc.id)}
              >
                <div className="notes-page__knowledge-label">{tabLabelMap.docs}</div>
                <div className="notes-page__knowledge-title">{doc.title}</div>
                <div className="notes-page__knowledge-copy">{doc.summary}</div>
              </button>
            ))}

            {wikiPreview.map((item) => (
              <button
                key={item.id}
                type="button"
                className="notes-page__knowledge-card"
                onClick={handleOpenWiki}
              >
                <div className="notes-page__knowledge-label">{tabLabelMap.wiki}</div>
                <div className="notes-page__knowledge-title">{item.title}</div>
                <div className="notes-page__knowledge-copy">{item.detail}</div>
              </button>
            ))}

            {activityPreview.map((item) => (
              <article key={item.id} className="notes-page__knowledge-card">
                <div className="notes-page__knowledge-label">{tabLabelMap.activity}</div>
                <div className="notes-page__knowledge-title">{item.actor}</div>
                <div className="notes-page__knowledge-copy">
                  {item.action} · {item.time}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="notes-page__section-heading">
          <div>
            <div className="notes-page__section-title">{panelTitle}</div>
            <div className="notes-page__section-subtitle">{panelSubtitle}</div>
          </div>
          <span className="notes-page__section-count">{tabCountMap[activePrimaryTab]}</span>
        </section>

        {activePrimaryTab === 'docs' &&
          (snapshot.docs.length > 0 ? (
            <section className="notes-page__panel">
              {snapshot.docs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className="notes-page__doc-card"
                  onClick={() => onOpenDoc?.(doc.id)}
                >
                  <div className="notes-page__doc-title">{doc.title}</div>
                  <div className="notes-page__doc-summary">{doc.summary}</div>
                  <div className="notes-page__doc-meta">
                    <span>{doc.owner}</span>
                    <span>|</span>
                    <span>{doc.updatedAt}</span>
                  </div>
                </button>
              ))}
            </section>
          ) : (
            renderEmptyState()
          ))}

        {activePrimaryTab === 'tasks' &&
          (snapshot.tasks.length > 0 ? (
            <section className="notes-page__panel">
              {snapshot.tasks.map((task) => (
                <article key={task.id} className="notes-page__task-card">
                  <div className="notes-page__task-top">
                    <div className="notes-page__task-title">{task.title}</div>
                    <span className={`notes-page__task-status ${getTaskStatusClassName(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="notes-page__task-meta">
                    <span>{task.owner}</span>
                    <span>|</span>
                    <span>{task.due}</span>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            renderEmptyState()
          ))}

        {activePrimaryTab === 'wiki' &&
          (snapshot.wiki.length > 0 ? (
            <section className="notes-page__panel">
              {snapshot.wiki.map((item) => (
                <article key={item.id} className="notes-page__wiki-card">
                  <div className="notes-page__wiki-title">{item.title}</div>
                  <div className="notes-page__wiki-detail">{item.detail}</div>
                </article>
              ))}
            </section>
          ) : (
            renderEmptyState()
          ))}

        {activePrimaryTab === 'activity' &&
          (snapshot.activity.length > 0 ? (
            <section className="notes-page__panel notes-page__activity-feed">
              {snapshot.activity.map((item) => (
                <article key={item.id} className="notes-page__activity-item">
                  <div className="notes-page__activity-main">
                    <span className="notes-page__activity-actor">{item.actor}</span>
                    <span className="notes-page__activity-action">{item.action}</span>
                  </div>
                  <div className="notes-page__activity-time">{item.time}</div>
                </article>
              ))}
            </section>
          ) : (
            renderEmptyState()
          ))}
      </div>

      <nav className="notes-page__tabbar" role="tablist" aria-label={tr('notes.tabs.label', 'Notes tabs')}>
        {PRIMARY_TABS.map((tab) => {
          const active = tab.id === activePrimaryTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
              className={`notes-page__tabbar-item${active ? ' notes-page__tabbar-item--active' : ''}`}
              onClick={() => setActivePrimaryTab(tab.id)}
            >
              <span className="notes-page__tabbar-icon" aria-hidden="true">
                {tab.shortLabel}
              </span>
              <span>{tr(tab.labelKey, tab.fallbackLabel)}</span>
              <span className="notes-page__tabbar-badge">{tabCountMap[tab.id]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default NotesPage;
