import React from 'react';
import { Button, Icon, Toast } from '@sdkwork/react-mobile-commons';
import { EmptyState, PageScaffold, SectionCard, SegmentTabs } from '../components';
import { gigService, type GigFilter, type GigOrder } from '../services/GigService';

interface GigCenterPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onGigClick?: (gigId: string) => void;
}

const typeColor: Record<GigOrder['type'], string> = {
  design: '#7928ca',
  video_edit: '#ff0080',
  delivery: '#07c160',
  ride: '#2979ff',
  clean: '#ff9a44',
};

export const GigCenterPage: React.FC<GigCenterPageProps> = ({ t, onBack, onGigClick }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const filterTabs = React.useMemo(
    () => [
      { id: 'all', label: tr('commerce.gig_center.tabs.all', '全部') },
      { id: 'creative', label: tr('commerce.gig_center.tabs.creative', '创意任务') },
      { id: 'delivery', label: tr('commerce.gig_center.tabs.delivery', '跑腿配送') },
      { id: 'ride', label: tr('commerce.gig_center.tabs.ride', '顺风出行') },
      { id: 'clean', label: tr('commerce.gig_center.tabs.clean', '到家服务') },
    ],
    [t]
  );

  const typeLabel = React.useMemo<Record<GigOrder['type'], string>>(
    () => ({
      design: tr('commerce.gig_center.type.design', '设计'),
      video_edit: tr('commerce.gig_center.type.video_edit', '视频'),
      delivery: tr('commerce.gig_center.type.delivery', '配送'),
      ride: tr('commerce.gig_center.type.ride', '顺风'),
      clean: tr('commerce.gig_center.type.clean', '保洁'),
    }),
    [t]
  );

  const [filter, setFilter] = React.useState<GigFilter>('all');
  const [orders, setOrders] = React.useState<GigOrder[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [submittingId, setSubmittingId] = React.useState('');
  const [earnings, setEarnings] = React.useState({ today: 0, total: 0 });
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [orderResult, earningResult] = await Promise.all([
      gigService.getAvailableOrders(filter),
      gigService.getEarnings(),
    ]);
    if (orderResult.success && orderResult.data) setOrders(orderResult.data);
    setEarnings(earningResult);
    setLoading(false);
  }, [filter]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    const target = listRef.current;
    if (!target) return;
    void gigService.getGigCenterScrollOffset().then((offset) => {
      if (!offset) return;
      requestAnimationFrame(() => {
        target.scrollTo({ top: offset });
      });
    });
  }, []);

  const takeOrder = async (order: GigOrder) => {
    setSubmittingId(order.id);
    const result = await gigService.takeOrder(order.id);
    setSubmittingId('');
    if (!result.success) {
      Toast.error(result.message || tr('commerce.gig_center.take_failed', '抢单失败'));
      return;
    }
    Toast.success(
      order.type === 'design' || order.type === 'video_edit'
        ? tr('commerce.gig_center.take_creative_success', '接单成功，前往创作交付')
        : tr('commerce.gig_center.take_success', '抢单成功')
    );
    await load();
    onGigClick?.(order.id);
  };

  return (
    <PageScaffold title={tr('commerce.gig_center.title', '接单中心')} onBack={onBack}>
      <SectionCard
        style={{
          background: 'linear-gradient(135deg, #131f3f 0%, #253f73 100%)',
          border: 'none',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ opacity: 0.84, fontSize: '12px' }}>{tr('commerce.gig_center.today_income', '今日预估收入')}</div>
            <div style={{ marginTop: '4px', fontSize: '31px', fontWeight: 800 }}>¥{earnings.today.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ opacity: 0.84, fontSize: '12px' }}>{tr('commerce.gig_center.total_income', '累计收入')}</div>
            <div style={{ marginTop: '4px', fontSize: '22px', fontWeight: 700 }}>¥{earnings.total.toFixed(2)}</div>
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#07c160',
                  boxShadow: '0 0 8px #07c160',
                }}
              />
              <span style={{ fontSize: '12px' }}>{tr('commerce.gig_center.listening', '听单中')}</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SegmentTabs value={filter} options={filterTabs} onChange={(id) => setFilter(id as GigFilter)} />
      </SectionCard>

      <div
        ref={listRef}
        onScroll={(event) => {
          const target = event.currentTarget;
          void gigService.setGigCenterScrollOffset(target.scrollTop);
        }}
        style={{ maxHeight: '58vh', overflowY: 'auto', paddingRight: '2px' }}
      >
        {loading ? (
          <SectionCard>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {tr('commerce.gig_center.loading', '正在加载订单...')}
            </div>
          </SectionCard>
        ) : null}

        {!loading && orders.length === 0 ? (
          <EmptyState icon="gig" title={tr('commerce.gig_center.empty', '附近暂无新任务')} />
        ) : null}

        {orders.map((order) => (
          <SectionCard
            key={order.id}
            style={{
              borderColor:
                order.type === 'design' || order.type === 'video_edit'
                  ? 'rgba(121, 40, 202, 0.28)'
                  : order.urgency === 'high'
                    ? 'rgba(250, 81, 81, 0.35)'
                    : 'var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      borderRadius: '999px',
                      padding: '2px 8px',
                      background: `${typeColor[order.type]}20`,
                      color: typeColor[order.type],
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {typeLabel[order.type]}
                  </span>
                  {order.urgency === 'high' ? (
                    <span
                      style={{
                        borderRadius: '999px',
                        padding: '2px 8px',
                        background: 'rgba(250, 81, 81, 0.16)',
                        color: '#fa5151',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {tr('commerce.gig_center.urgent', '急单')}
                    </span>
                  ) : null}
                </div>
                <div style={{ marginTop: '8px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700 }}>
                  {order.title}
                </div>
                <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>{order.subTitle}</div>

                <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {order.tags.map((tag) => (
                    <span
                      key={`${order.id}-${tag}`}
                      style={{
                        borderRadius: '999px',
                        padding: '3px 8px',
                        background: 'var(--bg-cell-active)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  <Icon name="location" size={14} color="var(--text-secondary)" />
                  <span>{order.location}</span>
                  {order.destination ? <span>→ {order.destination}</span> : null}
                  {order.distance > 0 ? (
                    <span>· {order.distance.toFixed(1)}km</span>
                  ) : (
                    <span>· {tr('commerce.gig_center.online_task', '线上任务')}</span>
                  )}
                </div>
              </div>

              <div style={{ width: '110px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ color: '#fa5151', fontSize: '23px', fontWeight: 800 }}>¥{order.price}</div>
                <Button
                  size="sm"
                  loading={submittingId === order.id}
                  onClick={() => takeOrder(order)}
                >
                  {order.type === 'design' || order.type === 'video_edit'
                    ? tr('commerce.gig_center.take_creative', '接单创作')
                    : tr('commerce.gig_center.take', '抢单')}
                </Button>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </PageScaffold>
  );
};

export default GigCenterPage;
