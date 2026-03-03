import React from 'react';
import { EmptyState, PageScaffold, SectionCard, SegmentTabs } from '../components';
import { distributionService, type CommissionRecord } from '../services/DistributionService';
import { formatDateTime, formatRelativeTime } from './helpers';

interface CommissionPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

const statusColor: Record<CommissionRecord['status'], string> = {
  pending: '#faad14',
  processing: '#2979ff',
  success: '#07c160',
  settled: '#07c160',
};

const TrendChart: React.FC<{ labels: string[]; values: number[] }> = ({ labels, values }) => {
  const max = Math.max(...values, 1);
  const width = 320;
  const height = 130;
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - (value / max) * (height - 14) - 7;
    return { x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '130px' }}>
        <defs>
          <linearGradient id="commissionTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(41,121,255,0.35)" />
            <stop offset="100%" stopColor="rgba(41,121,255,0.02)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#commissionTrendGradient)" />
        <path d={linePath} fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeLinecap="round" />
        {points.map((point, idx) => (
          <circle key={labels[idx]} cx={point.x} cy={point.y} r="3.2" fill="var(--primary-color)" />
        ))}
      </svg>
      <div style={{ marginTop: '2px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '11px' }}>
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
};

export const CommissionPage: React.FC<CommissionPageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const tabOptions = React.useMemo(
    () => [
      { id: 'income', label: tr('commerce.commission.tabs.income', '收益明细') },
      { id: 'withdraw', label: tr('commerce.commission.tabs.withdraw', '提现记录') },
    ],
    [t]
  );

  const statusText = React.useMemo<Record<CommissionRecord['status'], string>>(
    () => ({
      pending: tr('commerce.commission.status.pending', '待结算'),
      processing: tr('commerce.commission.status.processing', '处理中'),
      success: tr('commerce.commission.status.success', '已到账'),
      settled: tr('commerce.commission.status.settled', '已结算'),
    }),
    [t]
  );

  const [tab, setTab] = React.useState('income');
  const [records, setRecords] = React.useState<CommissionRecord[]>([]);
  const [weekly, setWeekly] = React.useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });

  React.useEffect(() => {
    const load = async () => {
      const [recordResult, weeklyResult] = await Promise.all([
        distributionService.getCommissionRecords(tab === 'withdraw' ? 'withdraw' : 'income'),
        distributionService.getWeeklyEarnings(),
      ]);
      if (recordResult.success && recordResult.data) setRecords(recordResult.data);
      if (weeklyResult.success && weeklyResult.data) setWeekly(weeklyResult.data);
    };
    void load();
  }, [tab]);

  const totals = React.useMemo(() => {
    const income = records.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
    const withdraw = records.filter((item) => item.amount < 0).reduce((sum, item) => sum + Math.abs(item.amount), 0);
    const pending = records
      .filter((item) => item.amount > 0 && (item.status === 'pending' || item.status === 'processing'))
      .reduce((sum, item) => sum + item.amount, 0);
    return { income, withdraw, pending };
  }, [records]);

  return (
    <PageScaffold title={tr('commerce.commission.title', '资金明细')} onBack={onBack}>
      <SectionCard>
        <SegmentTabs value={tab} options={tabOptions} onChange={setTab} />
      </SectionCard>

      {tab === 'income' ? (
        <SectionCard>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {tr('commerce.commission.summary_income', '近7日收益')}
              </div>
              <div style={{ marginTop: '4px', fontSize: '18px', fontWeight: 700 }}>¥{totals.income.toFixed(0)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {tr('commerce.commission.summary_pending', '待结算')}
              </div>
              <div style={{ marginTop: '4px', fontSize: '18px', fontWeight: 700 }}>¥{totals.pending.toFixed(0)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {tr('commerce.commission.summary_withdrawn', '已提现')}
              </div>
              <div style={{ marginTop: '4px', fontSize: '18px', fontWeight: 700 }}>¥{totals.withdraw.toFixed(0)}</div>
            </div>
          </div>
          {weekly.labels.length && weekly.data.length ? (
            <div style={{ marginTop: '12px' }}>
              <TrendChart labels={weekly.labels} values={weekly.data} />
            </div>
          ) : null}
        </SectionCard>
      ) : null}

      {records.length === 0 ? (
        <EmptyState icon="bill" title={tr('commerce.commission.empty', '暂无资金记录')} />
      ) : null}

      {records.map((item) => {
        const positive = item.amount >= 0;
        return (
          <SectionCard key={item.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>{item.productName}</div>
                <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {item.sourceUser} · {formatDateTime(item.createdAt)} ({formatRelativeTime(item.createdAt)})
                </div>
              </div>
              <div style={{ marginLeft: '8px', textAlign: 'right' }}>
                <div style={{ color: positive ? '#07c160' : '#fa5151', fontWeight: 700, fontSize: '18px' }}>
                  {positive ? '+' : '-'}¥{Math.abs(item.amount).toFixed(2)}
                </div>
                <div style={{ marginTop: '3px', color: statusColor[item.status], fontSize: '12px', fontWeight: 600 }}>
                  {statusText[item.status]}
                </div>
              </div>
            </div>
          </SectionCard>
        );
      })}
    </PageScaffold>
  );
};

export default CommissionPage;
