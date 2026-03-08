import React from 'react';

type AppType = 'standalone-site' | 'mini-program' | 'service-app';

interface AppEntry {
  id: AppType;
  name: string;
  summary: string;
}

interface AppCenterPageProps {
  onBack?: () => void;
  onOpenApp?: (appType: AppType) => void;
  onOpenSite?: (siteId: string) => void;
}

const APP_ENTRIES: AppEntry[] = [
  {
    id: 'standalone-site',
    name: 'Standalone Site',
    summary: 'Independent website for marketing, transactions, and service delivery.',
  },
  {
    id: 'mini-program',
    name: 'Mini Program',
    summary: 'Lightweight in-app experience with quick launch and embedded workflows.',
  },
  {
    id: 'service-app',
    name: 'Service App',
    summary: 'Task-oriented app flow for booking, payments, and operation dashboards.',
  },
];

const pageStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg-body)',
};

const navStyle: React.CSSProperties = {
  height: 52,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 12px',
  borderBottom: '0.5px solid var(--border-color)',
  background: 'var(--bg-card)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const backStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: 18,
  width: 28,
  height: 28,
  cursor: 'pointer',
};

const listStyle: React.CSSProperties = {
  padding: '10px 0',
  overflowY: 'auto',
  flex: 1,
};

const itemStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  background: 'var(--bg-card)',
  borderBottom: '0.5px solid var(--border-color)',
  padding: '12px',
  textAlign: 'left',
  cursor: 'pointer',
};

const badgeStyle: React.CSSProperties = {
  marginTop: 8,
  display: 'inline-flex',
  alignItems: 'center',
  border: '0.5px solid var(--border-color)',
  borderRadius: 10,
  padding: '2px 8px',
  fontSize: 11,
  color: 'var(--text-secondary)',
};

export const AppCenterPage: React.FC<AppCenterPageProps> = ({ onBack, onOpenApp, onOpenSite }) => {
  const handleOpen = (appType: AppType) => {
    onOpenApp?.(appType);
    if (appType === 'standalone-site') {
      onOpenSite?.('standalone-site');
    }
  };

  return (
    <div style={pageStyle}>
      <div style={navStyle}>
        <button type="button" aria-label="back" style={backStyle} onClick={onBack}>
          {'<'}
        </button>
        <div style={titleStyle}>App Center</div>
      </div>

      <div style={listStyle}>
        {APP_ENTRIES.map((entry) => (
          <button key={entry.id} type="button" style={itemStyle} onClick={() => handleOpen(entry.id)}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{entry.name}</div>
            <div style={{ marginTop: 5, fontSize: 13, color: 'var(--text-secondary)' }}>{entry.summary}</div>
            <span style={badgeStyle}>Application Type</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppCenterPage;
