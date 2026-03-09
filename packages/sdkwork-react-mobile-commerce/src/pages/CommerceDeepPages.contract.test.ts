import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('commerce deep workflow pages contract', () => {
  it('keeps MyGigsPage wired as a fulfillment workbench', () => {
    const source = fs.readFileSync(path.join(__dirname, 'MyGigsPage.tsx'), 'utf8');

    expect(source).toContain("import './MyGigsPage.css';");
    expect(source).toContain('commerce-my-gigs__hero');
    expect(source).toContain('commerce-my-gigs__workbench');
    expect(source).toContain('commerce-my-gigs__tabbar');
    expect(source).toContain('commerce-my-gigs__queue');
    expect(source).toContain('commerce-my-gigs__card');
    expect(source).toContain('commerce-my-gigs__sheet');
    expect(source).toContain('commerce-my-gigs__sheet-summary');
    expect(source).toContain('commerce-my-gigs__sheet-actions');
    expect(source).toContain("tr('commerce.my_gigs.hero_kicker', 'Fulfillment desk')");
    expect(source).toContain("tr('commerce.my_gigs.hero_title', 'Run delivery and payout with less context switching')");
    expect(source).toContain("commerce.my_gigs.hero_subtitle");
    expect(source).toContain('Track what needs delivery now, what is waiting for review, and what already paid out.');
    expect(source).toContain('commerce.my_gigs.empty_active_copy');
    expect(source).toContain('Accept gigs from the hall and they will appear here as your live delivery queue.');
    expect(source).toContain('commerce.my_gigs.empty_history_copy');
    expect(source).toContain('Completed and settled gigs will build your history once the first delivery is closed.');
  });

  it('keeps OrderListPage wired as an order queue center', () => {
    const source = fs.readFileSync(path.join(__dirname, 'OrderListPage.tsx'), 'utf8');

    expect(source).toContain('commerce-order-list__hero');
    expect(source).toContain('commerce-order-list__workbench');
    expect(source).toContain('commerce-order-list__tabbar');
    expect(source).toContain('commerce-order-list__queue-heading');
    expect(source).toContain('commerce-order-list__decision-strip');
    expect(source).toContain('commerce-order-list__order-card');
    expect(source).toContain('commerce-order-list__order-actions');
    expect(source).toContain("tr('commerce.orders.hero_kicker', 'Order workspace')");
    expect(source).toContain("tr('commerce.orders.hero_title', 'See which orders need action first')");
    expect(source).toContain("commerce.orders.hero_subtitle");
    expect(source).toContain('Use payment, shipping, and refund signals to decide which queue deserves attention now.');
    expect(source).toContain("tr('commerce.orders.queue_title', 'Order queue')");
    expect(source).toContain('commerce.orders.queue_subtitle');
    expect(source).toContain('Each card keeps status, amount, and next action in one scan line.');
  });

  it('keeps OrderDetailPage wired as a fulfillment console', () => {
    const source = fs.readFileSync(path.join(__dirname, 'OrderDetailPage.tsx'), 'utf8');

    expect(source).toContain('commerce-order-detail__status-board');
    expect(source).toContain('commerce-order-detail__journey');
    expect(source).toContain('commerce-order-detail__journey-steps');
    expect(source).toContain('commerce-order-detail__surface');
    expect(source).toContain('commerce-order-detail__summary-grid');
    expect(source).toContain('commerce-order-detail__command-title');
    expect(source).toContain('commerce-order-detail__footer');
    expect(source).toContain("tr('commerce.order_detail.progress_title', 'Journey')");
    expect(source).toContain("tr('commerce.order_detail.command_title', 'Next action')");
    expect(source).toContain("tr('commerce.order_detail.amount_title', 'Payment breakdown')");
    expect(source).toContain("tr('commerce.order_detail.overview_title', 'Order portfolio')");
  });
});
