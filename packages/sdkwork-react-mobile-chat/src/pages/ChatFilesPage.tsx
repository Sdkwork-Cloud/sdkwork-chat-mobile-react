import React, { useState, useMemo } from 'react';
import { Page, Toast } from '@sdkwork/react-mobile-commons';

const TABS = [
  { key: 'media', labelKey: 'chat.media_and_video' },
  { key: 'files', labelKey: 'chat.files' },
  { key: 'links', labelKey: 'chat.links' },
];

// Mock Data
const RAW_MEDIA = Array(24).fill(null).map((_, i) => ({
  id: `img_${i}`,
  url: `https://picsum.photos/300/300?random=${i + 100}`,
  date: '2023-12-01',
  type: 'image',
}));

const RAW_FILES = [
  { id: 'f1', name: '项目需求文档 v2.0.pdf', size: '2.4 MB', date: '昨天', type: 'pdf' },
  { id: 'f2', name: 'UI 设计规范.sketch', size: '45.1 MB', date: '10月24日', type: 'sketch' },
  { id: 'f3', name: '会议纪要.docx', size: '128 KB', date: '10月20日', type: 'doc' },
  { id: 'f4', name: 'Q4 季度预算表.xlsx', size: '1.2 MB', date: '10月15日', type: 'xls' },
  { id: 'f5', name: '架构图_Final.png', size: '3.5 MB', date: '10月10日', type: 'png' },
];

const RAW_LINKS = [
  { id: 'l1', title: 'OpenAI 发布 GPT-5 预览版', url: 'https://openai.com/blog/gpt-5-preview', icon: '🔗', date: '12:30' },
  { id: 'l2', title: '前端架构现代化指南 - GitHub', url: 'https://github.com/modern/frontend', icon: '🔗', date: '昨天' },
  { id: 'l3', title: 'React 19 RC 详解', url: 'https://react.dev/blog/2024', icon: '🔗', date: '10月22日' },
];

interface ChatFilesPageProps {
  t?: (key: string) => string;
  sessionId?: string;
  onBack?: () => void;
}

export const ChatFilesPage: React.FC<ChatFilesPageProps> = ({
  t,
  sessionId: _sessionId,
  onBack,
}) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContent = useMemo(() => {
    const lowerQ = searchQuery.toLowerCase();

    if (activeTab === 0) {
      return RAW_MEDIA;
    }
    if (activeTab === 1) {
      return RAW_FILES.filter((f) => f.name.toLowerCase().includes(lowerQ));
    }
    if (activeTab === 2) {
      return RAW_LINKS.filter(
        (l) =>
          l.title.toLowerCase().includes(lowerQ) ||
          l.url.toLowerCase().includes(lowerQ)
      );
    }
    return [];
  }, [activeTab, searchQuery]);

  const handleFileClick = (file: any) => {
    Toast.info(`${tr('chat.opening', '正在打开')}: ${file.name}`);
  };

  const handleLinkClick = (link: any) => {
    window.open(link.url, '_blank');
  };

  const handleImageClick = (index: number) => {
    Toast.info(`${tr('chat.viewing_image', '查看图片')} #${index + 1}`);
  };

  const renderContent = () => {
    if (filteredContent.length === 0) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</span>
          <span>{tr('chat.no_content', '无相关内容')}</span>
        </div>
      );
    }

    if (activeTab === 0) {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2px',
          }}
        >
          {filteredContent.map((item: any, index: number) => (
            <div
              key={item.id}
              onClick={() => handleImageClick(index)}
              style={{
                aspectRatio: '1/1',
                background: '#eee',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <img
                src={item.url}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
                alt=""
              />
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 1) {
      return (
        <div style={{ background: 'var(--bg-card)' }}>
          {filteredContent.map((file: any) => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  background:
                    file.type === 'pdf'
                      ? '#ff6b6b'
                      : file.type === 'xls'
                      ? '#51cf66'
                      : '#339af0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                {file.type}
              </div>
              <div style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {file.size} · {file.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ background: 'var(--bg-card)' }}>
        {filteredContent.map((link: any) => (
          <div
            key={link.id}
            onClick={() => handleLinkClick(link)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#f0f0f0',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              {link.icon}
            </div>
            <div style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
              <div
                style={{
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.title}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.url}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '8px', flexShrink: 0 }}>
              {link.date}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Page
      title={tr('chat.chat_content', '聊天内容')}
      showBack
      onBack={onBack}
      noPadding
      background="var(--bg-body)"
    >
      {/* Search Bar */}
      <div
        style={{
          padding: '10px 16px',
          background: 'var(--bg-card)',
          borderBottom: '0.5px solid var(--border-color)',
        }}
      >
        <div
          style={{
            background: 'var(--bg-body)',
            borderRadius: '6px',
            padding: '0 12px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            placeholder={tr('common.search', '搜索')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              height: '100%',
              background: 'transparent',
              border: 'none',
              marginLeft: '8px',
              fontSize: '14px',
              outline: 'none',
              color: 'var(--text-primary)',
            }}
          />
          {searchQuery && (
            <div
              onClick={() => setSearchQuery('')}
              style={{
                padding: '4px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              ✕
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-card)',
          borderBottom: '0.5px solid var(--border-color)',
          marginBottom: '10px',
        }}
      >
        {TABS.map((tab, i) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '14px 0',
              fontSize: '14px',
              color:
                activeTab === i
                  ? 'var(--primary-color)'
                  : 'var(--text-secondary)',
              fontWeight: activeTab === i ? 600 : 400,
              position: 'relative',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            {tab.labelKey ? tr(tab.labelKey, tab.key) : tab.key}
            {activeTab === i && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '35%',
                  right: '35%',
                  height: '2px',
                  background: 'var(--primary-color)',
                  borderRadius: '2px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>{renderContent()}</div>
    </Page>
  );
};

export default ChatFilesPage;
