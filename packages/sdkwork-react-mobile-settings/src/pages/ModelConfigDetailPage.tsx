
import React, { useEffect, useState } from 'react';
import { Navbar, Toast, Button } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';

interface ModelConfigDetailPageProps {
  t?: (key: string) => string;
  domain?: string;
  title?: string;
  onBack?: () => void;
}

const DOMAIN_PROVIDERS: Record<string, Array<{ id: string; name: string; icon: string; models: string[] }>> = {
    text: [
        { id: 'gemini', name: 'Google Gemini', icon: '✨', models: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-1.5-pro'] },
        { id: 'openai', name: 'OpenAI', icon: '🤖', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
        { id: 'anthropic', name: 'Anthropic', icon: '🧠', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
        { id: 'ollama', name: 'Ollama (Local)', icon: '🦙', models: ['llama3', 'mistral', 'gemma'] },
    ],
    image: [
        { id: 'midjourney', name: 'Midjourney', icon: '⛵', models: ['V6.0', 'Niji 6', 'V5.2'] },
        { id: 'dall-e', name: 'DALL·E', icon: '🎨', models: ['dall-e-3', 'dall-e-2'] },
        { id: 'stable-diffusion', name: 'Stability AI', icon: '🌌', models: ['sd3', 'sdxl-turbo'] },
    ],
    video: [
        { id: 'runway', name: 'Runway', icon: '🎬', models: ['gen-3-alpha', 'gen-2'] },
        { id: 'luma', name: 'Luma Dream', icon: '🌙', models: ['dream-machine'] },
    ],
    speech: [
        { id: 'openai', name: 'OpenAI TTS', icon: '🗣️', models: ['tts-1', 'tts-1-hd'] },
        { id: 'elevenlabs', name: 'ElevenLabs', icon: '🎙️', models: ['multilingual-v2'] },
    ],
    music: [
        { id: 'suno', name: 'Suno', icon: '🎵', models: ['v3', 'v3.5'] },
        { id: 'udio', name: 'Udio', icon: '🎹', models: ['beta-v1'] },
    ]
};

export const ModelConfigDetailPage: React.FC<ModelConfigDetailPageProps> = ({
  t,
  domain = 'text',
  title = '',
  onBack,
}) => {
  const { updateAIConfig, t: settingsT } = useSettings();
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const appValue = t?.(key);
      if (appValue && appValue !== key) return appValue;
      const settingsValue = settingsT?.(key);
      if (settingsValue && settingsValue !== key) return settingsValue;
      return fallback;
    },
    [settingsT, t]
  );
  const [config, setConfig] = useState({
    enabled: true,
    mode: 'cloud' as 'cloud' | 'local',
    provider: 'gemini',
    modelName: 'gemini-3-flash-preview',
    apiKey: '',
    endpoint: '',
    temperature: 0.7
  });
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [domain]);

  const handleSave = async () => {
    Toast.loading(tr('settings.model_config.saving', 'Saving...'));
    await updateAIConfig(domain as any, config);
    setTimeout(() => {
      Toast.success(tr('settings.model_config.saved', 'Configuration updated'));
      onBack?.();
    }, 500);
  };

  const updateField = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div style={{ height: '100%', background: 'var(--bg-body)' }} />;

  const isLocal = config.mode === 'cloud' ? false : true;
  const currentProviders = DOMAIN_PROVIDERS[domain] || DOMAIN_PROVIDERS['text'];
  const activeProviderObj = currentProviders.find(p => p.id === config.provider) || 
                            { name: config.provider, icon: '🔧', models: [] };

  const renderCell = (
    title: string,
    options?: {
      label?: string;
      value?: string;
      isLink?: boolean;
      toggle?: boolean;
      checked?: boolean;
      onToggle?: () => void;
      onClick?: () => void;
    }
  ) => (
    <div
      onClick={options?.toggle ? undefined : options?.onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        background: 'var(--bg-card)',
        cursor: options?.onClick ? 'pointer' : 'default',
        borderBottom: '0.5px solid var(--border-color)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{title}</div>
        {options?.label && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {options.label}
          </div>
        )}
      </div>
      {options?.toggle && (
        <div
          onClick={options.onToggle}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            background: options.checked ? 'var(--primary-color)' : 'var(--border-color)',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <div style={{
            position: 'absolute',
            top: '2px',
            left: options.checked ? '22px' : '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
        </div>
      )}
      {options?.value && !options.toggle && (
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginRight: options.isLink ? '4px' : 0 }}>
          {options.value}
        </div>
      )}
      {options?.isLink && !options.toggle && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" style={{ opacity: 0.5 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
      <Navbar title={title || tr('settings.model_config.title', 'Model Configuration')} onBack={onBack} />
      
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <div style={{ padding: '16px 16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {tr('settings.model_config.mode_title', 'Run Mode')}
        </div>
        <div style={{ padding: '0 16px', marginBottom: '12px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '6px', display: 'flex', border: '0.5px solid var(--border-color)' }}>
            <div 
              onClick={() => updateField('mode', 'cloud')}
              style={{ 
                flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', 
                background: !isLocal ? 'var(--primary-color)' : 'transparent',
                color: !isLocal ? 'white' : 'var(--text-secondary)',
                fontWeight: !isLocal ? 600 : 400, fontSize: '14px', cursor: 'pointer',
              }}
            >
              ☁️ {tr('settings.model_config.mode_cloud', 'Cloud API')}
            </div>
            <div 
              onClick={() => updateField('mode', 'local')}
              style={{ 
                flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', 
                background: isLocal ? 'var(--primary-color)' : 'transparent',
                color: isLocal ? 'white' : 'var(--text-secondary)',
                fontWeight: isLocal ? 600 : 400, fontSize: '14px', cursor: 'pointer',
              }}
            >
              🏠 {tr('settings.model_config.mode_local', 'Local Deployment')}
            </div>
          </div>
        </div>

        <div style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-body)' }}>
          {tr('settings.model_config.model_title', 'Model Selection')}
        </div>
        <div style={{ background: 'var(--bg-card)' }}>
          {renderCell(tr('settings.model_config.enable_service', 'Enable service'), { toggle: true, checked: config.enabled, onToggle: () => updateField('enabled', !config.enabled) })}
          {renderCell(tr('settings.model_config.current_model', 'Current model'), { 
            value: `${activeProviderObj.icon} ${config.modelName}`, 
            isLink: true, 
            onClick: () => setShowPicker(true) 
          })}
        </div>

        <div style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-body)' }}>
          {isLocal
            ? tr('settings.model_config.connection_title', 'Connection')
            : tr('settings.model_config.auth_title', 'Authentication')}
        </div>
        <div style={{ background: 'var(--bg-card)' }}>
          {isLocal ? (
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Endpoint URL</div>
              <input
                value={config.endpoint}
                onChange={(e) => updateField('endpoint', e.target.value)}
                placeholder="http://localhost:11434"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          ) : (
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>API Key</div>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => updateField('apiKey', e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          )}
        </div>

        <div style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-body)' }}>
          {tr('settings.model_config.advanced_title', 'Advanced')}
        </div>
        <div style={{ padding: '16px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
              {tr('settings.model_config.temperature', 'Temperature')}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{config.temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {isLocal 
            ? tr(
                'settings.model_config.local_tip',
                'Ensure your local service (e.g., Ollama, LM Studio) is running and CORS is enabled.'
              )
            : tr(
                'settings.model_config.cloud_tip',
                'API keys are stored locally on your device and are not uploaded to OpenChat servers.'
              )}
        </div>
      </div>

      <div style={{ padding: '16px', background: 'var(--bg-card)', borderTop: '0.5px solid var(--border-color)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <Button block onClick={handleSave}>{tr('settings.model_config.save', 'Save Configuration')}</Button>
      </div>

      {showPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }} onClick={() => setShowPicker(false)}>
          <div style={{
            width: '100%',
            background: 'var(--bg-card)',
            borderRadius: '16px 16px 0 0',
            maxHeight: '70vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px', textAlign: 'center', borderBottom: '0.5px solid var(--border-color)' }}>
              {tr('settings.model_config.select_model', 'Select Model')}
            </div>
            {currentProviders.map(provider => (
              <div key={provider.id} style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--border-color)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  {provider.icon} {provider.name}
                </div>
                {provider.models.map(model => (
                  <div
                    key={model}
                    onClick={() => {
                      updateField('provider', provider.id);
                      updateField('modelName', model);
                      setShowPicker(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      margin: '4px 0',
                      borderRadius: '6px',
                      background: config.modelName === model ? 'var(--primary-color)' : 'var(--bg-body)',
                      color: config.modelName === model ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {model}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelConfigDetailPage;
