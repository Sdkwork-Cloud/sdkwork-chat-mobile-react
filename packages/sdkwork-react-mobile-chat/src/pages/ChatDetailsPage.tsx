import React from 'react';
import { Page, Toast, Switch } from '@sdkwork/react-mobile-commons';
import { useChatStoreActions, useChatStoreState } from '../stores/chatStore';
import { chatService } from '../services/ChatService';
import { AvatarGrid } from '../components/ChatDetail/AvatarGrid';

interface ChatDetailsPageProps {
  t?: (key: string) => string;
  sessionId: string;
  onBack?: () => void;
  onNavigateToFiles?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToBackground?: () => void;
  onDeleteSession?: () => void;
}

export const ChatDetailsPage: React.FC<ChatDetailsPageProps> = ({
  t,
  sessionId,
  onBack,
  onNavigateToFiles,
  onNavigateToSearch,
  onNavigateToBackground,
  onDeleteSession,
}) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const { getSession } = useChatStoreState();
  const { deleteSession, togglePin, toggleMute, clearSessionMessages, updateSessionConfig } = useChatStoreActions();

  const session = getSession(sessionId);
  const isGroup = session?.type === 'group';

  if (!session) {
    return (
      <Page title={tr('chat.details', '聊天详情')} showBack onBack={onBack}>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {tr('chat.session_not_found', 'Session not found')}
        </div>
      </Page>
    );
  }

  const displayAvatar = isGroup ? '👥' : '🤖';
  const displayName = isGroup ? (session.groupName || '群聊') : 'AI Assistant';

  const handlePin = async (val: boolean) => {
    await togglePin(session.id);
    Toast.success(val ? tr('chat.pinned', 'Pinned') : tr('chat.unpinned', 'Unpinned'));
  };

  const handleMute = async (val: boolean) => {
    await toggleMute(session.id);
    Toast.success(val ? tr('chat.muted', '已开启免打扰') : tr('chat.unmuted', '已关闭免打扰'));
  };

  const handleAvatarToggle = async (val: boolean) => {
    await updateSessionConfig(session.id, { showAvatar: val });
  };

  const handleClearHistory = async () => {
    if (window.confirm(tr('chat.confirm_clear', '确定清空聊天记录吗？'))) {
      await clearSessionMessages(session.id);
      Toast.success(tr('chat.cleared', 'Cleared'));
    }
  };

  const handleDeleteSession = async () => {
    if (window.confirm(tr('chat.confirm_delete', 'Deleting will clear all messages in this chat. Continue?'))) {
      await deleteSession(session.id);
      if (onDeleteSession) {
        onDeleteSession();
      }
    }
  };

  const handleAddMember = async () => {
    Toast.info(tr('chat.demo_create_group_not_supported', 'Creating a new group is not supported yet'));
  };

  const handleRemoveMember = async () => {
    Toast.info(tr('chat.demo_remove_member', '移除成员功能开发中'));
  };

  const handleEditName = async () => {
    if (!isGroup) return;
    const newName = prompt(tr('chat.edit_group_name', 'Edit group name'), session.groupName);
    if (newName && newName !== session.groupName) {
      await chatService.updateGroupInfo(session.id, { groupName: newName });
    }
  };

  const handleShareContact = () => {
    Toast.success(tr('chat.card_sent', 'Recommendation card sent'));
  };

  const handleMyAlias = () => {
    const alias = prompt(tr('chat.set_nickname', 'Set my nickname in this group'), 'AI User');
    if (alias) {
      Toast.success(tr('chat.nickname_updated', 'Nickname updated'));
    }
  };

  // Cell component for menu items
  const Cell: React.FC<{
    title: string;
    value?: React.ReactNode;
    icon?: React.ReactNode;
    isLink?: boolean;
    onClick?: () => void;
  }> = ({ title, value, icon, isLink, onClick }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        background: 'var(--bg-card)',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      {icon && <div style={{ marginRight: '12px' }}>{icon}</div>}
      <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '15px' }}>{title}</span>
      {value && <span style={{ color: 'var(--text-secondary)', fontSize: '15px', marginRight: isLink ? '4px' : 0 }}>{value}</span>}
      {isLink && <span style={{ color: 'var(--text-tertiary)' }}>{'>'}</span>}
    </div>
  );

  const CellGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ marginTop: '8px' }}>{children}</div>
  );

  return (
    <Page 
      title={isGroup ? `${tr('chat.group_info', '聊天信息')}(${session.memberIds?.length || 1})` : tr('chat.details', '聊天详情')} 
      showBack 
      onBack={onBack}
      background="var(--bg-body)"
    >
      <div style={{ minHeight: '100%', paddingBottom: '40px' }}>
        {/* 1. Member Grid */}
        <div style={{ marginTop: '1px' }}>
          <AvatarGrid
            memberIds={session.memberIds || []}
            agentAvatar={displayAvatar}
            agentName={displayName}
            isGroup={isGroup}
            onAdd={handleAddMember}
            onRemove={isGroup ? handleRemoveMember : undefined}
          />
        </div>

        {/* 2. Group Info / Contact Info */}
        {isGroup ? (
          <CellGroup>
            <Cell title={tr('chat.group_name', '群聊名称')} value={session.groupName} isLink onClick={handleEditName} />
            <Cell title={tr('chat.group_qrcode', '群二维码')} isLink onClick={() => Toast.info(tr('chat.demo_qrcode', '二维码功能开发中'))} />
            <Cell
              title={tr('chat.group_announcement', 'Group announcement')}
              value={session.groupAnnouncement || tr('chat.not_set', 'Not set')}
              isLink
              onClick={() => Toast.info(tr('chat.demo_announcement', '公告编辑开发中'))}
            />
            <Cell title={tr('chat.my_nickname', 'My nickname in this group')} value="AI User" isLink onClick={handleMyAlias} />
          </CellGroup>
        ) : (
          <CellGroup>
            <Cell title={tr('chat.recommend', 'Recommend to a friend')} isLink onClick={handleShareContact} />
          </CellGroup>
        )}

        {/* 3. Content Navigation */}
        <CellGroup>
          <Cell title={tr('chat.search_content', '查找聊天内容')} isLink onClick={onNavigateToSearch} />
          <Cell title={tr('chat.media_files', '图片、视频和文件')} isLink onClick={onNavigateToFiles} />
        </CellGroup>

        {/* 4. Chat Settings */}
        <CellGroup>
          <Cell
            title={tr('chat.mute', 'Mute notifications')}
            value={<Switch checked={!!session.isMuted} onChange={handleMute} />}
          />
          <Cell
            title={tr('chat.pin', '置顶聊天')}
            value={<Switch checked={!!session.isPinned} onChange={handlePin} />}
          />
          <Cell
            title={tr('chat.strong_alert', 'Strong alert')}
            value={<Switch checked={false} onChange={() => Toast.info(tr('chat.demo_strong_alert', 'Strong alert enabled'))} />}
          />
        </CellGroup>

        {/* 5. Customization */}
        <CellGroup>
          <Cell
            title={tr('chat.set_background', '设置当前聊天背景')}
            value={session.sessionConfig?.backgroundImage ? tr('chat.set', 'Set') : ''}
            isLink
            onClick={onNavigateToBackground}
          />
          {!isGroup && (
            <Cell
              title={tr('chat.show_avatar', '显示角色头像')}
              value={<Switch checked={!!session.sessionConfig?.showAvatar} onChange={handleAvatarToggle} />}
            />
          )}
        </CellGroup>

        {/* 6. Actions */}
        <CellGroup>
          <Cell title={tr('chat.clear_history', '清空聊天记录')} isLink onClick={handleClearHistory} />
          <Cell title={tr('chat.report', '投诉')} isLink onClick={() => Toast.info(tr('chat.demo_report', '投诉功能开发中'))} />
        </CellGroup>

        <div style={{ padding: '24px 16px' }}>
          <button
            onClick={handleDeleteSession}
            style={{
              width: '100%',
              padding: '16px',
              background: 'var(--bg-card)',
              color: 'var(--danger)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {isGroup ? tr('chat.delete_and_exit', 'Delete and exit') : tr('chat.delete_chat', 'Delete chat')}
          </button>
        </div>
      </div>
    </Page>
  );
};

export default ChatDetailsPage;
