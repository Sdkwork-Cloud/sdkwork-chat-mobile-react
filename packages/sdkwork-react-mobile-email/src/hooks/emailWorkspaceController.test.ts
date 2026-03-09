import { describe, expect, it } from 'vitest';
import { createEmailService } from '../services/emailService';
import { createEmailWorkspaceController } from './emailWorkspaceController';

describe('emailWorkspaceController', () => {
  it('loads initial workspace snapshot from service', () => {
    const service = createEmailService();
    const controller = createEmailWorkspaceController(service);
    const snapshot = controller.getSnapshot();

    expect(snapshot.inbox.length).toBeGreaterThan(0);
    expect(snapshot.starred.length).toBeGreaterThan(0);
    expect(snapshot.sent.length).toBeGreaterThan(0);
    expect(snapshot.spaces.length).toBeGreaterThan(0);
  });

  it('syncs local snapshot after compose action', () => {
    const service = createEmailService();
    const controller = createEmailWorkspaceController(service);
    const before = controller.getSnapshot().sent.length;

    const thread = controller.composeSystemThread();
    const snapshot = controller.getSnapshot();

    expect(snapshot.sent.length).toBe(before + 1);
    expect(snapshot.sent[0].id).toBe(thread.id);
  });

  it('syncs local snapshot after sending a user message', () => {
    const service = createEmailService();
    const controller = createEmailWorkspaceController(service);
    const before = controller.getSnapshot().sent.length;

    const thread = controller.sendThread({
      recipient: 'Product Core',
      subject: 'Email module milestone',
      body: 'Completed route split and module tabbar polish.',
    });
    const snapshot = controller.getSnapshot();

    expect(snapshot.sent.length).toBe(before + 1);
    expect(snapshot.sent[0].id).toBe(thread.id);
    expect(snapshot.sent[0].subject).toBe('Email module milestone');
  });

  it('refreshes snapshot when service changes externally', () => {
    const service = createEmailService();
    const controller = createEmailWorkspaceController(service);
    const before = controller.getSnapshot().sent.length;

    service.composeSystemThread();
    controller.refresh();
    const snapshot = controller.getSnapshot();

    expect(snapshot.sent.length).toBe(before + 1);
  });
});
