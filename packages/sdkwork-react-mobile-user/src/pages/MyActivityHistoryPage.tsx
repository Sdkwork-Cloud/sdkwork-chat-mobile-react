import React from 'react';
import { Button, CellGroup, CellItem, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import './MyActivityHistoryPage.css';

type ActivityTab = 'login' | 'generation';

interface MyActivityHistoryPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

interface ActivityHistoryRow {
  id: string;
  title: string;
  timeText: string;
  detail: string;
}

const PAGE_SIZE = 20;

function safeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function formatDateTime(value: unknown): string {
  const text = safeString(value);
  if (!text) {
    return '--';
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return text;
  }
  return parsed.toLocaleString();
}

function pickHistoryTime(item: Record<string, unknown>): string {
  return safeString(item.createdAt) || safeString(item.updatedAt) || safeString(item.timestamp) || safeString(item.time);
}

function mapRows(content: Record<string, unknown>[] | undefined, fallbackTitle: string): ActivityHistoryRow[] {
  if (!Array.isArray(content)) {
    return [];
  }
  return content.map((item, index) => {
    const title = safeString(item.title)
      || safeString(item.event)
      || safeString(item.type)
      || safeString(item.action)
      || fallbackTitle;
    const detail = safeString(item.location)
      || safeString(item.ip)
      || safeString(item.device)
      || safeString(item.platform)
      || safeString(item.status)
      || safeString(item.result)
      || '--';
    const id = safeString(item.id) || safeString(item.recordId) || `${fallbackTitle}-${index + 1}`;
    return {
      id,
      title,
      timeText: formatDateTime(pickHistoryTime(item)),
      detail,
    };
  });
}

export const MyActivityHistoryPage: React.FC<MyActivityHistoryPageProps> = ({ t, onBack }) => {
  const { getLoginHistory, getGenerationHistory } = useUser();
  const [activeTab, setActiveTab] = React.useState<ActivityTab>('login');
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<ActivityHistoryRow[]>([]);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  const activeTabLabel = React.useMemo(
    () => (activeTab === 'login'
      ? tr('profile.history.login', 'Login History')
      : tr('profile.history.generation', 'Generation History')),
    [activeTab, tr]
  );

  const loadHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'login') {
        const page = await getLoginHistory({ page: 0, size: PAGE_SIZE });
        setRows(mapRows(page.content, tr('profile.history.login_title', 'Login')));
      } else {
        const page = await getGenerationHistory({ page: 0, size: PAGE_SIZE });
        setRows(mapRows(page.content, tr('profile.history.generation_title', 'Generation')));
      }
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : tr('profile.history.load_failed', 'Failed to load history'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, getGenerationHistory, getLoginHistory, tr]);

  React.useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <div className="my-activity-history-page user-center-page">
      <Navbar title={tr('profile.history.title', 'Activity History')} onBack={onBack} />

      <div className="my-activity-history-page__tabs" role="tablist" aria-label="activity history tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'login'}
          aria-controls="activity-history-panel"
          tabIndex={activeTab === 'login' ? 0 : -1}
          className={`my-activity-history-page__tab-btn ${activeTab === 'login' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          {tr('profile.history.login', 'Login History')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'generation'}
          aria-controls="activity-history-panel"
          tabIndex={activeTab === 'generation' ? 0 : -1}
          className={`my-activity-history-page__tab-btn ${activeTab === 'generation' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('generation')}
        >
          {tr('profile.history.generation', 'Generation History')}
        </button>
      </div>

      <div id="activity-history-panel" role="tabpanel" className="my-activity-history-page__scroll user-center-page__scroll">
        {loading ? (
          <CellGroup>
            <CellItem title={tr('profile.history.loading', 'Loading history...')} noBorder />
          </CellGroup>
        ) : null}

        {!loading && rows.length === 0 ? (
          <CellGroup>
            <CellItem
              title={tr('profile.history.empty', 'No records')}
              description={tr('profile.history.empty_desc', 'No activity yet, tap refresh to retry')}
              noBorder
            />
          </CellGroup>
        ) : null}

        {!loading && rows.length > 0 ? (
          <CellGroup title={activeTabLabel}>
            {rows.map((item, index) => (
              <CellItem
                key={`${activeTab}-${item.id}`}
                title={item.title}
                description={item.detail}
                value={<span className="my-activity-history-page__time">{item.timeText}</span>}
                noBorder={index === rows.length - 1}
              />
            ))}
          </CellGroup>
        ) : null}
      </div>

      <div className="my-activity-history-page__actions">
        <Button block onClick={() => void loadHistory()} disabled={loading}>
          {tr('common.refresh', 'Refresh')}
        </Button>
      </div>
    </div>
  );
};

export default MyActivityHistoryPage;
