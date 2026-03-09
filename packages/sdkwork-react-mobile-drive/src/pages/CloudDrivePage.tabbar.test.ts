import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CloudDrivePage tabbar integration', () => {
  it('renders module-level drive tabbar with five primary tabs', () => {
    const source = fs.readFileSync(path.join(__dirname, 'CloudDrivePage.tsx'), 'utf8');

    expect(source).toContain('drive-page__tabbar');
    expect(source).toContain('drive-page__hero');
    expect(source).toContain('drive-page__files-spotlight');
    expect(source).toContain('drive-page__recent-focus');
    expect(source).toContain('drive-page__transfer-board');
    expect(source).toContain('drive-page__category-spotlight');
    expect(source).toContain('drive-page__space-advisor');
    expect(source).toContain('drive-page__quick-actions');
    expect(source).toContain('drive-page__section-heading');
    expect(source).toContain('drive-page__empty-state');
    expect(source).toContain('DRIVE_PRIMARY_TABS');
    expect(source).toContain("activePrimaryTab === 'files'");
    expect(source).toContain("activePrimaryTab === 'recent'");
    expect(source).toContain("activePrimaryTab === 'transfer'");
    expect(source).toContain("activePrimaryTab === 'category'");
    expect(source).toContain("activePrimaryTab === 'space'");
    expect(source).toContain("tr('drive.files_spotlight_title', 'Folder focus')");
    expect(source).toContain("tr('drive.recent_focus_title', 'Resume faster')");
    expect(source).toContain("tr('drive.transfer_board_title', 'Transfer board')");
    expect(source).toContain("tr('drive.category_spotlight_title', 'Top category')");
    expect(source).toContain("tr('drive.space_reclaim_title', 'Reclaim priority')");
  });
});
