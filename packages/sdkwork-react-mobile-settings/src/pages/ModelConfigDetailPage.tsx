import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  CellGroup,
  CellItem,
  ModelSelectorPopup,
  Navbar,
  Switch,
  Toast,
  type ModelChannelOption,
} from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';
import type { ModelConfigItem } from '../types';
import { validateModelConfigInput } from './modelConfigValidation';

interface ModelConfigDetailPageProps {
  t?: (key: string) => string;
  domain?: string;
  title?: string;
  onBack?: () => void;
}

const DOMAIN_PROVIDERS: Record<string, ModelChannelOption[]> = {
  text: [
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: '✨',
      models: [
        { id: 'gemini-3-flash-preview', name: 'gemini-3-flash-preview' },
        { id: 'gemini-3-pro-preview', name: 'gemini-3-pro-preview' },
        { id: 'gemini-1.5-pro', name: 'gemini-1.5-pro' },
      ],
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      models: [
        { id: 'gpt-4o', name: 'gpt-4o' },
        { id: 'gpt-4-turbo', name: 'gpt-4-turbo' },
        { id: 'gpt-3.5-turbo', name: 'gpt-3.5-turbo' },
      ],
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: '🧠',
      models: [
        { id: 'claude-3-opus', name: 'claude-3-opus' },
        { id: 'claude-3-sonnet', name: 'claude-3-sonnet' },
        { id: 'claude-3-haiku', name: 'claude-3-haiku' },
      ],
    },
    {
      id: 'ollama',
      name: 'Ollama (Local)',
      icon: '🦙',
      models: [
        { id: 'llama3', name: 'llama3' },
        { id: 'mistral', name: 'mistral' },
        { id: 'gemma', name: 'gemma' },
      ],
    },
  ],
  image: [
    {
      id: 'midjourney',
      name: 'Midjourney',
      icon: '🎨',
      models: [
        { id: 'V6.0', name: 'V6.0' },
        { id: 'Niji 6', name: 'Niji 6' },
        { id: 'V5.2', name: 'V5.2' },
      ],
    },
    {
      id: 'dall-e',
      name: 'DALL-E',
      icon: '🖼',
      models: [
        { id: 'dall-e-3', name: 'dall-e-3' },
        { id: 'dall-e-2', name: 'dall-e-2' },
      ],
    },
    {
      id: 'stable-diffusion',
      name: 'Stability AI',
      icon: '🧩',
      models: [
        { id: 'sd3', name: 'sd3' },
        { id: 'sdxl-turbo', name: 'sdxl-turbo' },
      ],
    },
  ],
  video: [
    {
      id: 'runway',
      name: 'Runway',
      icon: '🎬',
      models: [
        { id: 'gen-3-alpha', name: 'gen-3-alpha' },
        { id: 'gen-2', name: 'gen-2' },
      ],
    },
    {
      id: 'luma',
      name: 'Luma Dream',
      icon: '🌙',
      models: [{ id: 'dream-machine', name: 'dream-machine' }],
    },
  ],
  speech: [
    {
      id: 'openai',
      name: 'OpenAI TTS',
      icon: '🎤',
      models: [
        { id: 'tts-1', name: 'tts-1' },
        { id: 'tts-1-hd', name: 'tts-1-hd' },
      ],
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      icon: '🗣',
      models: [{ id: 'multilingual-v2', name: 'multilingual-v2' }],
    },
  ],
  music: [
    {
      id: 'suno',
      name: 'Suno',
      icon: '🎵',
      models: [
        { id: 'v3', name: 'v3' },
        { id: 'v3.5', name: 'v3.5' },
      ],
    },
    {
      id: 'udio',
      name: 'Udio',
      icon: '🎶',
      models: [{ id: 'beta-v1', name: 'beta-v1' }],
    },
  ],
  soundEffect: [
    {
      id: 'elevenlabs',
      name: 'ElevenLabs SFX',
      icon: '🔊',
      models: [
        { id: 'sound-effects-v1', name: 'sound-effects-v1' },
        { id: 'sound-effects-v2', name: 'sound-effects-v2' },
      ],
    },
    {
      id: 'stability-ai',
      name: 'Stability Audio',
      icon: '🎚',
      models: [
        { id: 'stable-audio-2', name: 'stable-audio-2' },
        { id: 'stable-audio-open-small', name: 'stable-audio-open-small' },
      ],
    },
    {
      id: 'openai',
      name: 'OpenAI Audio',
      icon: '🎛',
      models: [{ id: 'gpt-4o-mini-tts', name: 'gpt-4o-mini-tts' }],
    },
  ],
};

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2048;

