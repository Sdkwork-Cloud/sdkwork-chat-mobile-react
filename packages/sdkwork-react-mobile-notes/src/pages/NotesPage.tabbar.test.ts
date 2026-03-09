import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('NotesPage tabbar integration', () => {
  it('renders notion-style workbench shell with collaboration previews and module tabbar', () => {
    const source = fs.readFileSync(path.join(__dirname, 'NotesPage.tsx'), 'utf8');

    expect(source).toContain('notes-page__command-shell');
    expect(source).toContain('notes-page__workspace-panel');
    expect(source).toContain('notes-page__spotlight-grid');
    expect(source).toContain('notes-page__quick-actions');
    expect(source).toContain('notes-page__knowledge-strip');
    expect(source).toContain('notes-page__section-heading');
    expect(source).toContain('notes-page__empty-state');
    expect(source).toContain('notes-page__tabbar');
    expect(source).toContain('notes-page__tabbar-badge');
    expect(source).toContain("activePrimaryTab === 'docs'");
    expect(source).toContain("activePrimaryTab === 'tasks'");
    expect(source).toContain("activePrimaryTab === 'wiki'");
    expect(source).toContain("activePrimaryTab === 'activity'");
    expect(source).toContain("snapshot.tasks.filter((task) => task.status !== 'Done').length");
    expect(source).toContain("tr('notes.search_placeholder', 'Search docs, tasks, or wiki')");
    expect(source).toContain("tr('notes.workbench_title', 'Team knowledge base')");
    expect(source).toContain("tr('notes.knowledge_title', 'Knowledge in motion')");
    expect(source).toContain("tr('notes.quick_open_wiki', 'Open wiki')");
    expect(source).toContain("setActivePrimaryTab('tasks')");
    expect(source).toContain("tr('notes.open_tasks', 'Open tasks')");
    expect(source).toContain("tr('notes.empty_title', 'Nothing to review here yet')");
  });
});
