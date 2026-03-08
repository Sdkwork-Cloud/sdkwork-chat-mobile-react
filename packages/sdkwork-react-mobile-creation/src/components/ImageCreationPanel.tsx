import React, { useMemo, useState } from 'react';
import { ModelSelectorPopup, Switch, type ModelChannelOption } from '@sdkwork/react-mobile-commons';
import { CreationPanelShell } from './CreationPanelShell';

interface ImageCreationPayload {
  title: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  model: string;
  hd: boolean;
}

interface ImageCreationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: ImageCreationPayload) => Promise<void> | void;
}

const styleOptions = ['通用', '摄影', '动漫', '赛博', '油画', '像素', '3D'];
const ratioOptions = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const modelChannels: ModelChannelOption[] = [
  {
    id: 'midjourney',
    name: 'Midjourney',
    icon: 'M',
    models: [{ id: 'midjourney-v6', name: 'Midjourney V6' }],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'O',
    models: [{ id: 'dall-e-3', name: 'DALL-E 3' }],
  },
  {
    id: 'google',
    name: 'Google',
    icon: 'G',
    models: [{ id: 'imagen-3', name: 'Imagen 3' }],
  },
  {
    id: 'stability',
    name: 'Stability',
    icon: 'S',
    models: [{ id: 'sdxl-turbo', name: 'SDXL Turbo' }],
  },
];

export const ImageCreationPanel: React.FC<ImageCreationPanelProps> = ({ visible, onClose, onSubmit }) => {
  const defaultChannel = modelChannels[0];
  const defaultModelId = defaultChannel.models[0]?.id || 'midjourney-v6';

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(styleOptions[0]);
  const [ratio, setRatio] = useState(ratioOptions[0]);
  const [provider, setProvider] = useState(defaultChannel.id);
  const [model, setModel] = useState(defaultModelId);
  const [hd, setHd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);

  const disabled = useMemo(() => !prompt.trim() || submitting, [prompt, submitting]);
  const selectedModel = useMemo(
    () => modelChannels.flatMap((channel) => channel.models).find((item) => item.id === model),
    [model],
  );

  const handleSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: prompt.slice(0, 18) || '未命名图片',
        prompt,
        style,
        aspectRatio: ratio,
        model: selectedModel?.name || model,
        hd,
      });
      onClose();
      setPrompt('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreationPanelShell
      visible={visible}
      title="AI 图片创作"
      onClose={onClose}
      footer={(
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          style={{
            width: '100%',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? 'var(--text-secondary)' : 'white',
            background: disabled ? 'var(--bg-cell-active)' : 'var(--primary-gradient)',
          }}
        >
          {submitting ? '正在生成...' : `生成图片 · ${selectedModel?.name || model}`}
        </button>
      )}
    >
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
        画面描述
      </label>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="例如：赛博朋克风格的雨夜街道，霓虹灯反射，电影级光影..."
        style={{
          width: '100%',
          minHeight: '110px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-body)',
          color: 'var(--text-primary)',
          padding: '12px',
          resize: 'vertical',
          outline: 'none',
          fontSize: '14px',
          marginBottom: '16px',
        }}
      />

      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>艺术风格</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {styleOptions.map((option) => {
            const active = style === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setStyle(option)}
                style={{
                  border: active ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                  background: active ? 'rgba(41,121,255,0.12)' : 'var(--bg-card)',
                  color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>比例</span>
          <select
            value={ratio}
            onChange={(event) => setRatio(event.target.value)}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              height: '36px',
              background: 'var(--bg-body)',
              color: 'var(--text-primary)',
              padding: '0 10px',
            }}
          >
            {ratioOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>模型</span>
          <button
            type="button"
            onClick={() => setShowModelSelector(true)}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              height: '36px',
              background: 'var(--bg-body)',
              color: 'var(--text-primary)',
              padding: '0 10px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {selectedModel?.name || model}
          </button>
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderRadius: '12px',
          border: '0.5px solid var(--border-color)',
          background: 'var(--bg-body)',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>高清增强 (Hires Fix)</span>
        <Switch checked={hd} onChange={setHd} />
      </div>

      <ModelSelectorPopup
        visible={showModelSelector}
        title="选择模型"
        channels={modelChannels}
        initialChannelId={provider}
        selectedModelId={model}
        onClose={() => setShowModelSelector(false)}
        onSelect={(channelId, modelId) => {
          setProvider(channelId);
          setModel(modelId);
          setShowModelSelector(false);
        }}
      />
    </CreationPanelShell>
  );
};

export default ImageCreationPanel;
