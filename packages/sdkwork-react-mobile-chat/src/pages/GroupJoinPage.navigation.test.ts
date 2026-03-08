import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('GroupJoinPage groups and payment interactions', () => {
  it('uses chat-domain group join service instead of inline business constants', () => {
    const source = fs.readFileSync(path.join(__dirname, 'GroupJoinPage.tsx'), 'utf8');

    expect(source).toContain("import {");
    expect(source).toContain("groupJoinService");
    expect(source).toContain("resolveGroupJoinAction");
    expect(source).toContain("formatGroupJoinPrice");
    expect(source).not.toContain("const GROUP_JOIN_PLANS: GroupJoinPlan[] = [");
    expect(source).toContain('scanGroupId?: string;');
    expect(source).toContain('scanGroupName?: string;');
    expect(source).toContain("group-join-page__cell--scan-target");
  });
});
