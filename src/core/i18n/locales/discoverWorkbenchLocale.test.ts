import { describe, expect, it } from 'vitest';
import enUS from './en-US';
import zhCN from './zh-CN';

const getPathValue = (source: Record<string, any>, path: string) =>
  path.split('.').reduce<any>((current, key) => current?.[key], source);

describe('discover workbench locale coverage', () => {
  it('exposes discover workbench labels in en-US resources', () => {
    expect(enUS.discover.hero_title).toBe('Workspaces and services');
    expect(enUS.discover.hero_subtitle).toBe('Jump into high-frequency modules first, then browse the rest of your service directory.');
    expect(enUS.discover.featured_title).toBe('Featured workspaces');
    expect(enUS.discover.services_title).toBe('More services');
    expect(enUS.discover.order_center_subtitle).toBe('Accept, deliver, and settle gigs');
    expect(enUS.discover.drive_subtitle).toBe('Files, categories, and storage');
    expect(enUS.discover.email_subtitle).toBe('Inbox, sent, and shared spaces');
    expect(enUS.discover.notes_subtitle).toBe('Docs, tasks, and wiki collaboration');
    expect(enUS.discover.workspace_badge).toBe('Workspace');
  });

  it('exposes discover workbench labels in zh-CN resources', () => {
    const zhPaths = [
      'discover.hero_title',
      'discover.hero_subtitle',
      'discover.featured_title',
      'discover.services_title',
      'discover.order_center_subtitle',
      'discover.drive_subtitle',
      'discover.email_subtitle',
      'discover.notes_subtitle',
      'discover.workspace_badge',
    ];

    for (const path of zhPaths) {
      expect(getPathValue(zhCN, path), path).toBeTruthy();
    }
  });
});
