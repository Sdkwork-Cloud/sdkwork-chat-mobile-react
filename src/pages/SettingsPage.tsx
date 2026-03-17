import React, { useEffect, useState } from 'react';
import { navigate } from '../router';
import { ROUTE_PATHS } from '../router/paths';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/Toast';
import { Navbar } from '../components/Navbar/Navbar';
import { Cell, CellGroup } from '../components/Cell';
import { calculateStorageUsage, formatBytes } from '../utils/algorithms';
import { useTranslation } from '../core/i18n/I18nContext';

const CleaningModal: React.FC<{ visible: boolean; title: string; description: string }> = ({
  visible,
  title,
  description,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        animation: 'fadeIn 0.2s',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.2)',
          borderTopColor: 'var(--primary-color)',
          animation: 'spin 1s linear infinite',
        }}
      />
      <div style={{ marginTop: '20px', fontSize: '16px', fontWeight: 500 }}>{title}</div>
      <div style={{ marginTop: '8px', fontSize: '13px', opacity: 0.7 }}>{description}</div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [storageSize, setStorageSize] = useState('...');
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const bytes = calculateStorageUsage();
      setStorageSize(formatBytes(bytes));
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const handleCleanStorage = () => {
    setIsCleaning(true);
    window.setTimeout(() => {
      setIsCleaning(false);
      Toast.success(`${t('settings.storage_cleaned')} ${storageSize}`);
      setStorageSize('0 B');
    }, 1500);
  };

  const handleLogout = () => {
    if (window.confirm(t('settings.logout_confirm'))) {
      Toast.loading(t('common.loading'));
      window.setTimeout(async () => {
        await logout();
        Toast.success(t('settings.logout_success'));
      }, 800);
    }
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)', paddingBottom: '40px' }}>
      <Navbar title={t('settings.title')} onBack={() => navigate(ROUTE_PATHS.me)} />

      <CleaningModal
        visible={isCleaning}
        title={t('settings.storage_cleaning')}
        description={t('settings.storage_clean_desc')}
      />

      <div style={{ marginTop: '12px' }}>
        <CellGroup>
          <Cell title={t('settings.account')} isLink onClick={() => navigate(ROUTE_PATHS.accountSecurity)} />
        </CellGroup>
      </div>

      <div style={{ marginTop: '12px' }}>
        <CellGroup>
          <Cell
            title={t('settings.model_settings')}
            value={t('settings.model_desc')}
            isLink
            onClick={() => navigate(ROUTE_PATHS.modelSettings)}
          />
        </CellGroup>
      </div>

      <div style={{ marginTop: '12px' }}>
        <CellGroup>
          <Cell
            title={t('settings.notifications')}
            isLink
            onClick={() => navigate(ROUTE_PATHS.general, { title: t('settings.notifications') })}
          />
          <Cell
            title={t('settings.general')}
            isLink
            onClick={() => navigate(ROUTE_PATHS.general, { title: t('settings.general') })}
          />
          <Cell
            title={t('settings.theme')}
            value={t('settings.labels.theme_desc')}
            isLink
            onClick={() => navigate(ROUTE_PATHS.theme)}
          />
        </CellGroup>
      </div>

      <div style={{ marginTop: '12px' }}>
        <CellGroup>
          <Cell title={t('settings.storage')} value={storageSize} isLink onClick={handleCleanStorage} />
        </CellGroup>
      </div>

      <div style={{ marginTop: '12px' }}>
        <CellGroup>
          <Cell
            title={t('settings.about')}
            value="v2.1.0"
            isLink
            onClick={() => navigate(ROUTE_PATHS.general, { title: t('settings.about') })}
          />
        </CellGroup>
      </div>

      <div style={{ marginTop: '24px', padding: '0 16px' }}>
        <button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--bg-card)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#fa5151',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'transform 0.1s, background 0.1s',
          }}
          onTouchStart={(event) => {
            event.currentTarget.style.transform = 'scale(0.98)';
            event.currentTarget.style.background = 'var(--bg-cell-active)';
          }}
          onTouchEnd={(event) => {
            event.currentTarget.style.transform = 'scale(1)';
            event.currentTarget.style.background = 'var(--bg-card)';
          }}
          onMouseDown={(event) => {
            event.currentTarget.style.transform = 'scale(0.98)';
            event.currentTarget.style.background = 'var(--bg-cell-active)';
          }}
          onMouseUp={(event) => {
            event.currentTarget.style.transform = 'scale(1)';
            event.currentTarget.style.background = 'var(--bg-card)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = 'scale(1)';
            event.currentTarget.style.background = 'var(--bg-card)';
          }}
        >
          {t('settings.logout')}
        </button>
      </div>
    </div>
  );
};
