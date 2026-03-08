
import React from 'react';
import { navigate } from '../router';
import { ROUTE_PATHS } from '../router/paths';
import { useTheme, AppTheme } from '../theme/themeContext';
import { Navbar } from '../components/Navbar/Navbar';

const ThemeOption = ({ 
    themeKey, 
    label, 
    previewColor, 
    previewBg,
    isSelected, 
    onSelect 
}: { 
    themeKey: AppTheme, 
    label: string, 
    previewColor: string, 
    previewBg: string,
    isSelected: boolean, 
    onSelect: () => void 
}) => (
    <div 
        onClick={onSelect}
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            background: 'var(--bg-card)',
            borderBottom: '0.5px solid var(--border-color)',
            cursor: 'pointer'
        }}
    >
        <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: previewBg,
            border: '2px solid ' + (isSelected ? previewColor : 'transparent'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
        }}>
            <div style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                background: previewColor
            }} />
        </div>
        <span style={{ flex: 1, fontSize: 15, color: 'var(--text-primary)' }}>{label}</span>
        {isSelected && <span style={{ color: previewColor, fontSize: 20 }}>✓</span>}
    </div>
);

const ThemePage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Navbar title="主题设置" onBack={() => navigate(ROUTE_PATHS.settings)} />
      
      <div style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
        选择主题风格
      </div>

      <div>
        <ThemeOption 
            themeKey="light"
            label="浅色模式 (Light)"
            previewBg="#ffffff"
            previewColor="#07c160"
            isSelected={theme === 'light'}
            onSelect={() => setTheme('light')}
        />
        <ThemeOption 
            themeKey="dark"
            label="深色模式 (Dark)"
            previewBg="#000000"
            previewColor="#10aeff"
            isSelected={theme === 'dark'}
            onSelect={() => setTheme('dark')}
        />
        <ThemeOption 
            themeKey="wechat-dark"
            label="微信深色 (WeChat Dark)"
            previewBg="#111111"
            previewColor="#07c160"
            isSelected={theme === 'wechat-dark'}
            onSelect={() => setTheme('wechat-dark')}
        />
        <ThemeOption 
            themeKey="midnight-blue"
            label="极客风格 (Geek)"
            previewBg="#0d1117"
            previewColor="#1f6feb"
            isSelected={theme === 'midnight-blue'}
            onSelect={() => setTheme('midnight-blue')}
        />
      </div>

      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
        AI Theme (Tech Blue) enabled
      </div>
    </div>
  );
};

export default ThemePage;
