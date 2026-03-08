import React, { useMemo, useState } from 'react';
import { ModelSelectorPopup, type ModelChannelOption } from '@sdkwork/react-mobile-commons';
import { CreationPanelShell } from './CreationPanelShell';

interface VideoCreationPayload {
  title: string;
  prompt: string;
  ratio: string;
  duration: number;
  model: string;
}

interface VideoCreationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: VideoCreationPayload) => Promise<void> | void;
}

const ratioOptions = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'];
const durationOptions = [4, 5, 6, 8, 10, 12];
const modelChannels: ModelChannelOption[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'O',
    models: [{ id: 'sora-turbo', name: 'Sora Turbo' }],
  },
  {
    id: 'runway',
    name: 'Runway',
    icon: 'R',
    models: [{ id: 'runway-gen-3', name: 'Runway Gen-3' }],
  },
  {
    id: 'google',
    name: 'Google',
    icon: 'G',
    models: [{ id: 'veo-2', name: 'Veo 2' }],
  },
  {
    id: 'pika',
    name: 'Pika',
    icon: 'P',
    models: [{ id: 'pika-1.0', name: 'Pika 1.0' }],
  },
];

export const VideoCreationPanel: React.FC<VideoCreationPanelProps> = ({ visible, onClose, onSubmit }) => {
  const defaultChannel = modelChannels[0];
  const defaultModelId = defaultChannel.models[0]?.id || 'sora-turbo';

  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('16:9');
  const [duration, setDuration] = useState(5);
  const [provider, setProvider] = useState(defaultChannel.id);
  const [model, setModel] = useState(defaultModelId);
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
        title: prompt.slice(0, 18) || '未命名视频',
        prompt,
        ratio,
        duration,
        model: selectedModel?.name || model,
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
      title="AI 视频创作"
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
          {submitting ? '正在生成...' : `生成视频 · ${duration}s · ${selectedModel?.name || model}`}
        </button>
      )}
    >
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
        视频脚本
      </label>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="例如：一个机器人在未来城市穿梭，镜头推进，霓虹灯流光特效..."
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
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
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>时长</span>
          <select
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              height: '36px',
              background: 'var(--bg-body)',
              color: 'var(--text-primary)',
              padding: '0 10px',
            }}
          >
            {durationOptions.map((option) => (
              <option key={option} value={option}>
                {option} 秒
              </option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>模型引擎</span>
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

export default VideoCreationPanel;
