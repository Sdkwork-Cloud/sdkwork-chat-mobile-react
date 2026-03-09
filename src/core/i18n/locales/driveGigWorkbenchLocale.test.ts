import { describe, expect, it } from 'vitest';
import enUS from './en-US';
import zhCN from './zh-CN';

const getPathValue = (source: Record<string, any>, path: string) =>
  path.split('.').reduce<any>((current, key) => current?.[key], source);

describe('drive and gig workbench locale coverage', () => {
  it('exposes new drive and gig workbench labels in en-US resources', () => {
    expect(enUS.drive.hero_eyebrow).toBe('Drive workbench');
    expect(enUS.drive.hero_progress_label).toBe('Storage health');
    expect(enUS.drive.quick_action_upload).toBe('Bring in files');
    expect(enUS.drive.section_kicker).toBe('Workspace view');
    expect(enUS.drive.files_spotlight_title).toBe('Folder focus');
    expect(enUS.drive.recent_focus_title).toBe('Resume faster');
    expect(enUS.drive.transfer_board_title).toBe('Transfer board');
    expect(enUS.drive.category_spotlight_title).toBe('Top category');
    expect(enUS.drive.space_reclaim_title).toBe('Reclaim priority');
    expect(enUS.drive.files_empty_title).toBe('This folder is still clean');
    expect(enUS.drive.recent_empty_title).toBe('No recent activity yet');
    expect(enUS.drive.transfer_empty_title).toBe('Transfer queue is clear');
    expect(enUS.drive.category_empty_title).toBe('No categories to browse yet');
    expect(enUS.drive.space_error_title).toBe('Storage data is unavailable');

    expect(enUS.commerce.gig_center.primary_tabs.hall).toBe('Hall');
    expect(enUS.commerce.gig_center.primary_tabs.my).toBe('My gigs');
    expect(enUS.commerce.gig_center.hero_kicker).toBe('Gig workbench');
    expect(enUS.commerce.gig_center.hero_hall_title).toBe('Take the best gigs first');
    expect(enUS.commerce.gig_center.hero_my_title).toBe('Run delivery and payout from one queue');
    expect(enUS.commerce.gig_center.section_kicker).toBe('Gig workspace');
    expect(enUS.commerce.gig_center.workbench_income).toBe('Earned');
    expect(enUS.commerce.gig_center.hall_title).toBe('Opportunity hall');
    expect(enUS.commerce.gig_center.my_title).toBe('My delivery queue');
    expect(enUS.commerce.gig_center.empty_filtered).toBe('No gigs match this filter');
    expect(enUS.commerce.gig_center.my_empty_active_copy).toBe(
      'Accept work from the hall and it will move into your active queue here.'
    );
  });

  it('exposes new drive and gig workbench labels in zh-CN resources', () => {
    const zhPaths = [
      'drive.hero_eyebrow',
      'drive.hero_progress_label',
      'drive.quick_action_upload',
      'drive.section_kicker',
      'drive.files_spotlight_title',
      'drive.recent_focus_title',
      'drive.transfer_board_title',
      'drive.category_spotlight_title',
      'drive.space_reclaim_title',
      'drive.files_empty_title',
      'drive.recent_empty_title',
      'drive.transfer_empty_title',
      'drive.category_empty_title',
      'drive.space_error_title',
      'commerce.gig_center.primary_tabs.hall',
      'commerce.gig_center.primary_tabs.my',
      'commerce.gig_center.hero_kicker',
      'commerce.gig_center.hero_hall_title',
      'commerce.gig_center.hero_my_title',
      'commerce.gig_center.section_kicker',
      'commerce.gig_center.workbench_income',
      'commerce.gig_center.hall_title',
      'commerce.gig_center.my_title',
      'commerce.gig_center.empty_filtered',
      'commerce.gig_center.my_empty_active_copy',
    ];

    for (const path of zhPaths) {
      expect(getPathValue(zhCN, path), path).toBeTruthy();
    }
  });
});
