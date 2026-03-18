import React from 'react';
import { CellGroup, CellItem, Page, Toast, Switch } from '@sdkwork/react-mobile-commons';
import { resolveSessionAgent } from '../config/agentRegistry';
import { useChatStoreActions, useChatStoreState } from '../stores/chatStore';
import { chatService } from '../services/ChatService';
import { AvatarGrid } from '../components/ChatDetail/AvatarGrid';
import { resolveSessionDisplayName } from '../utils/resolveSessionDisplayName';
import './ChatDetailsPage.css';

interface ChatDetailsPageProps {
  t?: (key: string) => string;
  sessionId: string;
  onBack?: () => void;
  onNavigateToFiles?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToBackground?: () => void;
  onNavigateToGroupJoin?: () => void;
  onNavigateToQRCode?: (payload: {
    type: 'user' | 'group' | 'agent';
    entityId?: string;
    name?: string;
  }) => void;
  onDeleteSession?: () => void;
}

export const ChatDetailsPage: React.FC<ChatDetailsPageProps> = ({
  t,
  sessionId,
  onBack,
  onNavigateToFiles,
  onNavigateToSearch,
  onNavigateToBackground,
  onNavigateToGroupJoin,
  onNavigateToQRCode,
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
      <Page title={tr('chat.details', '\u804a\u5929\u8be6\u60c5')} showBack onBack={onBack}>
        <div className="chat-details-page__not-found">{tr('chat.session_not_found', 'Session not found')}</div>
      </Page>
    );
  }

  const agent = isGroup ? null : resolveSessionAgent(session);
  const displayAvatar = isGroup ? '\ud83e\udd1d' : (agent?.avatar || '\ud83e\udd16');
  const displayName = resolveSessionDisplayName(session, {
    fallback: 'OpenChat',
    groupFallback: tr('chat.group', 'Group'),
  });
  const qrCodeType: 'user' | 'group' | 'agent' = isGroup ? 'group' : (session.type === 'agent' ? 'agent' : 'user');
  const qrCodeTitle = isGroup
    ? tr('chat.group_qrcode', '\u7fa4\u4e8c\u7ef4\u7801')
    : qrCodeType === 'agent'
      ? tr('chat.agent_qrcode', '\u667a\u80fd\u4f53\u4e8c\u7ef4\u7801')
      : tr('chat.user_qrcode', '\u4e2a\u4eba\u4e8c\u7ef4\u7801');

  const handleNavigateToQRCode = () => {
    if (!onNavigateToQRCode) {
      Toast.info(tr('chat.demo_qrcode', 'QR code preview in demo'));
      return;
    }

    onNavigateToQRCode?.({
      type: qrCodeType,
      entityId: qrCodeType === 'agent' ? session.agentId : session.id,
      name: displayName,
    });
  };

  const handlePin = async (val: boolean) => {
    await togglePin(session.id);
    Toast.success(val ? tr('chat.pinned', 'Pinned') : tr('chat.unpinned', 'Unpinned'));
  };

  const handleMute = async (val: boolean) => {
    await toggleMute(session.id);
    Toast.success(val ? tr('chat.muted', 'Muted') : tr('chat.unmuted', 'Unmuted'));
  };

  const handleAvatarToggle = async (val: boolean) => {
    await updateSessionConfig(session.id, { showAvatar: val });
  };

  const handleClearHistory = async () => {
    if (window.confirm(tr('chat.confirm_clear', 'Clear all messages in this chat?'))) {
      await clearSessionMessages(session.id);
      Toast.success(tr('chat.cleared', 'Cleared'));
    }
  };

  const handleDeleteSession = async () => {
    if (window.confirm(tr('chat.confirm_delete', 'Deleting will clear all messages in this chat. Continue?'))) {
      await deleteSession(session.id);
      onDeleteSession?.();
    }
  };

  const handleAddMember = async () => {
    Toast.info(tr('chat.demo_create_group_not_supported', 'Creating a new group is not supported yet'));
  };

  const handleRemoveMember = async () => {
    Toast.info(tr('chat.demo_remove_member', 'Remove member is demo only'));
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

  return (
    <Page
      title={isGroup ? `${tr('chat.group_info', '\u7fa4\u804a\u4fe1\u606f')}(${session.memberIds?.length || 1})` : tr('chat.details', '\u804a\u5929\u8be6\u60c5')}
      showBack
      onBack={onBack}
      noPadding
      background="var(--bg-body)"
    >
      <div className="chat-details-page">
        <div className="chat-details-page__members">
          <AvatarGrid
            memberIds={session.memberIds || []}
            agentAvatar={displayAvatar}
            agentName={displayName}
            isGroup={isGroup}
            onAdd={handleAddMember}
            onRemove={isGroup ? handleRemoveMember : undefined}
          />
        </div>

        {isGroup ? (
          <CellGroup>
            <CellItem title={tr('chat.group_name', '\u7fa4\u804a\u540d\u79f0')} value={session.groupName} isLink onClick={handleEditName} />
            <CellItem title={qrCodeTitle} isLink onClick={handleNavigateToQRCode} />
            <CellItem
              title={tr('chat.group_join_center', '\u52a0\u7fa4\u4e0e\u4ed8\u8d39')}
              value={tr('chat.group_join_entry_hint', '\u652f\u6301\u4ed8\u8d39\u5165\u7fa4')}
              isLink
              onClick={onNavigateToGroupJoin}
            />
            <CellItem
              title={tr('chat.group_announcement', 'Group announcement')}
              value={session.groupAnnouncement || tr('chat.not_set', 'Not set')}
              isLink
              onClick={() => Toast.info(tr('chat.demo_announcement', 'Announcement edit in demo'))}
            />
            <CellItem title={tr('chat.my_nickname', 'My nickname in this group')} value="AI User" isLink noBorder onClick={handleMyAlias} />
          </CellGroup>
        ) : (
          <CellGroup>
            <CellItem title={tr('chat.recommend', 'Recommend to a friend')} isLink onClick={handleShareContact} />
            <CellItem title={qrCodeTitle} isLink noBorder onClick={handleNavigateToQRCode} />
          </CellGroup>
        )}

        <CellGroup>
          <CellItem title={tr('chat.search_content', '\u67e5\u627e\u804a\u5929\u5185\u5bb9')} isLink onClick={onNavigateToSearch} />
          <CellItem title={tr('chat.media_files', '\u56fe\u7247\u4e0e\u6587\u4ef6')} isLink noBorder onClick={onNavigateToFiles} />
        </CellGroup>

        <CellGroup>
          <CellItem title={tr('chat.mute', 'Mute notifications')} value={<Switch checked={!!session.isMuted} onChange={handleMute} />} />
          <CellItem title={tr('chat.pin', '\u7f6e\u9876\u804a\u5929')} value={<Switch checked={!!session.isPinned} onChange={handlePin} />} />
          <CellItem
            title={tr('chat.strong_alert', 'Strong alert')}
            value={<Switch checked={false} onChange={() => Toast.info(tr('chat.demo_strong_alert', 'Strong alert enabled'))} />}
            noBorder
          />
        </CellGroup>

        <CellGroup>
          <CellItem
            title={tr('chat.set_background', '\u804a\u5929\u80cc\u666f')}
            value={session.sessionConfig?.backgroundImage ? tr('chat.set', 'Set') : ''}
            isLink
            onClick={onNavigateToBackground}
          />
          {!isGroup ? (
            <CellItem
              title={tr('chat.show_avatar', '\u663e\u793a\u5934\u50cf')}
              value={<Switch checked={!!session.sessionConfig?.showAvatar} onChange={handleAvatarToggle} />}
              noBorder
            />
          ) : null}
        </CellGroup>

        <CellGroup>
          <CellItem title={tr('chat.clear_history', '\u6e05\u7a7a\u804a\u5929\u8bb0\u5f55')} isLink onClick={handleClearHistory} />
          <CellItem title={tr('chat.report', '\u6295\u8bc9')} isLink noBorder onClick={() => Toast.info(tr('chat.demo_report', 'Report in demo'))} />
        </CellGroup>

        <CellGroup>
          <CellItem
            title={isGroup ? tr('chat.delete_and_exit', 'Delete and exit') : tr('chat.delete_chat', 'Delete chat')}
            danger
            center
            noBorder
            onClick={handleDeleteSession}
          />
        </CellGroup>
      </div>
    </Page>
  );
};

export default ChatDetailsPage;
