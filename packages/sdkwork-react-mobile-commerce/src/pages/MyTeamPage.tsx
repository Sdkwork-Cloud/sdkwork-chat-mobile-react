import React from 'react';
import { Avatar, Button, Icon, Popup, Toast } from '@sdkwork/react-mobile-commons';
import { EmptyState, PageScaffold, SectionCard, SegmentTabs } from '../components';
import { distributionService, type TeamMember } from '../services/DistributionService';
import { formatDateTime } from './helpers';

interface MyTeamPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

type SortMode = 'contribution' | 'join';

const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (full, key) => {
    const value = values[key];
    return value === undefined || value === null ? full : String(value);
  });

export const MyTeamPage: React.FC<MyTeamPageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const levelTabs = React.useMemo(
    () => [
      { id: 'all', label: tr('commerce.my_team.tabs.all', '全部成员') },
      { id: '1', label: tr('commerce.my_team.tabs.level1', '一级直推') },
      { id: '2', label: tr('commerce.my_team.tabs.level2', '二级裂变') },
    ],
    [t]
  );

  const [levelTab, setLevelTab] = React.useState('all');
  const [sortMode, setSortMode] = React.useState<SortMode>('contribution');
  const [keyword, setKeyword] = React.useState('');
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const level = levelTab === 'all' ? 'all' : (Number(levelTab) as 1 | 2);
      const result = await distributionService.getTeamMembers(level);
      if (result.success && result.data) setMembers(result.data);
    };
    void load();
  }, [levelTab]);

  const summary = React.useMemo(() => {
    const totalContribution = members.reduce((sum, item) => sum + item.contribution, 0);
    const direct = members.filter((item) => item.level === 1).length;
    const second = members.filter((item) => item.level === 2).length;
    return {
      size: members.length,
      direct,
      second,
      totalContribution,
    };
  }, [members]);

  const list = React.useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    let filtered = normalizedKeyword
      ? members.filter((item) => item.name.toLowerCase().includes(normalizedKeyword))
      : members;

    filtered = [...filtered].sort((a, b) => {
      if (sortMode === 'contribution') return b.contribution - a.contribution;
      return new Date(b.joinAt).getTime() - new Date(a.joinAt).getTime();
    });

    return filtered;
  }, [keyword, members, sortMode]);

  return (
    <PageScaffold
      title={fillTemplate(tr('commerce.my_team.title_with_count', '我的团队 ({count})'), {
        count: list.length,
      })}
      onBack={onBack}
      rightElement={
        <button
          type="button"
          onClick={() => {
            if (!list.length) {
              Toast.info(tr('commerce.my_team.no_member_for_group', '暂无成员可建群'));
              return;
            }
            Toast.success(
              fillTemplate(tr('commerce.my_team.group_created', '已创建 {count} 人群聊'), {
                count: list.length,
              })
            );
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--primary-color)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {tr('commerce.my_team.create_group', '一键建群')}
        </button>
      }
    >
      <SectionCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {tr('commerce.my_team.summary_total', '总人数')}
            </div>
            <div style={{ marginTop: '4px', fontSize: '20px', fontWeight: 700 }}>{summary.size}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {tr('commerce.my_team.summary_levels', '一级/二级')}
            </div>
            <div style={{ marginTop: '4px', fontSize: '20px', fontWeight: 700 }}>
              {summary.direct}/{summary.second}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {tr('commerce.my_team.summary_contribution', '累计贡献')}
            </div>
            <div style={{ marginTop: '4px', fontSize: '20px', fontWeight: 700 }}>
              ¥{summary.totalContribution.toFixed(0)}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SegmentTabs value={levelTab} options={levelTabs} onChange={setLevelTab} />
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-cell-active)',
            border: '0.5px solid var(--border-color)',
            borderRadius: '10px',
            height: '38px',
            padding: '0 10px',
          }}
        >
          <Icon name="search" size={16} color="var(--text-secondary)" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={tr('commerce.my_team.search_placeholder', '搜索成员昵称')}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
          <button
            type="button"
            onClick={() => setSortMode('contribution')}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: sortMode === 'contribution' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: sortMode === 'contribution' ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            {tr('commerce.my_team.sort_contribution', '贡献排序')}
          </button>
          <button
            type="button"
            onClick={() => setSortMode('join')}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: sortMode === 'join' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: sortMode === 'join' ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            {tr('commerce.my_team.sort_time', '时间排序')}
          </button>
        </div>
      </SectionCard>

      {list.length === 0 ? (
        <EmptyState icon="group" title={tr('commerce.my_team.empty', '暂无团队成员')} />
      ) : null}

      {list.map((member, index) => (
        <SectionCard key={member.id} onClick={() => setSelectedMember(member)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Avatar src={member.avatar} name={member.name} size="lg" />
              {index < 3 ? (
                <span
                  style={{
                    position: 'absolute',
                    right: '-4px',
                    bottom: '-4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                    color: '#333',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--bg-card)',
                  }}
                >
                  {index + 1}
                </span>
              ) : null}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>{member.name}</div>
                <div style={{ color: '#fa5151', fontWeight: 700, fontSize: '16px' }}>¥{member.contribution.toFixed(0)}</div>
              </div>
              <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    borderRadius: '999px',
                    padding: '2px 8px',
                    background: member.level === 1 ? 'rgba(41, 121, 255, 0.12)' : 'rgba(255, 154, 68, 0.16)',
                    color: member.level === 1 ? 'var(--primary-color)' : '#ff9a44',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {member.level === 1
                    ? tr('commerce.my_team.level1', '一级')
                    : tr('commerce.my_team.level2', '二级')}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {tr('commerce.my_team.joined_at', '加入于')} {formatDateTime(member.joinAt)}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      ))}

      <Popup
        visible={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        position="bottom"
        round
        style={{ minHeight: '320px' }}
      >
        {selectedMember ? (
          <div style={{ padding: '24px 16px 22px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar src={selectedMember.avatar} name={selectedMember.name} size="2xl" />
              <div style={{ marginTop: '10px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}>
                {selectedMember.name}
              </div>
              <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                {fillTemplate(tr('commerce.my_team.member_meta', '{role} · {time}'), {
                  role: selectedMember.role,
                  time: formatDateTime(selectedMember.joinAt),
                })}
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'var(--bg-body)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {tr('commerce.my_team.summary_contribution', '累计贡献')}
                </div>
                <div style={{ marginTop: '4px', color: '#fa5151', fontSize: '20px', fontWeight: 700 }}>
                  ¥{selectedMember.contribution.toFixed(0)}
                </div>
              </div>
              <div style={{ background: 'var(--bg-body)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {tr('commerce.my_team.monthly_contribution', '本月贡献')}
                </div>
                <div style={{ marginTop: '4px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700 }}>
                  ¥{(selectedMember.contribution * 0.35).toFixed(0)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <Button
                fullWidth
                variant="outline"
                onClick={() => {
                  Toast.success(
                    fillTemplate(
                      tr('commerce.my_team.incentive_sent', '已向 {name} 发送激励红包'),
                      { name: selectedMember.name }
                    )
                  );
                  setSelectedMember(null);
                }}
              >
                {tr('commerce.my_team.send_incentive', '发送激励')}
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  Toast.success(
                    fillTemplate(
                      tr('commerce.my_team.message_started', '已发起与 {name} 的聊天'),
                      { name: selectedMember.name }
                    )
                  );
                  setSelectedMember(null);
                }}
              >
                {tr('commerce.my_team.send_message', '发消息')}
              </Button>
            </div>
          </div>
        ) : null}
      </Popup>
    </PageScaffold>
  );
};

export default MyTeamPage;
