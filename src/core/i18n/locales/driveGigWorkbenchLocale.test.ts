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
    expect(enUS.commerce.my_gigs.hero_kicker).toBe('Fulfillment desk');
    expect(enUS.commerce.my_gigs.hero_title).toBe('Run delivery and payout with less context switching');
    expect(enUS.commerce.my_gigs.hero_subtitle).toBe(
      'Track what needs delivery now, what is waiting for review, and what already paid out.'
    );
    expect(enUS.commerce.my_gigs.empty_active_copy).toBe(
      'Accept gigs from the hall and they will appear here as your live delivery queue.'
    );
    expect(enUS.commerce.my_gigs.empty_history_copy).toBe(
      'Completed and settled gigs will build your history once the first delivery is closed.'
    );
    expect(enUS.commerce.orders.hero_kicker).toBe('Order workspace');
    expect(enUS.commerce.orders.hero_title).toBe('See which orders need action first');
    expect(enUS.commerce.orders.hero_subtitle).toBe(
      'Use payment, shipping, and refund signals to decide which queue deserves attention now.'
    );
    expect(enUS.commerce.orders.queue_title).toBe('Order queue');
    expect(enUS.commerce.orders.queue_subtitle).toBe(
      'Each card keeps status, amount, and next action in one scan line.'
    );
    expect(enUS.commerce.order_detail.progress_title).toBe('Journey');
    expect(enUS.commerce.order_detail.command_title).toBe('Next action');
    expect(enUS.commerce.order_detail.amount_title).toBe('Payment breakdown');
    expect(enUS.commerce.order_detail.overview_title).toBe('Order portfolio');
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
      'commerce.my_gigs.hero_kicker',
      'commerce.my_gigs.hero_title',
      'commerce.my_gigs.hero_subtitle',
      'commerce.my_gigs.empty_active_copy',
      'commerce.my_gigs.empty_history_copy',
      'commerce.orders.hero_kicker',
      'commerce.orders.hero_title',
      'commerce.orders.hero_subtitle',
      'commerce.orders.queue_title',
      'commerce.orders.queue_subtitle',
      'commerce.order_detail.progress_title',
      'commerce.order_detail.command_title',
      'commerce.order_detail.amount_title',
      'commerce.order_detail.overview_title',
    ];

    for (const path of zhPaths) {
      expect(getPathValue(zhCN, path), path).toBeTruthy();
    }
  });
});