interface EditableModelConfig {
  enabled: boolean;
  mode: 'cloud' | 'local';
  provider: string;
  modelName: string;
  apiKey: string;
  endpoint: string;
  temperature: number;
  maxTokens: number;
}

const clampTemperature = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_TEMPERATURE;
  return Math.min(2, Math.max(0, value));
};

const normalizeMaxTokens = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_MAX_TOKENS;
  return Math.min(32768, Math.max(1, Math.round(value)));
};

const createEditableConfig = (
  providers: ModelChannelOption[],
  source?: Partial<ModelConfigItem>
): EditableModelConfig => {
  const safeProviders = providers.length > 0 ? providers : DOMAIN_PROVIDERS.text;
  const firstProvider = safeProviders[0];
  const provider =
    safeProviders.find((item) => item.id === source?.provider) ||
    firstProvider;
  const selectedModelId = source?.modelName || '';
  const modelExists = provider?.models.some((item) => item.id === selectedModelId);
  const fallbackModelId = provider?.models[0]?.id || selectedModelId || 'default-model';

  return {
    enabled: source?.enabled ?? true,
    mode: source?.mode === 'local' ? 'local' : 'cloud',
    provider: provider?.id || source?.provider || 'gemini',
    modelName: modelExists ? selectedModelId : fallbackModelId,
    apiKey: source?.apiKey || '',
    endpoint: source?.endpoint || '',
    temperature: clampTemperature(source?.temperature ?? DEFAULT_TEMPERATURE),
    maxTokens: normalizeMaxTokens(source?.maxTokens ?? DEFAULT_MAX_TOKENS),
  };
};

