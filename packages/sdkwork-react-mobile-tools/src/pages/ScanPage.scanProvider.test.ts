import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ScanPage scan provider integration', () => {
  it('prefers platform scanQRCode and keeps mock fallback', () => {
    const source = fs.readFileSync(path.join(__dirname, 'ScanPage.tsx'), 'utf8');

    expect(source).toContain('@sdkwork/react-mobile-core/platform');
    expect(source).toContain('camera.scanQRCode()');
    expect(source).toContain('MOCK_SCAN_RESULTS');
  });
});
