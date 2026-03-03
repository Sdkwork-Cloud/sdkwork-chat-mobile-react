import React from 'react';
import { Avatar } from '@sdkwork/react-mobile-commons';
import { EmptyState, PageScaffold, SectionCard } from '../components';
import { distributionService, type RankItem } from '../services/DistributionService';

interface DistributionRankPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

const trendColor: Record<RankItem['trend'], string> = {
  up: '#fa5151',
  down: '#07c160',
  flat: 'var(--text-secondary)',
};

const medalConfig = [
  { rank: 2, color: '#c0c0c0', emoji: '🥈' },
  { rank: 1, color: '#ffd700', emoji: '👑' },
  { rank: 3, color: '#cd7f32', emoji: '🥉' },
];

const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (full, key) => {
    const value = values[key];
    return value === undefined || value === null ? full : String(value);
  });

export const DistributionRankPage: React.FC<DistributionRankPageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const trendText = React.useMemo<Record<RankItem['trend'], string>>(
    () => ({
      up: tr('commerce.distribution_rank.trend_up', '排名上升'),
      down: tr('commerce.distribution_rank.trend_down', '排名下降'),
      flat: tr('commerce.distribution_rank.trend_flat', '排名持平'),
    }),
    [t]
  );

  const [ranking, setRanking] = React.useState<RankItem[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const result = await distributionService.getRankings();
      if (result.success && result.data) setRanking(result.data);
    };
    void load();
  }, []);

  const topThree = ranking.filter((item) => item.rank <= 3);
  const rest = ranking.filter((item) => item.rank > 3);
  const myRank = ranking.find((item) => item.id === 'rk_me');

  return (
    <PageScaffold title={tr('commerce.distribution_rank.title', '分销排行')} onBack={onBack}>
      <SectionCard
        style={{
          background: 'linear-gradient(180deg, #243b55 0%, #1b2c4b 100%)',
          border: 'none',
          color: '#fff',
        }}
      >
        <div style={{ textAlign: 'center', fontSize: '12px', opacity: 0.85 }}>
          {tr('commerce.distribution_rank.monthly_realtime', '本月实时收益排行')}
        </div>
        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '18px', alignItems: 'flex-end' }}>
          {medalConfig.map((item) => {
            const rankItem = topThree.find((entry) => entry.rank === item.rank);
            if (!rankItem) return null;
            const isChampion = item.rank === 1;
            return (
              <div key={rankItem.id} style={{ textAlign: 'center', marginTop: isChampion ? 0 : '16px' }}>
                <div style={{ fontSize: '20px' }}>{item.emoji}</div>
                <div
                  style={{
                    marginTop: '4px',
                    width: isChampion ? '74px' : '62px',
                    height: isChampion ? '74px' : '62px',
                    borderRadius: '50%',
                    border: `3px solid ${item.color}`,
                    padding: '2px',
                    boxSizing: 'border-box',
                    boxShadow: `0 8px 18px ${item.color}45`,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <Avatar src={rankItem.avatar} name={rankItem.name} size={isChampion ? 'xl' : 'lg'} />
                </div>
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  {rankItem.name}
                </div>
                <div style={{ marginTop: '2px', fontSize: '14px', fontWeight: 700 }}>¥{rankItem.amount.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {rest.length === 0 ? (
        <EmptyState
          icon="sparkles"
          title={tr('commerce.distribution_rank.empty', '暂无更多排行数据')}
        />
      ) : null}

      <SectionCard style={{ padding: 0, overflow: 'hidden' }}>
        {rest.map((item, index) => (
          <div
            key={item.id}
            style={{
              padding: '14px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderBottom: index === rest.length - 1 ? 'none' : '0.5px solid var(--border-color)',
            }}
          >
            <div style={{ width: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}>
              {item.rank}
            </div>
            <Avatar src={item.avatar} name={item.name} size="md" />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
              <div style={{ marginTop: '2px', color: trendColor[item.trend], fontSize: '11px' }}>{trendText[item.trend]}</div>
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>
              ¥{item.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </SectionCard>

      {myRank ? (
        <SectionCard
          style={{
            borderColor: 'rgba(41, 121, 255, 0.35)',
            background: 'linear-gradient(135deg, rgba(41,121,255,0.08), rgba(97,173,255,0.1))',
          }}
        >
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            {tr('commerce.distribution_rank.my_rank', '我的排名')}
          </div>
          <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}>
              {fillTemplate(tr('commerce.distribution_rank.rank_index', '第 {rank} 名'), {
                rank: myRank.rank,
              })}
            </div>
            <div style={{ color: '#fa5151', fontSize: '20px', fontWeight: 800 }}>¥{myRank.amount.toLocaleString()}</div>
          </div>
        </SectionCard>
      ) : null}
    </PageScaffold>
  );
};

export default DistributionRankPage;