export const ModelConfigDetailPage: React.FC<ModelConfigDetailPageProps> = ({
  t,
  domain = 'text',
  title = '',
  onBack,
}) => {
  const { config: settingsConfig, updateAIConfig, t: settingsT } = useSettings();
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

  const [config, setConfig] = useState<EditableModelConfig>(() =>
    createEditableConfig(DOMAIN_PROVIDERS.text)
  );
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentProviders = useMemo(() => DOMAIN_PROVIDERS[domain] || DOMAIN_PROVIDERS.text, [domain]);

  useEffect(() => {
    const domainConfig = (settingsConfig?.aiConfig as Record<string, ModelConfigItem | undefined> | undefined)?.[domain];
    setConfig(createEditableConfig(currentProviders, domainConfig));
    setLoading(false);
  }, [currentProviders, domain, settingsConfig?.aiConfig]);

  const selectedProvider = currentProviders.find((item) => item.id === config.provider) || currentProviders[0];
  const selectedModel =
    selectedProvider?.models.find((item) => item.id === config.modelName) ||
    currentProviders.flatMap((item) => item.models).find((item) => item.id === config.modelName);

  const handleSave = async () => {
    if (isSaving) return;
    const validation = validateModelConfigInput({
      enabled: config.enabled,
      mode: config.mode,
      apiKey: config.apiKey,
      endpoint: config.endpoint,
    });
    if (!validation.ok) {
      if (validation.reason === 'missing-api-key') {
        Toast.info(tr('settings.model_config.api_key_required', 'Please enter API Key'));
      } else {
        Toast.info(tr('settings.model_config.endpoint_required', 'Please enter endpoint URL'));
      }
      return;
    }

    setIsSaving(true);
    Toast.loading(tr('settings.model_config.saving', 'Saving...'));
    try {
      const payload: ModelConfigItem = {
        ...config,
        apiKey: config.apiKey.trim(),
        endpoint: config.endpoint.trim(),
        temperature: clampTemperature(config.temperature),
        maxTokens: normalizeMaxTokens(config.maxTokens),
      };
      await updateAIConfig(domain as any, payload);
      Toast.success(tr('settings.model_config.saved', 'Configuration updated'));
      onBack?.();
    } catch {
      Toast.error(tr('settings.model_config.save_failed', 'Failed to save configuration'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaxTokensChange = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      updateField('maxTokens', DEFAULT_MAX_TOKENS);
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) return;
    updateField('maxTokens', normalizeMaxTokens(parsed));
  };

  const isLocal = config.mode === 'local';
  const baseUrlPlaceholder = isLocal
    ? tr('settings.model_config.base_url_placeholder_local', 'http://localhost:11434')
    : tr('settings.model_config.base_url_placeholder_cloud', 'https://api.openai.com/v1');

  if (loading) {
    return <div style={{ height: '100%', background: 'var(--bg-body)' }} />;
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
      <Navbar title={title || tr('settings.model_config.title', 'Model Configuration')} onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <CellGroup title={tr('settings.model_config.mode_title', 'Run Mode')}>
          <div style={{ padding: '10px 16px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '6px', display: 'flex', border: '0.5px solid var(--border-color)' }}>
              <div
                onClick={() => updateField('mode', 'cloud')}
                style={{
                  flex: 1,
                  padding: '10px',
                  textAlign: 'center',
                  background: !isLocal ? 'var(--primary-color)' : 'transparent',
                  color: !isLocal ? 'white' : 'var(--text-secondary)',
                  fontWeight: !isLocal ? 600 : 400,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {tr('settings.model_config.mode_cloud', 'Cloud API')}
              </div>
              <div
                onClick={() => updateField('mode', 'local')}
                style={{
                  flex: 1,
                  padding: '10px',
                  textAlign: 'center',
                  background: isLocal ? 'var(--primary-color)' : 'transparent',
                  color: isLocal ? 'white' : 'var(--text-secondary)',
                  fontWeight: isLocal ? 600 : 400,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {tr('settings.model_config.mode_local', 'Local Deployment')}
              </div>
            </div>
          </div>
        </CellGroup>

        <CellGroup title={tr('settings.model_config.model_title', 'Model Selection')}>
          <CellItem
            title={tr('settings.model_config.enable_service', 'Enable service')}
            value={<Switch checked={config.enabled} onChange={(next) => updateField('enabled', next)} />}
          />
          <CellItem
            title={tr('settings.model_config.current_model', 'Current model')}
            value={`${String(selectedProvider?.icon || '🤖')} ${selectedModel?.name || config.modelName}`}
            isLink
            noBorder
            onClick={() => setShowPicker(true)}
          />
        </CellGroup>

        <CellGroup title={tr('settings.model_config.connection_title', 'Connection')}>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {tr('settings.model_config.base_url', 'Base URL')}
            </div>
            <input
              type="text"
              value={config.endpoint}
              onChange={(e) => updateField('endpoint', e.target.value)}
              placeholder={baseUrlPlaceholder}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-body)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {!isLocal && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {tr('settings.model_config.api_key', 'API Key')}
                </div>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => updateField('apiKey', e.target.value)}
                  placeholder="sk-..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-body)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </div>
        </CellGroup>

        <CellGroup title={tr('settings.model_config.default_params_title', 'Default Parameters')}>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {tr('settings.model_config.max_tokens', 'Max Tokens')}
            </div>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={32768}
              step={1}
              value={config.maxTokens}
              onChange={(e) => handleMaxTokensChange(e.target.value)}
              placeholder={tr('settings.model_config.max_tokens_placeholder', '2048')}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-body)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                {tr('settings.model_config.temperature', 'Temperature')}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{config.temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => updateField('temperature', clampTemperature(parseFloat(e.target.value)))}
              style={{ width: '100%' }}
            />
          </div>
        </CellGroup>

        <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {isLocal
            ? tr('settings.model_config.local_tip', 'Ensure your local service is running and CORS is enabled.')
            : tr('settings.model_config.cloud_tip', 'API keys are stored locally and are not uploaded to OpenChat servers.')}
        </div>
      </div>

      <div style={{ padding: '16px', background: 'var(--bg-card)', borderTop: '0.5px solid var(--border-color)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <Button block onClick={handleSave} disabled={isSaving}>
          {isSaving ? tr('settings.model_config.saving', 'Saving...') : tr('settings.model_config.save', 'Save Configuration')}
        </Button>
      </div>

      <ModelSelectorPopup
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        title={tr('settings.model_config.select_model', 'Select Model')}
        channels={currentProviders}
        initialChannelId={config.provider}
        selectedModelId={config.modelName}
        onSelect={(channelId, modelId) => {
          updateField('provider', channelId);
          updateField('modelName', modelId);
          setShowPicker(false);
        }}
      />
    </div>
  );
};

export default ModelConfigDetailPage;
