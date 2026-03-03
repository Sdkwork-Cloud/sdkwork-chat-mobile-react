import React, { useMemo } from 'react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import {
  CreditCard,
  Smartphone,
  TrendingUp,
  Zap,
  Coins,
  Building2,
  ShoppingBag,
  Heart,
  MoreVertical,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface WalletPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onServiceClick?: (service: string) => void;
  onMoreClick?: () => void;
}

const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  onClick?: () => void;
  primary?: boolean;
}> = ({ icon, label, subLabel, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl transition-transform active:scale-95 ${
      primary
        ? 'bg-white/15 border border-white/10'
        : 'bg-white/5 border border-white/5'
    }`}
  >
    <div className="text-white text-2xl mb-2">{icon}</div>
    <div className="text-white font-semibold text-sm">{label}</div>
    {subLabel && <div className="text-white/70 text-xs mt-0.5">{subLabel}</div>}
  </button>
);

export const WalletPage: React.FC<WalletPageProps> = ({ t, onBack, onServiceClick, onMoreClick }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { walletData, transactions, showBalance, toggleBalance } = useWallet();

  const balance = walletData?.balance || 0;
  const dailyIncome = walletData?.dailyIncome || 0;

  const gridItems = useMemo(
    () => [
      { label: tr('wallet.services.credit_card', '信用卡还款'), icon: <CreditCard className="w-6 h-6" />, key: 'credit_card' },
      { label: tr('wallet.services.top_up', '手机充值'), icon: <Smartphone className="w-6 h-6" />, key: 'top_up' },
      { label: tr('wallet.services.wealth', '理财通'), icon: <TrendingUp className="w-6 h-6" />, key: 'wealth' },
      { label: tr('wallet.services.utilities', '生活缴费'), icon: <Zap className="w-6 h-6" />, key: 'utilities' },
      { label: tr('wallet.services.qb', 'Q币充值'), icon: <Coins className="w-6 h-6" />, key: 'qb' },
      { label: tr('wallet.services.city', '城市服务'), icon: <Building2 className="w-6 h-6" />, key: 'city' },
      { label: tr('wallet.services.orders', '我的订单'), icon: <ShoppingBag className="w-6 h-6" />, key: 'orders' },
      { label: tr('wallet.services.charity', '公益'), icon: <Heart className="w-6 h-6" />, key: 'charity' },
    ],
    [t]
  );

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar
        title={tr('wallet.title', '支付服务')}
        onBack={onBack}
        rightElement={(
          <button onClick={onMoreClick} className="text-[var(--text-primary)] p-1" aria-label={tr('common.more', '更多')}>
            <MoreVertical className="w-5 h-5" />
          </button>
        )}
      />

      {/* Header */}
      <div
        className="relative overflow-hidden pb-6"
        style={{
          background: 'linear-gradient(160deg, #004d40 0%, #00695c 40%, #004d40 100%)',
        }}
      >
        {/* Background Decor */}
        <div
          className="absolute -top-20 -right-10 w-72 h-72 rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}
        />

        <div className="px-4 pt-4">
          {/* Quick Actions */}
          <div className="flex gap-3 mb-6">
            <QuickAction
              icon={<span className="text-2xl">💳</span>}
              label={tr('wallet.pay', '收付款')}
              subLabel={tr('wallet.pay_desc', '向商家付款')}
              primary
              onClick={() => onServiceClick?.('pay')}
            />
            <QuickAction
              icon={<span className="text-2xl">👛</span>}
              label={tr('wallet.balance', '钱包')}
              subLabel={showBalance ? `¥${Math.floor(balance).toLocaleString()}` : '***'}
              onClick={toggleBalance}
            />
          </div>

          {/* Balance Strip */}
          <div className="flex items-center justify-between text-white/90 px-1">
            <button onClick={toggleBalance} className="flex items-center gap-2">
              <span className="text-sm opacity-80">{tr('wallet.balance_title', '总资产')}</span>
              {showBalance ? (
                <span className="text-xl font-semibold">¥{formatAmount(balance)}</span>
              ) : (
                <span className="text-xl font-semibold tracking-widest">****</span>
              )}
              {showBalance ? (
                <Eye className="w-4 h-4 opacity-60" />
              ) : (
                <EyeOff className="w-4 h-4 opacity-60" />
              )}
            </button>
            <div className="text-sm opacity-80">
              {tr('wallet.income_yesterday', '昨日收益')} <span className="font-semibold">+{dailyIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 py-3 space-y-3">
        {/* Services Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
            {tr('wallet.services_title', '金融理财与生活服务')}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {gridItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onServiceClick?.(item.key)}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-gray-600 dark:text-gray-300">{item.icon}</div>
                <span className="text-xs text-gray-700 dark:text-gray-300">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{tr('wallet.bill', '账单')}</span>
          </div>
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mr-3 ${
                  tx.type === 'income'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                    : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                }`}
              >
                {tx.type === 'income' ? '↙' : '↗'}
              </div>
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white font-medium">{tx.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(tx.createTime).toLocaleDateString()} · {tx.category}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-base font-semibold ${
                    tx.type === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">{tr('wallet.transaction_success', '成功')}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-gray-400 text-xs py-4">
          {tr('wallet.provider_support', '本服务由 Omni Pay 提供支持')}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
