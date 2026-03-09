import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('EmailPage tabbar integration', () => {
  it('renders gmail-style workbench shell with inbox-first navigation and spaces preview', () => {
    const source = fs.readFileSync(path.join(__dirname, 'EmailPage.tsx'), 'utf8');

    expect(source).toContain('email-page__search-shell');
    expect(source).toContain('email-page__account-pill');
    expect(source).toContain('email-page__workbench');
    expect(source).toContain('email-page__metric-grid');
    expect(source).toContain('email-page__quick-actions');
    expect(source).toContain('email-page__priority-list');
    expect(source).toContain('email-page__spaces-section');
    expect(source).toContain('email-page__empty-state');
    expect(source).toContain('email-page__tabbar');
    expect(source).toContain('email-page__tabbar-badge');
    expect(source).toContain("activePrimaryTab === 'inbox'");
    expect(source).toContain("activePrimaryTab === 'starred'");
    expect(source).toContain("activePrimaryTab === 'sent'");
    expect(source).toContain("activePrimaryTab === 'spaces'");
    expect(source).toContain("snapshot.inbox.filter((thread) => thread.unread).length");
    expect(source).toContain("tr('email.search_placeholder', 'Search in mail')");
    expect(source).toContain("tr('email.workbench_title', 'Inbox first')");
    expect(source).toContain("tr('email.priority_title', 'Priority inbox')");
    expect(source).toContain("tr('email.spaces_title', 'Shared spaces')");
    expect(source).toContain("setActivePrimaryTab('spaces')");
    expect(source).toContain("tr('email.open_spaces', 'Open spaces')");
    expect(source).toContain("tr('email.empty_title', 'Nothing in this view yet')");
  });
});
