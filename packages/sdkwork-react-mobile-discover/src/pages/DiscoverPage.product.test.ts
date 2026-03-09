import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('DiscoverPage product structure', () => {
  it('renders a workspace hero and featured service grid', () => {
    const source = fs.readFileSync(path.join(__dirname, 'DiscoverPage.tsx'), 'utf8');

    expect(source).toContain('discover-page__hero');
    expect(source).toContain('discover-page__featured-grid');
    expect(source).toContain('discover-page__section-heading');
    expect(source).toContain('buildDiscoverFeaturedCells');
  });
});
