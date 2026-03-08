import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AgentsPage scan context', () => {
  it('supports scanned-agent banner and quick entry action', () => {
    const source = fs.readFileSync(path.join(__dirname, 'AgentsPage.tsx'), 'utf8');

    expect(source).toContain('scannedAgent?: { id?: string; name?: string }');
    expect(source).toContain('onOpenScannedAgent?: (agentId: string) => void | Promise<void>');
    expect(source).toContain('agents-page__scan-banner');
    expect(source).toContain('handleOpenScannedAgent');
  });
});

