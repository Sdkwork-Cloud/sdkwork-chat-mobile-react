import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Crown, Gift, Sparkles, TimerReset } from 'lucide-react';
import { Page, Skeleton, Toast } from '@sdkwork/react-mobile-commons';
import { vipService, type MobileVipOverview, type MobileVipPlan } from '../services/vipService';

interface VipPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

function formatCurrency(value: number): string {
  return `￥${value.toFixed(2)}`;
}

function formatDuration(days: number): string {
  if (days <= 0) {
    return 'Forever';
  }
  if (days % 365 === 0) {
    return `${days / 365} Year`;
  }
  if (days % 30 === 0) {
    return `${days / 30} Month`;
  }
  return `${days} Days`;
}

function formatExpireTime(value?: string): string {
  if (!value) {
    return '--';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
}

function resolveLevel(status: MobileVipOverview['status']): string {
  const level = Number(status?.vipLevel);
  if (!Number.isFinite(level) || level <= 0) {
    return 'Free';
  }
  return `VIP ${level}`;
}

export const VipPage: React.FC<VipPageProps> = ({ t, onBack }) => {
  const [overview, setOverview] = useState<MobileVipOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [purchasingPlanId, setPurchasingPlanId] = useState<number | null>(null);

  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) {
        return value;
      }
      return fallback;
    },
    [t],
  );

  const loadOverview = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await vipService.getOverview();
      setOverview(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : tr('vip.load_failed', 'Failed to load VIP data');
      Toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tr]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const handlePurchase = async (plan: MobileVipPlan) => {
    setPurchasingPlanId(plan.id);
    try {
      const purchase = await vipService.purchase(plan.id);
      Toast.success(
        tr('vip.purchase_success', 'Purchase success') +
          (purchase?.orderId ? ` · #${purchase.orderId}` : ''),
      );
      await loadOverview(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : tr('vip.purchase_failed', 'Purchase failed');
      Toast.error(message);
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const currentStatus = overview?.status || null;
  const levelName = useMemo(() => resolveLevel(currentStatus), [currentStatus]);

  return (
    <Page
      title={tr('vip.title', 'VIP Center')}
      onBack={onBack}
      background="var(--bg-body)"
      rightElement={(
        <button
          type="button"
          onClick={() => void loadOverview(true)}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '13px',
            padding: '0 8px',
            cursor: 'pointer',
          }}
        >
          {isRefreshing ? tr('common.loading', 'Loading') : tr('common.refresh', 'Refresh')}
        </button>
      )}
    >
      <div style={{ padding: '14px 12px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <section
          style={{
            borderRadius: '18px',
            padding: '16px',
            background:
              'linear-gradient(140deg, rgba(13,25,57,0.98) 0%, rgba(28,57,108,0.98) 45%, rgba(20,108,129,0.95) 100%)',
            border: '1px solid rgba(111, 167, 255, 0.28)',
            boxShadow: '0 12px 26px rgba(18, 36, 82, 0.35)',
            color: '#f8fbff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: 0.9 }}>
                <Crown size={16} />
                <span>{tr('vip.current_level', 'Current Level')}</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '6px', letterSpacing: '0.3px' }}>
                {levelName}
              </div>
              <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.85 }}>
                {tr('vip.expire_time', 'Expire')}: {formatExpireTime(currentStatus?.expireTime)}
              </div>
            </div>
            <div
              style={{
                minWidth: '96px',
                borderRadius: '14px',
                padding: '10px 12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(6, 16, 38, 0.35)',
              }}
            >
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{tr('vip.points_balance', 'Points')}</div>
              <div style={{ marginTop: '4px', fontSize: '20px', fontWeight: 700 }}>
                {overview?.pointsBalance ?? 0}
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`vip-skeleton-${index}`} width="100%" height={144} style={{ borderRadius: '14px' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {(overview?.plans || []).map((plan) => (
              <article
                key={plan.id}
                style={{
                  borderRadius: '14px',
                  border: plan.recommended ? '1px solid rgba(250, 204, 21, 0.5)' : '1px solid var(--border-color)',
                  background: plan.recommended
                    ? 'linear-gradient(140deg, rgba(61, 37, 8, 0.96), rgba(88, 47, 9, 0.92))'
                    : 'var(--bg-card)',
                  padding: '14px',
                  boxShadow: plan.recommended ? '0 10px 20px rgba(107, 58, 9, 0.28)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: plan.recommended ? 'rgba(251, 191, 36, 0.22)' : 'rgba(14, 165, 233, 0.16)',
                          color: plan.recommended ? '#fcd34d' : '#38bdf8',
                        }}
                      >
                        {plan.recommended ? <Sparkles size={14} /> : <Gift size={14} />}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>{plan.name}</h3>
                      {plan.recommended ? (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#fef3c7',
                            border: '1px solid rgba(251, 191, 36, 0.5)',
                            borderRadius: '999px',
                            padding: '2px 7px',
                          }}
                        >
                          {tr('vip.recommended', 'HOT')}
                        </span>
                      ) : null}
                    </div>
                    <p style={{ margin: '7px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {plan.description || tr('vip.plan_default_desc', 'Unlock premium generation speed and priority tools.')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(plan.price)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <TimerReset size={11} style={{ display: 'inline-block', marginRight: '4px' }} />
                      {formatDuration(plan.durationDays)}
                    </div>
                    {plan.originalPrice ? (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                        {formatCurrency(plan.originalPrice)}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {plan.tags.slice(0, 3).map((tag) => (
                    <span
                      key={`${plan.id}-${tag}`}
                      style={{
                        fontSize: '11px',
                        borderRadius: '999px',
                        padding: '4px 8px',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-body)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {plan.points > 0 ? (
                    <span
                      style={{
                        fontSize: '11px',
                        borderRadius: '999px',
                        padding: '4px 8px',
                        color: '#fbbf24',
                        background: 'rgba(251, 191, 36, 0.12)',
                        border: '1px solid rgba(251, 191, 36, 0.35)',
                      }}
                    >
                      +{plan.points} {tr('vip.points_unit', 'points')}
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => void handlePurchase(plan)}
                  disabled={purchasingPlanId !== null}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    height: '38px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: purchasingPlanId !== null ? 'not-allowed' : 'pointer',
                    background: plan.recommended
                      ? 'linear-gradient(120deg, #f59e0b 0%, #fb7185 100%)'
                      : 'linear-gradient(120deg, #2563eb 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    opacity: purchasingPlanId !== null && purchasingPlanId !== plan.id ? 0.6 : 1,
                  }}
                >
                  {purchasingPlanId === plan.id
                    ? tr('vip.processing', 'Processing...')
                    : tr('vip.subscribe_now', 'Subscribe Now')}
                </button>
              </article>
            ))}

            {(overview?.plans || []).length === 0 ? (
              <div
                style={{
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                }}
              >
                {tr('vip.no_plan', 'No VIP plan available yet.')}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Page>
  );
};

export default VipPage;
