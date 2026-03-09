import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('GigCenterPage tabbar integration', () => {
  it('renders module-level gig center tabbar with hall and my views', () => {
    const source = fs.readFileSync(path.join(__dirname, 'GigCenterPage.tsx'), 'utf8');

    expect(source).toContain('gig-center__tabbar');
    expect(source).toContain('gig-center__hero');
    expect(source).toContain('gig-center__workbench');
    expect(source).toContain('gig-center__section-heading');
    expect(source).toContain('gig-center__empty-state');
    expect(source).toContain("activePrimaryTab === 'hall'");
    expect(source).toContain("activePrimaryTab === 'my'");
  });
});
