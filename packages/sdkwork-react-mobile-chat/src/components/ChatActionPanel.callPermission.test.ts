import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ChatActionPanel call permission preflight', () => {
  it('uses prepareCallMediaSession before opening video call action', () => {
    const source = fs.readFileSync(path.join(__dirname, 'ChatActionPanel.tsx'), 'utf8');

    expect(source).toContain("import { prepareCallMediaSession } from '@sdkwork/react-mobile-core';");
    expect(source).toContain('onStartVideoCall?: (payload: {');
    expect(source).toContain("const session = await prepareCallMediaSession({");
    expect(source).toContain("preferredMode: 'video'");
    expect(source).toContain("allowAudioFallback: true");
    expect(source).toContain("if (!session.ready) {");
    expect(source).toContain("session.mode === 'audio' && session.fallbackApplied");
    expect(source).toContain(
      "onStartVideoCall?.({ sessionId, mode: session.mode, fallbackApplied: session.fallbackApplied });",
    );
  });
});
