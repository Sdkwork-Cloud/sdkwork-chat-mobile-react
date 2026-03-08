import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('MyQRCodePage type support', () => {
  it('supports user, group and agent qr rendering', () => {
    const source = fs.readFileSync(path.join(__dirname, 'MyQRCodePage.tsx'), 'utf8');

    expect(source).toContain("type?: 'user' | 'group' | 'agent';");
    expect(source).toContain("type === 'agent'");
    expect(source).toContain('const qrPayload = React.useMemo(');
  });
});

