import React from 'react';
import { Button, Toast } from '@sdkwork/react-mobile-commons';
import { PageScaffold, SectionCard } from '../components';
import { distributionService, type DistributionOverview, type WithdrawMethod } from '../services/DistributionService';

interface WithdrawPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

export const WithdrawPage: React.FC<WithdrawPageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const [overview, setOverview] = React.useState<DistributionOverview | null>(null);
  const [method, setMethod] = React.useState<WithdrawMethod>('wechat');
  const [amount, setAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const withdrawMethods: { id: WithdrawMethod; label: string }[] = React.useMemo(
    () => [
      { id: 'wechat', label: tr('commerce.order.payment.wechat', '微信') },
      { id: 'alipay', label: tr('commerce.order.payment.alipay', '支付宝') },
      { id: 'bank', label: tr('commerce.withdraw.method_bank', '银行卡') },
    ],
    [t]
  );

  React.useEffect(() => {
    const load = async () => {
      const result = await distributionService.getOverview();
      if (result.success && result.data) setOverview(result.data);
    };
    void load();
  }, []);

  const numericAmount = Number(amount || 0);
  const available = overview?.withdrawableCommission || 0;
  const canSubmit = numericAmount > 0 && numericAmount <= available && !loading;

  const submitWithdraw = async () => {
    if (!numericAmount || numericAmount <= 0) {
      Toast.info(tr('commerce.withdraw.enter_amount', '请输入提现金额'));
      return;
    }
    if (numericAmount > available) {
      Toast.info(tr('commerce.withdraw.exceed_available', '提现金额超过可用余额'));
      return;
    }
    setLoading(true);
    const result = await distributionService.withdraw(numericAmount, method);
    setLoading(false);
    if (!result.success) {
      Toast.error(result.message || tr('commerce.withdraw.failed', '提现失败，请稍后重试'));
      return;
    }
    Toast.success(tr('commerce.withdraw.submitted', '提现申请已提交'));
    setAmount('');
    const overviewResult = await distributionService.getOverview();
    if (overviewResult.success && overviewResult.data) setOverview(overviewResult.data);
  };

  return (
    <PageScaffold title={tr('commerce.withdraw.title', '申请提现')} onBack={onBack}>
      <SectionCard>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{tr('commerce.withdraw.available_amount', '可提现金额')}</div>
        <div style={{ marginTop: '8px', color: 'var(--text-primary)', fontSize: '30px', fontWeight: 800 }}>
          ¥{available.toFixed(2)}
        </div>
      </SectionCard>

      <SectionCard>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px' }}>{tr('commerce.withdraw.method', '提现方式')}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {withdrawMethods.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={method === item.id ? 'primary' : 'outline'}
              onClick={() => setMethod(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px' }}>{tr('commerce.withdraw.amount', '提现金额')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 700 }}>¥</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
            placeholder="0.00"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '32px',
              fontWeight: 700,
              minWidth: 0,
            }}
          />
        </div>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{tr('commerce.withdraw.eta', '预计 1-3 个工作日到账')}</span>
          <button
            type="button"
            onClick={() => setAmount(available ? available.toFixed(2) : '')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--primary-color)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tr('commerce.withdraw.all', '全部提现')}
          </button>
        </div>
      </SectionCard>

      <Button fullWidth loading={loading} disabled={!canSubmit} onClick={submitWithdraw}>
        {tr('commerce.withdraw.submit', '提交提现')}
      </Button>
    </PageScaffold>
  );
};

export default WithdrawPage;
