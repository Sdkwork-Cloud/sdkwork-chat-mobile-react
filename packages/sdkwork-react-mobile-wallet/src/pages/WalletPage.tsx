import React, { useMemo } from 'react';
import { Navbar } from '@sdkwork/react-mobile-commons';
import {
  Building2,
  Coins,
  CreditCard,
  Eye,
  EyeOff,
  Heart,
  MoreVertical,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { useOptionalTranslation } from '@/src/core/i18n/I18nContext';
import { useWallet } from '../hooks/useWallet';

interface WalletPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onServiceClick?: (service: string) => void;
  onMoreClick?: () => void;
}

const interpolate = (message: string, params?: Record<string, string | number>) => {
  if (!params) {
    return message;
  }

  return Object.entries(params).reduce((output, [key, value]) => {
    return output
      .replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
      .replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }, message);
};

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
  const appI18n = useOptionalTranslation();
  const { walletData, transactions, showBalance, toggleBalance } = useWallet();

  const tr = React.useCallback(
    (key: string, fallback: string, params?: Record<string, string | number>) => {
      const appValue = appI18n?.t(key, params);
      if (appValue && appValue !== key) {
        return appValue;
      }

      const propValue = t?.(key);
      if (propValue && propValue !== key) {
        return interpolate(propValue, params);
      }

      return interpolate(fallback, params);
    },
    [appI18n, t]
  );

  const formatNumber = React.useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      if (appI18n) {
        return appI18n.formatNumber(value, options);
      }
      return value.toLocaleString(undefined, options);
    },
    [appI18n]
  );

  const formatDate = React.useCallback(
    (value: Date | number | string) => {
      if (appI18n) {
        return appI18n.formatDate(value);
      }
      return new Date(value).toLocaleDateString();
    },
    [appI18n]
  );

  const formatCurrency = React.useCallback(
    (amount: number) =>
      formatNumber(amount, {
        style: 'currency',
        currency: walletData?.currency || 'CNY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [formatNumber, walletData?.currency]
  );

  const balance = walletData?.balance || 0;
  const dailyIncome = walletData?.dailyIncome || 0;

  const gridItems = useMemo(
    () => [
      {
        label: tr('wallet.services.credit_card', 'Credit Card'),
        icon: <CreditCard className="w-6 h-6" />,
        key: 'credit_card',
      },
      {
        label: tr('wallet.services.top_up', 'Top Up'),
        icon: <Smartphone className="w-6 h-6" />,
        key: 'top_up',
      },
      {
        label: tr('wallet.services.wealth', 'Wealth'),
        icon: <TrendingUp className="w-6 h-6" />,
        key: 'wealth',
      },
      {
        label: tr('wallet.services.utilities', 'Utilities'),
        icon: <Zap className="w-6 h-6" />,
        key: 'utilities',
      },
      {
        label: tr('wallet.services.qb', 'Q Coins'),
        icon: <Coins className="w-6 h-6" />,
        key: 'qb',
      },
      {
        label: tr('wallet.services.city', 'City Services'),
        icon: <Building2 className="w-6 h-6" />,
        key: 'city',
      },
      {
        label: tr('wallet.services.orders', 'Orders'),
        icon: <ShoppingBag className="w-6 h-6" />,
        key: 'orders',
      },
      {
        label: tr('wallet.services.charity', 'Charity'),
        icon: <Heart className="w-6 h-6" />,
        key: 'charity',
      },
    ],
    [tr]
  );

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar
        title={tr('wallet.title', 'Wallet')}
        onBack={onBack}
        rightElement={(
          <button
            onClick={onMoreClick}
            className="text-[var(--text-primary)] p-1"
            aria-label={tr('common.more', 'More')}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        )}
      />

      <div
        className="relative overflow-hidden pb-6"
        style={{
          background: 'linear-gradient(160deg, #004d40 0%, #00695c 40%, #004d40 100%)',
        }}
      >
        <div
          className="absolute -top-20 -right-10 w-72 h-72 rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}
        />

        <div className="px-4 pt-4">
          <div className="flex gap-3 mb-6">
            <QuickAction
              icon={<CreditCard className="w-7 h-7" />}
              label={tr('wallet.pay', 'Pay')}
              subLabel={tr('wallet.pay_desc', 'Scan to pay')}
              primary
              onClick={() => onServiceClick?.('pay')}
            />
            <QuickAction
              icon={<Wallet className="w-7 h-7" />}
              label={tr('wallet.balance', 'Balance')}
              subLabel={showBalance ? formatCurrency(balance) : tr('wallet.hidden_balance', 'Hidden')}
              onClick={toggleBalance}
            />
          </div>

          <div className="flex items-center justify-between text-white/90 px-1">
            <button onClick={toggleBalance} className="flex items-center gap-2">
              <span className="text-sm opacity-80">{tr('wallet.balance_title', 'My Balance')}</span>
              {showBalance ? (
                <span className="text-xl font-semibold">{formatCurrency(balance)}</span>
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
              {tr('wallet.income_yesterday', "Yesterday's Income")}{' '}
              <span className="font-semibold">{formatCurrency(dailyIncome)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-3 space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
            {tr('wallet.services_title', 'Services')}
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {tr('wallet.bill', 'Transactions')}
            </span>
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
                {tx.type === 'income' ? '↗' : '↘'}
              </div>
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white font-medium">{tx.title}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(tx.createTime)} · {tx.category}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-base font-semibold ${
                    tx.type === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {formatCurrency(tx.amount)}
                </div>
                <div className="text-xs text-gray-400">
                  {tr('wallet.transaction_success', 'Completed')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-gray-400 text-xs py-4">
          {tr('wallet.provider_support', 'Service powered by Omni Pay')}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
