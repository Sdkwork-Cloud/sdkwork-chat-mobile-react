import React from 'react';
import { Button, Popup, Toast } from '@sdkwork/react-mobile-commons';
import { PageScaffold } from '../components';
import { gigService, type GigOrder } from '../services/GigService';
import { formatDateTime } from './helpers';
import './MyGigsPage.css';

interface MyGigsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

type MyGigTab = 'active' | 'history';

interface SummaryState {
  active: number;
  review: number;
  completed: number;
}

const statusColor: Record<GigOrder['status'], string> = {
  available: 'var(--text-secondary)',
  taken: 'var(--primary-color)',
  submitted: '#f59e0b',
  completed: '#07c160',
};

const typeColor: Record<GigOrder['type'], string> = {
  design: '#7c3aed',
  video_edit: '#ec4899',
  delivery: '#16a34a',
  ride: '#2563eb',
  clean: '#f97316',
};

const formatMoney = (amount: number) => `¥${amount.toFixed(2)}`;

const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (full, key) => {
    const value = values[key];
    return value === undefined || value === null ? full : String(value);
  });

export const MyGigsPage: React.FC<MyGigsPageProps> = ({ t, onBack }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const [tab, setTab] = React.useState<MyGigTab>('active');
  const [orders, setOrders] = React.useState<GigOrder[]>([]);
  const [summary, setSummary] = React.useState<SummaryState>({
    active: 0,
    review: 0,
    completed: 0,
  });
  const [earnings, setEarnings] = React.useState({ today: 0, total: 0 });
  const [loading, setLoading] = React.useState(false);
  const [activeOrder, setActiveOrder] = React.useState<GigOrder | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const statusText = React.useMemo<Record<GigOrder['status'], string>>(
    () => ({
      available: tr('commerce.my_gigs.status.available', 'Available'),
      taken: tr('commerce.my_gigs.status.taken', 'To deliver'),
      submitted: tr('commerce.my_gigs.status.submitted', 'Pending review'),
      completed: tr('commerce.my_gigs.status.completed', 'Completed'),
    }),
    [tr]
  );

  const typeText = React.useMemo<Record<GigOrder['type'], string>>(
    () => ({
      design: tr('commerce.gig_center.type.design', 'Design'),
      video_edit: tr('commerce.gig_center.type.video_edit', 'Video'),
      delivery: tr('commerce.gig_center.type.delivery', 'Delivery'),
      ride: tr('commerce.gig_center.type.ride', 'Ride'),
      clean: tr('commerce.gig_center.type.clean', 'Cleaning'),
    }),
    [tr]
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    const [currentResult, activeResult, historyResult, earningsResult] = await Promise.all([
      gigService.getMyOrders(tab),
      gigService.getMyOrders('active'),
      gigService.getMyOrders('history'),
      gigService.getEarnings(),
    ]);

    if (currentResult.success && currentResult.data) {
      setOrders(currentResult.data);
    } else {
      setOrders([]);
    }

    const activeOrders = activeResult.success && activeResult.data ? activeResult.data : [];
    const historyOrders = historyResult.success && historyResult.data ? historyResult.data : [];

    setSummary({
      active: activeOrders.length,
      review: activeOrders.filter((item) => item.status === 'submitted').length,
      completed: historyOrders.length,
    });
    setEarnings(earningsResult);
    setLoading(false);
  }, [tab]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const submitWork = async (order: GigOrder) => {
    setSubmitting(true);
    const result = await gigService.submitWork(
      order.id,
      order.type === 'video_edit'
        ? 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=720'
        : 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=720',
      order.type === 'video_edit' ? 'video' : 'image'
    );
    setSubmitting(false);

    if (!result.success) {
      Toast.error(result.message || tr('commerce.my_gigs.submit_failed', 'Submit failed'));
      return;
    }

    Toast.success(tr('commerce.my_gigs.submit_success', 'Delivered successfully, waiting for review'));
    setActiveOrder(null);
    await load();
  };

  const completeOrder = async (order: GigOrder) => {
    setSubmitting(true);
    const result = await gigService.completeOrder(order.id);
    setSubmitting(false);

    if (!result.success) {
      Toast.error(result.message || tr('commerce.my_gigs.settle_failed', 'Settlement failed'));
      return;
    }

    Toast.success(
      fillTemplate(tr('commerce.my_gigs.settle_success', 'Settlement successful +¥{amount}'), {
        amount: order.price.toFixed(2),
      })
    );
    setActiveOrder(null);
    await load();
  };

  const workbenchMetrics = React.useMemo(
    () => [
      {
        label: tr('commerce.my_gigs.metric_active', 'Active'),
        value: String(summary.active),
      },
      {
        label: tr('commerce.my_gigs.metric_review', 'Waiting review'),
        value: String(summary.review),
      },
      {
        label: tr('commerce.my_gigs.metric_completed', 'Completed'),
        value: String(summary.completed),
      },
      {
        label: tr('commerce.my_gigs.metric_income', 'Earned'),
        value: formatMoney(earnings.total),
      },
    ],
    [earnings.total, summary.active, summary.completed, summary.review, tr]
  );

  const heroBadge =
    tab === 'active'
      ? `${summary.active} ${summary.active === 1 ? 'live gig' : 'live gigs'}`
      : `${summary.completed} ${summary.completed === 1 ? 'closed gig' : 'closed gigs'}`;

  const renderEmptyState = () => (
    <div className="commerce-my-gigs__empty">
      <div className="commerce-my-gigs__empty-icon">MG</div>
      <div className="commerce-my-gigs__empty-title">
        {tab === 'active'
          ? tr('commerce.my_gigs.empty_active', 'No active tasks')
          : tr('commerce.my_gigs.empty_history', 'No history tasks')}
      </div>
      <div className="commerce-my-gigs__empty-copy">
        {tab === 'active'
          ? tr(
              'commerce.my_gigs.empty_active_copy',
              'Accept gigs from the hall and they will appear here as your live delivery queue.'
            )
          : tr(
              'commerce.my_gigs.empty_history_copy',
              'Completed and settled gigs will build your history once the first delivery is closed.'
            )}
      </div>
      <div className="commerce-my-gigs__empty-actions">
        <button
          type="button"
          className="commerce-my-gigs__empty-button"
          onClick={() => setTab(tab === 'active' ? 'history' : 'active')}
        >
          {tab === 'active'
            ? tr('commerce.my_gigs.tabs.history', 'History')
            : tr('commerce.my_gigs.tabs.active', 'Active')}
        </button>
      </div>
    </div>
  );

  return (
    <PageScaffold title={tr('commerce.my_gigs.title', 'My Gigs')} onBack={onBack}>
      <section className="commerce-my-gigs__hero">
        <div className="commerce-my-gigs__hero-copy">
          <div className="commerce-my-gigs__hero-kicker">
            {tr('commerce.my_gigs.hero_kicker', 'Fulfillment desk')}
          </div>
          <div className="commerce-my-gigs__hero-title-row">
            <h1 className="commerce-my-gigs__hero-title">
              {tr('commerce.my_gigs.hero_title', 'Run delivery and payout with less context switching')}
            </h1>
            <span className="commerce-my-gigs__hero-badge">{heroBadge}</span>
          </div>
          <p className="commerce-my-gigs__hero-subtitle">
            {tr(
              'commerce.my_gigs.hero_subtitle',
              'Track what needs delivery now, what is waiting for review, and what already paid out.'
            )}
          </p>
        </div>

        <div className="commerce-my-gigs__hero-income">
          <div className="commerce-my-gigs__hero-income-label">{tr('commerce.gig_center.today_income', 'Today')}</div>
          <div className="commerce-my-gigs__hero-income-value">{formatMoney(earnings.today)}</div>
          <div className="commerce-my-gigs__hero-income-meta">
            {tr('commerce.gig_center.total_income', 'Total')} {formatMoney(earnings.total)}
          </div>
        </div>
      </section>

      <section className="commerce-my-gigs__workbench">
        <div className="commerce-my-gigs__workbench-grid">
          {workbenchMetrics.map((metric) => (
            <div key={metric.label} className="commerce-my-gigs__workbench-card">
              <div className="commerce-my-gigs__workbench-label">{metric.label}</div>
              <div className="commerce-my-gigs__workbench-value">{metric.value}</div>
            </div>
          ))}
        </div>
      </section>

      <nav className="commerce-my-gigs__tabbar" role="tablist" aria-label={tr('commerce.my_gigs.title', 'My Gigs')}>
        {(['active', 'history'] as const).map((item) => {
          const active = item === tab;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              className={`commerce-my-gigs__tab${active ? ' commerce-my-gigs__tab--active' : ''}`}
              onClick={() => setTab(item)}
            >
              {item === 'active'
                ? tr('commerce.my_gigs.tabs.active', 'Active')
                : tr('commerce.my_gigs.tabs.history', 'History')}
            </button>
          );
        })}
      </nav>

      <section className="commerce-my-gigs__queue">
        <div className="commerce-my-gigs__queue-heading">
          <div>
            <div className="commerce-my-gigs__queue-kicker">
              {tr('commerce.my_gigs.queue_kicker', 'Delivery queue')}
            </div>
            <h2 className="commerce-my-gigs__queue-title">
              {tab === 'active'
                ? tr('commerce.my_gigs.queue_title_active', 'Live fulfillment')
                : tr('commerce.my_gigs.queue_title_history', 'Closed deliveries')}
            </h2>
          </div>
          <span className="commerce-my-gigs__queue-badge">{orders.length}</span>
        </div>

        {loading ? <div className="commerce-my-gigs__loading">{tr('commerce.my_gigs.loading', 'Loading gigs...')}</div> : null}

        {!loading && orders.length === 0 ? renderEmptyState() : null}

        {!loading
          ? orders.map((order) => (
              <button
                key={order.id}
                type="button"
                className="commerce-my-gigs__card"
                onClick={() => setActiveOrder(order)}
              >
                <div className="commerce-my-gigs__card-head">
                  <div className="commerce-my-gigs__badges">
                    <span
                      className="commerce-my-gigs__type-badge"
                      style={{
                        background: `${typeColor[order.type]}18`,
                        color: typeColor[order.type],
                      }}
                    >
                      {typeText[order.type]}
                    </span>
                    <span
                      className="commerce-my-gigs__status-badge"
                      style={{
                        background: `${statusColor[order.status]}18`,
                        color: statusColor[order.status],
                      }}
                    >
                      {statusText[order.status]}
                    </span>
                  </div>
                  <div className="commerce-my-gigs__price">{formatMoney(order.price)}</div>
                </div>

                <div className="commerce-my-gigs__card-title">{order.title}</div>
                <div className="commerce-my-gigs__card-subtitle">{order.subTitle}</div>

                <div className="commerce-my-gigs__tag-list">
                  {order.tags.map((tag) => (
                    <span key={`${order.id}-${tag}`} className="commerce-my-gigs__tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="commerce-my-gigs__meta-row">
                  <span>
                    {tr('commerce.my_gigs.updated_at', 'Updated')} {formatDateTime(order.updatedAt)}
                  </span>
                  <span>{order.location}</span>
                </div>

                <div className="commerce-my-gigs__card-cta">
                  {order.status === 'taken'
                    ? tr('commerce.my_gigs.submit_delivery', 'Submit delivery')
                    : order.status === 'submitted'
                      ? tr('commerce.my_gigs.confirm_settle', 'Confirm & settle')
                      : tr('commerce.my_gigs.card_view_detail', 'Open workspace')}
                </div>
              </button>
            ))
          : null}
      </section>

      <Popup visible={!!activeOrder} onClose={() => setActiveOrder(null)} position="bottom" round>
        {activeOrder ? (
          <div className="commerce-my-gigs__sheet">
            <div className="commerce-my-gigs__sheet-header">
              <div>
                <div className="commerce-my-gigs__sheet-kicker">
                  {tr('commerce.my_gigs.sheet_kicker', 'Gig command')}
                </div>
                <div className="commerce-my-gigs__sheet-title">{activeOrder.title}</div>
              </div>
              <button
                type="button"
                className="commerce-my-gigs__sheet-close"
                onClick={() => setActiveOrder(null)}
                aria-label={tr('common.close', 'Close')}
              >
                ×
              </button>
            </div>

            <p className="commerce-my-gigs__sheet-subtitle">{activeOrder.subTitle}</p>

            <div className="commerce-my-gigs__sheet-summary">
              <div className="commerce-my-gigs__sheet-stat">
                <span>{tr('commerce.my_gigs.order_status', 'Order status')}</span>
                <strong style={{ color: statusColor[activeOrder.status] }}>{statusText[activeOrder.status]}</strong>
              </div>
              <div className="commerce-my-gigs__sheet-stat">
                <span>{tr('commerce.my_gigs.order_amount', 'Order amount')}</span>
                <strong>{formatMoney(activeOrder.price)}</strong>
              </div>
              <div className="commerce-my-gigs__sheet-stat">
                <span>{tr('commerce.my_gigs.created_at', 'Created at')}</span>
                <strong>{formatDateTime(activeOrder.createdAt)}</strong>
              </div>
              <div className="commerce-my-gigs__sheet-stat">
                <span>{tr('commerce.my_gigs.sheet_updated_label', 'Last update')}</span>
                <strong>{formatDateTime(activeOrder.updatedAt)}</strong>
              </div>
            </div>

            {activeOrder.requirements ? (
              <div className="commerce-my-gigs__sheet-block">
                <div className="commerce-my-gigs__sheet-block-label">
                  {tr('commerce.my_gigs.sheet_requirements_label', 'Requirements')}
                </div>
                <div className="commerce-my-gigs__sheet-block-copy">{activeOrder.requirements}</div>
              </div>
            ) : null}

            {activeOrder.deliverableUrl ? (
              <div className="commerce-my-gigs__sheet-block">
                <div className="commerce-my-gigs__sheet-block-label">
                  {tr('commerce.my_gigs.sheet_deliverable_label', 'Latest delivery')}
                </div>
                <div className="commerce-my-gigs__sheet-block-copy">{activeOrder.deliverableUrl}</div>
              </div>
            ) : null}

            <div className="commerce-my-gigs__sheet-actions">
              {activeOrder.status === 'taken' ? (
                <>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => {
                      Toast.info(tr('commerce.my_gigs.employer_contacted', 'Employer contacted'));
                    }}
                  >
                    {tr('commerce.my_gigs.contact_employer', 'Contact Employer')}
                  </Button>
                  <Button fullWidth loading={submitting} onClick={() => submitWork(activeOrder)}>
                    {tr('commerce.my_gigs.submit_delivery', 'Submit Delivery')}
                  </Button>
                </>
              ) : null}

              {activeOrder.status === 'submitted' ? (
                <Button fullWidth loading={submitting} onClick={() => completeOrder(activeOrder)}>
                  {tr('commerce.my_gigs.confirm_settle', 'Confirm & Settle')}
                </Button>
              ) : null}

              {activeOrder.status === 'completed' ? (
                <Button fullWidth variant="outline" onClick={() => setActiveOrder(null)}>
                  {tr('common.close', 'Close')}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Popup>
    </PageScaffold>
  );
};

export default MyGigsPage;
