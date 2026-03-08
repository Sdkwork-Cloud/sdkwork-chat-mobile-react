import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('MePage shortcut entries', () => {
  it('does not keep moments shortcut in me page to avoid duplicate discover entry', () => {
    const mePageSource = fs.readFileSync(path.join(__dirname, 'MePage.tsx'), 'utf8');

    expect(mePageSource).not.toContain("tr('me.moments'");
    expect(mePageSource).not.toContain('onMomentsClick');
    expect(mePageSource).toContain("tr('me.cart'");
  });

  it('does not pass moments handler into me page route props', () => {
    const routerSource = fs.readFileSync(path.resolve(__dirname, '../../../../src/router/index.tsx'), 'utf8');

    expect(routerSource).not.toContain('onMomentsClick: () => navigate(\'/moments\')');
  });

  it('keeps header visible when cached profile exists during refresh loading', () => {
    const mePageSource = fs.readFileSync(path.join(__dirname, 'MePage.tsx'), 'utf8');

    expect(mePageSource).toContain('isLoading && !profile ?');
  });
});
