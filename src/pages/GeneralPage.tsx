import React, { useEffect, useState } from 'react';
import { useQueryParams, navigate, navigateBack } from '../router';
import { ROUTE_PATHS } from '../router/paths';
import { Navbar } from '../components/Navbar/Navbar';
import { Cell, CellGroup } from '../components/Cell';
import { settingsService } from '@sdkwork/react-mobile-settings';
import type { AppConfig } from '@sdkwork/react-mobile-settings';
import { Toast } from '../components/Toast';
import { useTheme } from '../theme/themeContext';
import { Dialog } from '../components/Dialog';
import { Slider } from '../components/Slider/Slider';

const LANGUAGE_OPTIONS: Array<{ label: string; value: AppConfig['language'] }> = [
  { label: 'Simplified Chinese', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];

const getLanguageLabel = (language?: AppConfig['language']): string => {
  return LANGUAGE_OPTIONS.find((item) => item.value === language)?.label || 'Simplified Chinese';
};

const FontSizeSettingsView = () => {
  const { fontSize, setFontSize } = useTheme();
  return (
    <div style={{ padding: 20 }}>
      <h3>字体大小设置</h3>
      <Slider value={fontSize} min={12} max={24} onChange={setFontSize} />
      <p style={{ marginTop: 20, fontSize }}>Preview text: this is a sample paragraph.</p>
    </div>
  );
};

const MainSettingsView: React.FC = () => {
  const { theme, fontSize } = useTheme();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const data = await settingsService.getConfig();
      setConfig(data);
    };
    void loadConfig();
  }, []);

  const applyLanguage = async (language: AppConfig['language']) => {
    await settingsService.updateConfig({ language });
    setConfig((prev) => {
      if (!prev) return prev;
      return { ...prev, language, updateTime: Date.now() };
    });
    setShowLanguageDialog(false);
    Toast.success(`语言已切换为${getLanguageLabel(language)}`);
  };

  return (
    <div style={{ padding: '0 0 20px' }}>
      <CellGroup title="外观">
        <Cell title="深色模式" value={config?.theme || theme} onClick={() => navigate(ROUTE_PATHS.theme)} />
        <Cell title="字体大小" value={`${fontSize}px`} onClick={() => navigate(`${ROUTE_PATHS.general}?tab=font-size`)} />
        <Cell title="聊天背景" onClick={() => navigate(ROUTE_PATHS.chatBackground)} />
      </CellGroup>

      <CellGroup title="功能">
        <Cell
          title="多语言"
          value={getLanguageLabel(config?.language)}
          onClick={() => setShowLanguageDialog(true)}
        />
      </CellGroup>

      <Dialog
        visible={showLanguageDialog}
        title="选择语言"
        content="Changes will be applied to page text immediately."
        onClose={() => setShowLanguageDialog(false)}
        actions={[
          ...LANGUAGE_OPTIONS.map((item) => ({
            text: item.label,
            primary: config?.language === item.value,
            onClick: () => {
              void applyLanguage(item.value);
            },
          })),
          {
            text: '取消',
            onClick: () => setShowLanguageDialog(false),
          },
        ]}
      />
    </div>
  );
};

const GeneralPage: React.FC = () => {
  const params = useQueryParams();
  const subPage = params.get('tab') || 'main';

  return (
    <div>
      <Navbar title="通用设置" onBack={() => navigateBack(ROUTE_PATHS.settings)} />
      {subPage === 'font-size' ? <FontSizeSettingsView /> : <MainSettingsView />}
    </div>
  );
};

export default GeneralPage;
