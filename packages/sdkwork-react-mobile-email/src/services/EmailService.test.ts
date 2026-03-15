import { describe, expect, it } from 'vitest';

import { clearComposeDraft, createEmailService, persistComposeDraft, readComposeDraft } from './EmailService';

describe('EmailService', () => {
  it('returns seeded workspace snapshot', () => {
    const service = createEmailService();
    const snapshot = service.getSnapshot();

    expect(snapshot.inbox.length).toBeGreaterThan(0);
    expect(snapshot.starred.length).toBeGreaterThan(0);
    expect(snapshot.sent.length).toBeGreaterThan(0);
    expect(snapshot.spaces.length).toBeGreaterThan(0);
    expect(snapshot.summaries.map((item) => item.id)).toEqual(['primary', 'updates', 'forums']);
  });

  it('prepends a new sent thread when composing', () => {
    const service = createEmailService();
    const before = service.getSnapshot().sent.length;
    const thread = service.composeSystemThread();
    const snapshot = service.getSnapshot();

    expect(thread.id.startsWith('mail-sent-system-')).toBe(true);
    expect(snapshot.sent.length).toBe(before + 1);
    expect(snapshot.sent[0].id).toBe(thread.id);
  });

  it('creates a sent thread from compose payload', () => {
    const service = createEmailService();
    const before = service.getSnapshot().sent.length;

    const thread = service.sendThread({
      recipient: 'Mobile QA',
      subject: 'Compose route regression',
      body: 'Confirm sent mail is visible in thread detail page.',
      replyToThreadId: 'mail-inbox-1',
    });
    const snapshot = service.getSnapshot();

    expect(thread.id.startsWith('mail-sent-user-')).toBe(true);
    expect(thread.sender).toContain('Mobile QA');
    expect(thread.subject).toBe('Compose route regression');
    expect(thread.snippet).toContain('Confirm sent mail');
    expect(snapshot.sent.length).toBe(before + 1);
    expect(snapshot.sent[0].id).toBe(thread.id);
  });

  it('persists and clears compose drafts', () => {
    const key = 'sdkwork.email.compose.test';
    clearComposeDraft(key);

    persistComposeDraft(key, {
      recipient: 'qa@sdkwork.com',
      subject: 'Draft',
      body: 'Draft body',
    });

    expect(readComposeDraft(key)).toEqual({
      recipient: 'qa@sdkwork.com',
      subject: 'Draft',
      body: 'Draft body',
    });

    clearComposeDraft(key);
    expect(readComposeDraft(key)).toBeNull();
  });

  it('resets workspace to initial seeded state', () => {
    const service = createEmailService();
    service.composeSystemThread();
    service.reset();

    const snapshot = service.getSnapshot();
    expect(snapshot.sent[0].id).toBe('mail-sent-1');
  });
});
