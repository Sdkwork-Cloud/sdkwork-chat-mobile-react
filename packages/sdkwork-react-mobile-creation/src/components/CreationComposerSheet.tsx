import React from 'react';
import { Popup } from '@sdkwork/react-mobile-commons';

export type ComposerType = 'image' | 'video' | 'music';

interface CreationComposerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: ComposerType) => void;
  onImportLocal: () => void;
}

const tools: Array<{ id: ComposerType; label: string; icon: string; desc: string }> = [
  { id: 'image', label: 'AI 绘图', icon: '🎨', desc: '图像创作与风格化生成' },
  { id: 'video', label: '视频生成', icon: '🎬', desc: '文生视频与图生视频' },
  { id: 'music', label: 'AI 音乐', icon: '🎵', desc: '旋律与歌词联合创作' },
];

export const CreationComposerSheet: React.FC<CreationComposerSheetProps> = ({
  visible,
  onClose,
  onSelect,
  onImportLocal,
}) => {
  return (
    <Popup visible={visible} onClose={onClose} position="bottom" round safeArea>
      <div style={{ padding: '18px 16px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>开始创作</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>选择创作模式，快速生成你的下一件作品</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelect(tool.id)}
              style={{
                border: '0.5px solid var(--border-color)',
                borderRadius: '14px',
                background: 'var(--bg-body)',
                padding: '14px 8px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>{tool.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{tool.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{tool.desc}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onImportLocal}
          style={{
            width: '100%',
            border: '1px dashed var(--border-color)',
            borderRadius: '14px',
            background: 'var(--bg-body)',
            padding: '12px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          📤 从本地导入素材
        </button>
      </div>
    </Popup>
  );
};

export default CreationComposerSheet;
