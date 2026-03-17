import React from 'react';
import { Button, Icon, Toast } from '@sdkwork/react-mobile-commons';
import { useOptionalTranslation } from '@/src/core/i18n/I18nContext';
import { PageScaffold, SectionCard } from '../components';
import { distributionService, type DistributionOverview, type DistributionTask } from '../services/DistributionService';

interface DistributionCenterPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

interface QuickEntry {
  key: string;
  icon: string;
  title: string;
  desc: string;
  path: string;
}

const EntryItem: React.FC<{
  icon: string;
  title: string;
  desc: string;
  isLast?: boolean;
  onClick?: () => void;
}> = ({ icon, title, desc, isLast, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: '100%',
      border: 'none',
      borderBottom: isLast ? 'none' : '0.5px solid var(--border-color)',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      textAlign: 'left',
      cursor: 'pointer',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'rgba(41, 121, 255, 0.1)',
        color: 'var(--primary-color)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={18} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px' }}>{title}</div>
      <div style={{ marginTop: '2px', color: 'var(--text-secondary)', fontSize: '12px' }}>{desc}</div>
    </div>
    <Icon name="arrow-right" size={16} color="var(--text-secondary)" />
  </button>
);

export const DistributionCenterPage: React.FC<DistributionCenterPageProps> = ({ t, onBack, onNavigate }) => {
  const appI18n = useOptionalTranslation();
  const tr = (key: string, fallback: string) => {
    const appValue = appI18n?.t(key);
    if (appValue && appValue !== key) {
      return appValue;
    }

    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const quickEntries = React.useMemo<QuickEntry[]>(
    () => [
      {
        key: 'goods',
        icon: 'shop',
        title: tr('commerce.distribution_center.entry_goods_title', '分销商品'),
        desc: tr('commerce.distribution_center.entry_goods_desc', '精选高佣商品库'),
        path: '/distribution-goods',
      },
      {
        key: 'team',
        icon: 'group',
        title: tr('commerce.distribution_center.entry_team_title', '我的团队'),
        desc: tr('commerce.distribution_center.entry_team_desc', '查看直推与二级成员'),
        path: '/my-team',
      },
      {
        key: 'commission',
        icon: 'bill',
        title: tr('commerce.distribution_center.entry_commission_title', '佣金明细'),
        desc: tr('commerce.distribution_center.entry_commission_desc', '追踪每笔收益状态'),
        path: '/commission',
      },
      {
        key: 'rank',
        icon: 'sparkles',
        title: tr('commerce.distribution_center.entry_rank_title', '分销排行'),
        desc: tr('commerce.distribution_center.entry_rank_desc', '查看团队业绩排名'),
        path: '/distribution-rank',
      },
      {
        key: 'withdraw',
        icon: 'money-transfer',
        title: tr('commerce.distribution_center.entry_withdraw_title', '申请提现'),
        desc: tr('commerce.distribution_center.entry_withdraw_desc', '快速提现到常用账户'),
        path: '/withdraw',
      },
      {
        key: 'poster',
        icon: 'share',
        title: tr('commerce.distribution_center.entry_poster_title', '分享海报'),
        desc: tr('commerce.distribution_center.entry_poster_desc', '一键生成推广素材'),
        path: '/share-poster',
      },
    ],
    [t]
  );

  const [overview, setOverview] = React.useState<DistributionOverview | null>(null);
  const [tasks, setTasks] = React.useState<DistributionTask[]>([]);
  const [loadingTaskId, setLoadingTaskId] = React.useState<string>('');

  React.useEffect(() => {
    const load = async () => {
      const [overviewResult, taskResult] = await Promise.all([
        distributionService.getOverview(),
        distributionService.getTasks(),
      ]);
      if (overviewResult.success && overviewResult.data) setOverview(overviewResult.data);
      if (taskResult.success && taskResult.data) setTasks(taskResult.data);
    };
    void load();
  }, []);

  const salesProgress = React.useMemo(() => {
    if (!overview) return 0;
    return Math.min((overview.totalSales / 120000) * 100, 100);
  }, [overview]);

  const claimTask = async (taskId: string) => {
    setLoadingTaskId(taskId);
    const result = await distributionService.claimTask(taskId);
    setLoadingTaskId('');
    if (!result.success) {
      Toast.error(result.message || tr('commerce.distribution_center.claim_failed', '领取失败，请稍后重试'));
      return;
    }
    const taskResult = await distributionService.getTasks();
    if (taskResult.success && taskResult.data) setTasks(taskResult.data);
    Toast.success(tr('commerce.distribution_center.reward_received', '奖励已到账'));
  };

  return (
    <PageScaffold title={tr('commerce.distribution_center.title', '分销中心')} onBack={onBack}>
      <SectionCard
        style={{
          background: 'linear-gradient(135deg, #1f2f5e 0%, #2f60ff 58%, #4aa1ff 100%)',
          border: 'none',
          color: '#fff',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-22px',
            top: '-12px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.14)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-32px',
            bottom: '-40px',
            width: '132px',
            height: '132px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ opacity: 0.9, fontSize: '12px' }}>
            {tr('commerce.distribution_center.current_level', '当前等级')}
          </div>
          <div style={{ marginTop: '4px', fontSize: '26px', fontWeight: 800 }}>
            {overview?.levelName || tr('commerce.distribution_center.default_level', '黄金分销员')}
          </div>
          <div style={{ marginTop: '6px', opacity: 0.9, fontSize: '12px' }}>
            {tr('commerce.distribution_center.invite_code', '邀请码')} {overview?.referralCode || tr('commerce.distribution_center.default_invite_code', 'AI888')}
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ opacity: 0.85, fontSize: '12px' }}>{tr('commerce.distribution_center.withdrawable', '可提现')}</div>
              <div style={{ marginTop: '2px', fontSize: '19px', fontWeight: 700 }}>
                ¥{overview?.withdrawableCommission.toFixed(2) || '0.00'}
              </div>
            </div>
            <div>
              <div style={{ opacity: 0.85, fontSize: '12px' }}>{tr('commerce.distribution_center.team_size', '团队人数')}</div>
              <div style={{ marginTop: '2px', fontSize: '19px', fontWeight: 700 }}>
                {overview?.teamSize || 0}
              </div>
            </div>
            <div>
              <div style={{ opacity: 0.85, fontSize: '12px' }}>{tr('commerce.distribution_center.monthly_income', '本月收益')}</div>
              <div style={{ marginTop: '2px', fontSize: '19px', fontWeight: 700 }}>
                ¥{overview?.currentMonthCommission.toFixed(0) || '0'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.9 }}>
              <span>{tr('commerce.distribution_center.sales_progress', '团队业绩进度')}</span>
              <span>¥{overview?.totalSales.toFixed(0) || '0'} / ¥120000</span>
            </div>
            <div
              style={{
                marginTop: '6px',
                height: '8px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.25)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${salesProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ffd84d 0%, #ffb200 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        {quickEntries.map((item, index) => (
          <EntryItem
            key={item.key}
            icon={item.icon}
            title={item.title}
            desc={item.desc}
            isLast={index === quickEntries.length - 1}
            onClick={() => onNavigate?.(item.path)}
          />
        ))}
      </SectionCard>

      <SectionCard>
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700 }}>
            {tr('commerce.distribution_center.tasks_title', '成长任务')}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            {tr('commerce.distribution_center.tasks_subtitle', '完成任务提升收益')}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map((task) => {
            const done = task.status === 'done';
            const canClaim = task.status === 'claim';
            return (
              <div
                key={task.id}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'var(--bg-cell-active)',
                  border: '0.5px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>{task.title}</div>
                  <div style={{ marginTop: '2px', color: 'var(--text-secondary)', fontSize: '12px' }}>{task.desc}</div>
                  <div style={{ marginTop: '4px', color: '#fa5151', fontSize: '12px', fontWeight: 600 }}>{task.reward}</div>
                </div>
                {done ? (
                  <span
                    style={{
                      borderRadius: '999px',
                      padding: '5px 10px',
                      background: 'rgba(7, 193, 96, 0.14)',
                      color: '#07c160',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {tr('commerce.distribution_center.task_done', '已完成')}
                  </span>
                ) : canClaim ? (
                  <Button
                    size="sm"
                    loading={loadingTaskId === task.id}
                    onClick={() => claimTask(task.id)}
                  >
                    {tr('commerce.distribution_center.task_claim', '领取')}
                  </Button>
                ) : (
                  <span
                    style={{
                      borderRadius: '999px',
                      padding: '5px 10px',
                      background: 'rgba(41, 121, 255, 0.1)',
                      color: 'var(--primary-color)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {tr('commerce.distribution_center.task_ongoing', '进行中')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </PageScaffold>
  );
};

export default DistributionCenterPage;
