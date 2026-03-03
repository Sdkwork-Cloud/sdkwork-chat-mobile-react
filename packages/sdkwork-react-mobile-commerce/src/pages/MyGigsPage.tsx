import React from 'react';
import { Button, Popup, Toast } from '@sdkwork/react-mobile-commons';
import { EmptyState, PageScaffold, SectionCard, SegmentTabs } from '../components';
import { gigService, type GigOrder } from '../services/GigService';
import { formatDateTime } from './helpers';

interface MyGigsPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

const statusColor: Record<GigOrder['status'], string> = {
  available: 'var(--text-secondary)',
  taken: 'var(--primary-color)',
  submitted: '#faad14',
  completed: '#07c160',
};

const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (full, key) => {
    const value = values[key];
    return value === undefined || value === null ? full : String(value);
  });

export const MyGigsPage: React.FC<MyGigsPageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const tabOptions = React.useMemo(
    () => [
      { id: 'active', label: tr('commerce.my_gigs.tabs.active', '进行中') },
      { id: 'history', label: tr('commerce.my_gigs.tabs.history', '历史记录') },
    ],
    [t]
  );

  const statusText = React.useMemo<Record<GigOrder['status'], string>>(
    () => ({
      available: tr('commerce.my_gigs.status.available', '待接单'),
      taken: tr('commerce.my_gigs.status.taken', '待交付'),
      submitted: tr('commerce.my_gigs.status.submitted', '待验收'),
      completed: tr('commerce.my_gigs.status.completed', '已完成'),
    }),
    [t]
  );

  const [tab, setTab] = React.useState<'active' | 'history'>('active');
  const [orders, setOrders] = React.useState<GigOrder[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeOrder, setActiveOrder] = React.useState<GigOrder | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const result = await gigService.getMyOrders(tab);
    if (result.success && result.data) setOrders(result.data);
    setLoading(false);
  }, [tab]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const submitWork = async (order: GigOrder) => {
    setSubmitting(true);
    const defaultType = order.type === 'video_edit' ? 'video' : 'image';
    const result = await gigService.submitWork(
      order.id,
      order.type === 'video_edit'
        ? 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=720'
        : 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=720',
      defaultType
    );
    setSubmitting(false);
    if (!result.success) {
      Toast.error(result.message || tr('commerce.my_gigs.submit_failed', '提交失败'));
      return;
    }
    Toast.success(tr('commerce.my_gigs.submit_success', '交付成功，等待验收'));
    setActiveOrder(null);
    await load();
  };

  const completeOrder = async (order: GigOrder) => {
    setSubmitting(true);
    const result = await gigService.completeOrder(order.id);
    setSubmitting(false);
    if (!result.success) {
      Toast.error(result.message || tr('commerce.my_gigs.settle_failed', '结算失败'));
      return;
    }
    Toast.success(
      fillTemplate(
        tr('commerce.my_gigs.settle_success', '结算成功 +¥{amount}'),
        { amount: order.price.toFixed(2) }
      )
    );
    setActiveOrder(null);
    await load();
  };

  return (
    <PageScaffold title={tr('commerce.my_gigs.title', '我的接单')} onBack={onBack}>
      <SectionCard>
        <SegmentTabs value={tab} options={tabOptions} onChange={(id) => setTab(id as 'active' | 'history')} />
      </SectionCard>

      {loading ? (
        <SectionCard>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {tr('commerce.my_gigs.loading', '正在加载订单...')}
          </div>
        </SectionCard>
      ) : null}

      {!loading && orders.length === 0 ? (
        <EmptyState
          icon="gig"
          title={
            tab === 'active'
              ? tr('commerce.my_gigs.empty_active', '暂无进行中任务')
              : tr('commerce.my_gigs.empty_history', '暂无历史任务')
          }
        />
      ) : null}

      {orders.map((order) => (
        <SectionCard key={order.id} onClick={() => setActiveOrder(order)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>{order.title}</div>
              <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>{order.subTitle}</div>
              <div style={{ marginTop: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                {tr('commerce.my_gigs.updated_at', '更新时间')} {formatDateTime(order.updatedAt)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fa5151', fontWeight: 700, fontSize: '18px' }}>¥{order.price.toFixed(0)}</div>
              <div style={{ marginTop: '3px', color: statusColor[order.status], fontSize: '12px', fontWeight: 600 }}>
                {statusText[order.status]}
              </div>
            </div>
          </div>
        </SectionCard>
      ))}

      <Popup
        visible={!!activeOrder}
        onClose={() => setActiveOrder(null)}
        position="bottom"
        round
        style={{ minHeight: '360px' }}
      >
        {activeOrder ? (
          <div style={{ padding: '18px 16px 20px 16px' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}>{activeOrder.title}</div>
            <div style={{ marginTop: '6px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
              {activeOrder.subTitle}
            </div>

            <div
              style={{
                marginTop: '14px',
                borderRadius: '12px',
                padding: '12px',
                background: 'var(--bg-body)',
                border: '0.5px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {tr('commerce.my_gigs.order_status', '订单状态')}
                </span>
                <span style={{ color: statusColor[activeOrder.status], fontWeight: 700 }}>
                  {statusText[activeOrder.status]}
                </span>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {tr('commerce.my_gigs.order_amount', '订单金额')}
                </span>
                <span style={{ color: '#fa5151', fontWeight: 700 }}>¥{activeOrder.price.toFixed(2)}</span>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {tr('commerce.my_gigs.created_at', '创建时间')}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{formatDateTime(activeOrder.createdAt)}</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              {activeOrder.status === 'taken' ? (
                <>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => {
                      Toast.info(tr('commerce.my_gigs.employer_contacted', '已联系需求方'));
                    }}
                  >
                    {tr('commerce.my_gigs.contact_employer', '联系雇主')}
                  </Button>
                  <Button
                    fullWidth
                    loading={submitting}
                    onClick={() => submitWork(activeOrder)}
                  >
                    {tr('commerce.my_gigs.submit_delivery', '提交交付')}
                  </Button>
                </>
              ) : null}

              {activeOrder.status === 'submitted' ? (
                <Button fullWidth loading={submitting} onClick={() => completeOrder(activeOrder)}>
                  {tr('commerce.my_gigs.confirm_settle', '确认验收并结算')}
                </Button>
              ) : null}

              {activeOrder.status === 'completed' ? (
                <Button fullWidth variant="outline" onClick={() => setActiveOrder(null)}>
                  {tr('common.close', '关闭')}
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
