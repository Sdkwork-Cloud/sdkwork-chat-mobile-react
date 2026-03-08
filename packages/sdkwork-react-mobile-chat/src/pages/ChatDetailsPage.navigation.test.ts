import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ChatDetailsPage navigation entries', () => {
  it('exposes join-group entry callback in group chat details', () => {
    const source = fs.readFileSync(path.join(__dirname, 'ChatDetailsPage.tsx'), 'utf8');

    expect(source).toContain('onNavigateToGroupJoin?: () => void;');
    expect(source).toContain("onNavigateToQRCode?: (payload: {");
    expect(source).toContain("type: 'user' | 'group' | 'agent';");
    expect(source).toContain("title={tr('chat.group_join_center', '\\u52a0\\u7fa4\\u4e0e\\u4ed8\\u8d39')}");
    expect(source).toContain('onClick={onNavigateToGroupJoin}');
    expect(source).toContain('onClick={handleNavigateToQRCode}');
  });
});
