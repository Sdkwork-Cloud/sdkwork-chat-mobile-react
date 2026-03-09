import { describe, expect, it } from 'vitest';
import { buildOpenChatQrLink, parseOpenChatQrLink, OPENCHAT_QR_LINK_VERSION } from './qrLinkProtocol';

describe('qrLinkProtocol', () => {
  it('builds standard http qr link with required fields', () => {
    const link = buildOpenChatQrLink({
      type: 'user',
      id: 'u_1001',
      name: 'Alice',
      baseUrl: 'https://sdkwork.ai',
    });

    expect(link).toContain('https://sdkwork.ai/scan?');
    expect(link).toContain('qr=1');
    expect(link).toContain(`v=${OPENCHAT_QR_LINK_VERSION}`);
    expect(link).toContain('type=user');
    expect(link).toContain('id=u_1001');
    expect(link).toContain('name=Alice');
  });

  it('parses standard http qr link into typed payload', () => {
    const parsed = parseOpenChatQrLink(
      'https://sdkwork.ai/scan?qr=1&v=1&type=group&id=g_core&name=SDKWORK-Core'
    );

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('group');
    expect(parsed?.id).toBe('g_core');
    expect(parsed?.name).toBe('SDKWORK-Core');
  });
});
