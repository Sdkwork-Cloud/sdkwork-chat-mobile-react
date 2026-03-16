import React from 'react';
import { Button, Icon, Toast } from '@sdkwork/react-mobile-commons';
import { PageScaffold, SegmentTabs } from '../components';
import { gigService, type GigFilter, type GigOrder } from '../services/GigService';
import './GigCenterPage.css';

interface GigCenterPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onGigClick?: (gigId: string) => void;
}

interface GigEmptyStateConfig {
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

type GigCenterPrimaryTab = 'hall' | 'my';
type MyOrderView = 'active' | 'history';

const typeColor: Record<GigOrder['type'], string> = {
  design: '#7928ca',
  video_edit: '#ff0080',
  delivery: '#07c160',
  ride: '#2979ff',
  clean: '#ff9a44',
};

const statusColor: Record<GigOrder['status'], string> = {
  available: 'var(--text-secondary)',
  taken: 'var(--primary-color)',
  submitted: '#faad14',
  completed: '#07c160',
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatCountLabel = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const formatMoney = (amount: number) => `\u00A5${amount.toFixed(2)}`;

export const GigCenterPage: React.FC<GigCenterPageProps> = ({ t, onBack, onGigClick }) => {
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key) ?? key;
      return value === key ? fallback : value;
    },
    [t]
  );

  const primaryTabs = React.useMemo(
    () => [
      { id: 'hall', label: tr('commerce.gig_center.primary_tabs.hall', 'Hall') },
      { id: 'my', label: tr('commerce.gig_center.primary_tabs.my', 'My gigs') },
    ],
    [tr]
  );

  const filterTabs = React.useMemo(
    () => [
      { id: 'all', label: tr('commerce.gig_center.tabs.all', 'All') },
      { id: 'creative', label: tr('commerce.gig_center.tabs.creative', 'Creative') },
      { id: 'delivery', label: tr('commerce.gig_center.tabs.delivery', 'Delivery') },
      { id: 'ride', label: tr('commerce.gig_center.tabs.ride', 'Ride') },
      { id: 'clean', label: tr('commerce.gig_center.tabs.clean', 'Home service') },
    ],
    [tr]
  );

  const myTabs = React.useMemo(
    () => [
      { id: 'active', label: tr('commerce.gig_center.my_tabs.active', 'Active') },
      { id: 'history', label: tr('commerce.gig_center.my_tabs.history', 'History') },
    ],
    [tr]
  );

  const typeLabel = React.useMemo<Record<GigOrder['type'], string>>(
    () => ({
      design: tr('commerce.gig_center.type.design', 'Design'),
      video_edit: tr('commerce.gig_center.type.video_edit', 'Video'),
      delivery: tr('commerce.gig_center.type.delivery', 'Delivery'),
      ride: tr('commerce.gig_center.type.ride', 'Ride'),
      clean: tr('commerce.gig_center.type.clean', 'Cleaning'),
    }),
    [tr]
  );

  const statusLabel = React.useMemo<Record<GigOrder['status'], string>>(
    () => ({
      available: tr('commerce.gig_center.status.available', 'Available'),
      taken: tr('commerce.gig_center.status.taken', 'In progress'),
      submitted: tr('commerce.gig_center.status.submitted', 'Pending payout'),
      completed: tr('commerce.gig_center.status.completed', 'Completed'),
    }),
    [tr]
  );

  const [activePrimaryTab, setActivePrimaryTab] = React.useState<GigCenterPrimaryTab>('hall');
  const [filter, setFilter] = React.useState<GigFilter>('all');
  const [myOrderView, setMyOrderView] = React.useState<MyOrderView>('active');
  const [hallOrders, setHallOrders] = React.useState<GigOrder[]>([]);
  const [myOrders, setMyOrders] = React.useState<GigOrder[]>([]);
  const [mySummary, setMySummary] = React.useState({ active: 0, history: 0 });
  const [hallLoading, setHallLoading] = React.useState(false);
  const [myLoading, setMyLoading] = React.useState(false);
  const [takingOrderId, setTakingOrderId] = React.useState('');
  const [processingOrderId, setProcessingOrderId] = React.useState('');
  const [earnings, setEarnings] = React.useState({ today: 0, total: 0 });
  const hallListRef = React.useRef<HTMLDivElement | null>(null);

  const loadHall = React.useCallback(async () => {
    setHallLoading(true);
    const [orderResult, earningResult] = await Promise.all([
      gigService.getAvailableOrders(filter),
      gigService.getEarnings(),
    ]);

    if (orderResult.success && orderResult.data) {
      setHallOrders(orderResult.data);
    }
    setEarnings(earningResult);
    setHallLoading(false);
  }, [filter]);

  const loadMyOrders = React.useCallback(async () => {
    setMyLoading(true);
    const [currentResult, activeResult, historyResult] = await Promise.all([
      gigService.getMyOrders(myOrderView),
      gigService.getMyOrders('active'),
      gigService.getMyOrders('history'),
    ]);

    if (currentResult.success && currentResult.data) {
      setMyOrders(currentResult.data);
    }

    setMySummary({
      active: activeResult.success && activeResult.data ? activeResult.data.length : 0,
      history: historyResult.success && historyResult.data ? historyResult.data.length : 0,
    });
    setMyLoading(false);
  }, [myOrderView]);

  React.useEffect(() => {
    void loadHall();
  }, [loadHall]);

  React.useEffect(() => {
    void loadMyOrders();
  }, [loadMyOrders]);

  React.useEffect(() => {
    if (activePrimaryTab !== 'hall') return;
    const target = hallListRef.current;
    if (!target) return;

    void gigService.getGigCenterScrollOffset().then((offset) => {
      if (!offset) return;
      requestAnimationFrame(() => {
        target.scrollTo({ top: offset });
      });
    });
  }, [activePrimaryTab]);

  const refreshBothPanels = React.useCallback(async () => {
    await Promise.all([loadHall(), loadMyOrders()]);
  }, [loadHall, loadMyOrders]);

  const takeOrder = async (order: GigOrder) => {
    setTakingOrderId(order.id);
    const result = await gigService.takeOrder(order.id);
    setTakingOrderId('');

    if (!result.success) {
      Toast.error(result.message || tr('commerce.gig_center.take_failed', 'Failed to accept order'));
      return;
    }

    Toast.success(
      order.type === 'design' || order.type === 'video_edit'
        ? tr('commerce.gig_center.take_creative_success', 'Order accepted. Start creating the delivery.')
        : tr('commerce.gig_center.take_success', 'Order accepted')
    );
    await refreshBothPanels();
    onGigClick?.(order.id);
  };

  const submitDelivery = async (order: GigOrder) => {
    setProcessingOrderId(order.id);
    const result = await gigService.submitWork(
      order.id,
      order.type === 'video_edit'
        ? 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=720'
        : 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=720',
      order.type === 'video_edit' ? 'video' : 'image'
    );
    setProcessingOrderId('');

    if (!result.success) {
      Toast.error(result.message || tr('commerce.gig_center.submit_failed', 'Failed to submit delivery'));
      return;
    }

    Toast.success(tr('commerce.gig_center.submit_success', 'Delivery submitted. Waiting for payout.'));
    await refreshBothPanels();
  };

  const settleOrder = async (order: GigOrder) => {
    setProcessingOrderId(order.id);
    const result = await gigService.completeOrder(order.id);
    setProcessingOrderId('');

    if (!result.success) {
      Toast.error(result.message || tr('commerce.gig_center.settle_failed', 'Failed to complete settlement'));
      return;
    }

    Toast.success(tr('commerce.gig_center.settle_success', 'Settlement completed'));
    await refreshBothPanels();
  };

  const urgentHallCount = hallOrders.filter((order) => order.urgency === 'high').length;
  const activeFilterLabel = filterTabs.find((item) => item.id === filter)?.label ?? tr('commerce.gig_center.tabs.all', 'All');

  const heroContext = React.useMemo(() => {
    if (activePrimaryTab === 'hall') {
      return {
        title: tr('commerce.gig_center.hero_hall_title', 'Take the best gigs first'),
        subtitle: tr('commerce.gig_center.hero_hall_subtitle', 'Use urgency, payout and distance to decide which work deserves your next slot.'),
        badge: formatCountLabel(hallOrders.length, 'live gig'),
      };
    }

    return {
      title: tr('commerce.gig_center.hero_my_title', 'Run delivery and payout from one queue'),
      subtitle: tr('commerce.gig_center.hero_my_subtitle', 'Track active work, submit deliverables and close completed orders without losing context.'),
      badge: formatCountLabel(mySummary.active, 'active order'),
    };
  }, [activePrimaryTab, hallOrders.length, mySummary.active, tr]);

  const workbenchMetrics = React.useMemo(
    () => [
      {
        label: tr('commerce.gig_center.workbench_hall', 'Hall'),
        value: formatCountLabel(hallOrders.length, 'gig'),
      },
      {
        label: tr('commerce.gig_center.workbench_urgent', 'Urgent'),
        value: formatCountLabel(urgentHallCount, 'priority gig'),
      },
      {
        label: tr('commerce.gig_center.workbench_active', 'Active'),
        value: formatCountLabel(mySummary.active, 'order'),
      },
      {
        label: tr('commerce.gig_center.workbench_income', 'Earned'),
        value: formatMoney(earnings.total),
      },
    ],
    [earnings.total, hallOrders.length, mySummary.active, tr, urgentHallCount]
  );

  const renderSectionHeading = (title: string, subtitle: string, badge: string) => (
    <div className="gig-center__section-heading">
      <div className="gig-center__section-kicker">{tr('commerce.gig_center.section_kicker', 'Gig workspace')}</div>
      <div className="gig-center__section-title-row">
        <h2 className="gig-center__section-title">{title}</h2>
        <span className="gig-center__section-badge">{badge}</span>
      </div>
      <p className="gig-center__section-subtitle">{subtitle}</p>
    </div>
  );

  const renderEmptyState = ({ title, description, primaryLabel, onPrimary, secondaryLabel, onSecondary }: GigEmptyStateConfig) => (
    <div className="gig-center__empty-state">
      <div className="gig-center__empty-icon">GC</div>
      <div className="gig-center__empty-title">{title}</div>
      <div className="gig-center__empty-copy">{description}</div>
      <div className="gig-center__empty-actions">
        <button type="button" className="gig-center__empty-button is-primary" onClick={onPrimary}>
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary ? (
          <button type="button" className="gig-center__empty-button" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );

  const renderHallOrderCard = (order: GigOrder) => (
    <div key={order.id} className="gig-center__order-card">
      <div className="gig-center__order-row">
        <div className="gig-center__order-main">
          <div className="gig-center__order-badges">
            <span
              className="gig-center__type-badge"
              style={{
                background: `${typeColor[order.type]}20`,
                color: typeColor[order.type],
              }}
            >
              {typeLabel[order.type]}
            </span>
            {order.urgency === 'high' ? (
              <span className="gig-center__urgent-badge">{tr('commerce.gig_center.urgent', 'Urgent')}</span>
            ) : null}
          </div>

          <div className="gig-center__order-title">{order.title}</div>
          <div className="gig-center__order-subtitle">{order.subTitle}</div>

          <div className="gig-center__tag-list">
            {order.tags.map((tag) => (
              <span key={`${order.id}-${tag}`} className="gig-center__tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="gig-center__order-meta">
            <Icon name="location" size={14} color="var(--text-secondary)" />
            <span>{order.location}</span>
            {order.destination ? <span>\u2192 {order.destination}</span> : null}
            {order.distance > 0 ? (
              <span>\u00B7 {order.distance.toFixed(1)}km</span>
            ) : (
              <span>\u00B7 {tr('commerce.gig_center.online_task', 'Online task')}</span>
            )}
          </div>
        </div>

        <div className="gig-center__order-action">
          <div className="gig-center__order-price">\u00A5{order.price}</div>
          <Button size="sm" loading={takingOrderId === order.id} onClick={() => takeOrder(order)}>
            {order.type === 'design' || order.type === 'video_edit'
              ? tr('commerce.gig_center.take_creative', 'Accept & create')
              : tr('commerce.gig_center.take', 'Accept')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMyOrderCard = (order: GigOrder) => (
    <div key={order.id} className="gig-center__order-card">
      <div className="gig-center__order-row">
        <div className="gig-center__order-main">
          <div className="gig-center__order-badges">
            <span
              className="gig-center__type-badge"
              style={{
                background: `${typeColor[order.type]}20`,
                color: typeColor[order.type],
              }}
            >
              {typeLabel[order.type]}
            </span>
            <span
              className="gig-center__status-badge"
              style={{
                background: `${statusColor[order.status]}20`,
                color: statusColor[order.status],
              }}
            >
              {statusLabel[order.status]}
            </span>
          </div>

          <div className="gig-center__order-title">{order.title}</div>
          <div className="gig-center__order-subtitle">{order.subTitle}</div>
          <div className="gig-center__my-meta">
            <span>
              {tr('commerce.gig_center.my_updated_at', 'Updated')} {formatDateTime(order.updatedAt)}
            </span>
          </div>
        </div>

        <div className="gig-center__order-action">
          <div className="gig-center__order-price">\u00A5{order.price}</div>
          {order.status === 'taken' ? (
            <Button
              size="sm"
              loading={processingOrderId === order.id}
              onClick={() => submitDelivery(order)}
            >
              {tr('commerce.gig_center.submit_delivery', 'Submit work')}
            </Button>
          ) : null}
          {order.status === 'submitted' ? (
            <Button
              size="sm"
              loading={processingOrderId === order.id}
              onClick={() => settleOrder(order)}
            >
              {tr('commerce.gig_center.confirm_settle', 'Complete payout')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderHallPanel = () => (
    <section className="gig-center__panel-shell">
      {renderSectionHeading(
        tr('commerce.gig_center.hall_title', 'Opportunity hall'),
        filter === 'all'
          ? tr('commerce.gig_center.hall_subtitle', 'Recommended gigs are sorted by payout, urgency and distance.')
          : tr('commerce.gig_center.hall_filtered_subtitle', `Focused on ${activeFilterLabel} gigs only.`),
        formatCountLabel(hallOrders.length, 'gig')
      )}

      <div className="gig-center__filter-shell">
        <SegmentTabs value={filter} options={filterTabs} onChange={(id) => setFilter(id as GigFilter)} />
      </div>

      <div
        className="gig-center__list"
        ref={hallListRef}
        onScroll={(event) => {
          void gigService.setGigCenterScrollOffset(event.currentTarget.scrollTop);
        }}
      >
        {hallLoading ? <div className="gig-center__loading-text">{tr('commerce.gig_center.loading', 'Loading gigs...')}</div> : null}

        {!hallLoading && hallOrders.length === 0
          ? renderEmptyState({
              title:
                filter === 'all'
                  ? tr('commerce.gig_center.empty', 'No live gigs right now')
                  : tr('commerce.gig_center.empty_filtered', 'No gigs match this filter'),
              description:
                filter === 'all'
                  ? tr('commerce.gig_center.empty_copy', 'Stay in listening mode and new work will land here when the market updates.')
                  : tr('commerce.gig_center.empty_filtered_copy', 'Reset the filter or switch tabs while new matching tasks arrive.'),
              primaryLabel:
                filter === 'all'
                  ? tr('commerce.gig_center.primary_tabs.my', 'My gigs')
                  : tr('commerce.gig_center.tabs.all', 'All'),
              onPrimary: filter === 'all' ? () => setActivePrimaryTab('my') : () => setFilter('all'),
              secondaryLabel:
                filter === 'all'
                  ? tr('commerce.gig_center.my_tabs.active', 'Active')
                  : tr('commerce.gig_center.primary_tabs.my', 'My gigs'),
              onSecondary:
                filter === 'all'
                  ? () => {
                      setActivePrimaryTab('my');
                      setMyOrderView('active');
                    }
                  : () => setActivePrimaryTab('my'),
            })
          : null}

        {!hallLoading ? hallOrders.map(renderHallOrderCard) : null}
      </div>
    </section>
  );

  const renderMyPanel = () => (
    <section className="gig-center__panel-shell">
      {renderSectionHeading(
        tr('commerce.gig_center.my_title', 'My delivery queue'),
        tr('commerce.gig_center.my_subtitle', 'Stay on top of active work, delivery and payout from one place.'),
        formatCountLabel(mySummary.active + mySummary.history, 'order')
      )}

      <div className="gig-center__my-summary">
        <div className="gig-center__summary-item">
          <div className="gig-center__summary-label">{tr('commerce.gig_center.my_summary.active', 'Active')}</div>
          <div className="gig-center__summary-value">{mySummary.active}</div>
        </div>
        <div className="gig-center__summary-item">
          <div className="gig-center__summary-label">{tr('commerce.gig_center.my_summary.completed', 'Completed')}</div>
          <div className="gig-center__summary-value">{mySummary.history}</div>
        </div>
        <div className="gig-center__summary-item">
          <div className="gig-center__summary-label">{tr('commerce.gig_center.my_summary.income', 'Total')}</div>
          <div className="gig-center__summary-value">\u00A5{earnings.total.toFixed(0)}</div>
        </div>
      </div>

      <div className="gig-center__filter-shell">
        <SegmentTabs
          value={myOrderView}
          options={myTabs}
          onChange={(id) => setMyOrderView(id as MyOrderView)}
        />
      </div>

      {myLoading ? <div className="gig-center__loading-text">{tr('commerce.gig_center.my_loading', 'Loading your gigs...')}</div> : null}

      {!myLoading && myOrders.length === 0
        ? renderEmptyState({
            title:
              myOrderView === 'active'
                ? tr('commerce.gig_center.my_empty_active', 'No active gigs yet')
                : tr('commerce.gig_center.my_empty_history', 'No completed gigs yet'),
            description:
              myOrderView === 'active'
                ? tr('commerce.gig_center.my_empty_active_copy', 'Accept work from the hall and it will move into your active queue here.')
                : tr('commerce.gig_center.my_empty_history_copy', 'Completed orders will appear here once your first payout is closed.'),
            primaryLabel: tr('commerce.gig_center.primary_tabs.hall', 'Hall'),
            onPrimary: () => setActivePrimaryTab('hall'),
            secondaryLabel:
              myOrderView === 'active'
                ? tr('commerce.gig_center.my_tabs.history', 'History')
                : tr('commerce.gig_center.my_tabs.active', 'Active'),
            onSecondary: () => setMyOrderView(myOrderView === 'active' ? 'history' : 'active'),
          })
        : null}

      {!myLoading ? myOrders.map(renderMyOrderCard) : null}
    </section>
  );

  return (
    <PageScaffold title={tr('commerce.gig_center.title', 'Gig Center')} onBack={onBack}>
      <section className="gig-center__hero">
        <div className="gig-center__hero-copy">
          <div className="gig-center__hero-kicker">{tr('commerce.gig_center.hero_kicker', 'Gig workbench')}</div>
          <div className="gig-center__hero-title-row">
            <h1 className="gig-center__hero-title">{heroContext.title}</h1>
            <span className="gig-center__hero-badge">{heroContext.badge}</span>
          </div>
          <p className="gig-center__hero-subtitle">{heroContext.subtitle}</p>
        </div>

        <div className="gig-center__hero-income">
          <div className="gig-center__hero-income-label">{tr('commerce.gig_center.today_income', 'Today')}</div>
          <div className="gig-center__hero-income-value">{formatMoney(earnings.today)}</div>
          <div className="gig-center__hero-income-meta">{tr('commerce.gig_center.total_income', 'Total')} {formatMoney(earnings.total)}</div>
          <div className="gig-center__listening">
            <span className="gig-center__status-dot" />
            <span>{tr('commerce.gig_center.listening', 'Listening')}</span>
          </div>
        </div>
      </section>

      <section className="gig-center__workbench">
        <div className="gig-center__workbench-grid">
          {workbenchMetrics.map((metric) => (
            <div key={metric.label} className="gig-center__workbench-card">
              <div className="gig-center__workbench-label">{metric.label}</div>
              <div className="gig-center__workbench-value">{metric.value}</div>
            </div>
          ))}
        </div>

        <div className="gig-center__workbench-actions">
          <button type="button" className="gig-center__workbench-action" onClick={() => setActivePrimaryTab('hall')}>
            {tr('commerce.gig_center.primary_tabs.hall', 'Hall')}
          </button>
          <button
            type="button"
            className="gig-center__workbench-action"
            onClick={() => {
              setActivePrimaryTab('my');
              setMyOrderView('active');
            }}
          >
            {tr('commerce.gig_center.my_tabs.active', 'Active')}
          </button>
          <button
            type="button"
            className="gig-center__workbench-action"
            onClick={() => {
              setActivePrimaryTab('my');
              setMyOrderView('history');
            }}
          >
            {tr('commerce.gig_center.my_tabs.history', 'History')}
          </button>
        </div>
      </section>

      <nav className="gig-center__tabbar" role="tablist" aria-label={tr('commerce.gig_center.tabs_label', 'Gig Center tabs')}>
        {primaryTabs.map((tab) => {
          const active = tab.id === activePrimaryTab;
          const badge = tab.id === 'hall' ? hallOrders.length : mySummary.active;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`gig-center__tabbar-item${active ? ' gig-center__tabbar-item--active' : ''}`}
              onClick={() => setActivePrimaryTab(tab.id as GigCenterPrimaryTab)}
            >
              {badge > 0 ? <span className="gig-center__tabbar-badge">{Math.min(badge, 9)}</span> : null}
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activePrimaryTab === 'hall' ? renderHallPanel() : null}
      {activePrimaryTab === 'my' ? renderMyPanel() : null}
    </PageScaffold>
  );
};

export default GigCenterPage;
