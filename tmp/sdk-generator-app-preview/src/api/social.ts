import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { BatchFollowCheckForm, ContactGroupCreateForm, ContactGroupUpdateForm, FriendRemarkUpdateForm, FriendRequestCreateForm, FriendRequestProcessForm, PlusApiResultBlockCheckVO, PlusApiResultContactFriendVO, PlusApiResultContactGroupVO, PlusApiResultContactStatsVO, PlusApiResultFollowCheckVO, PlusApiResultFollowStatsVO, PlusApiResultFollowVO, PlusApiResultFriendRequestVO, PlusApiResultListContactFriendVO, PlusApiResultListContactGroupVO, PlusApiResultListFollowCheckVO, PlusApiResultListFriendRequestVO, PlusApiResultMessageUnreadCountVO, PlusApiResultPageBlockedUserVO, PlusApiResultPageConversationVO, PlusApiResultPageFollowUserVO, PlusApiResultPagePrivateMessageVO, PlusApiResultPrivateMessageVO, PlusApiResultVoid, SendMessageForm } from '../types';


export class SocialApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 标记消息已读 */
  async markMessagesAsRead(params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/social/messages/read`), undefined, params);
  }

/** Process friend request */
  async processFriendRequest(requestId: string | number, body: FriendRequestProcessForm): Promise<PlusApiResultFriendRequestVO> {
    return this.client.put<PlusApiResultFriendRequestVO>(appApiPath(`/social/friend-requests/${requestId}/process`), body);
  }

/** Update contact group */
  async updateContactGroup(groupId: string | number, body: ContactGroupUpdateForm): Promise<PlusApiResultContactGroupVO> {
    return this.client.put<PlusApiResultContactGroupVO>(appApiPath(`/social/contact-groups/${groupId}`), body);
  }

/** Delete contact group */
  async deleteContactGroup(groupId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/social/contact-groups/${groupId}`));
  }

/** 发送私信 */
  async sendMessage(body: SendMessageForm): Promise<PlusApiResultPrivateMessageVO> {
    return this.client.post<PlusApiResultPrivateMessageVO>(appApiPath(`/social/messages`), body);
  }

/** List friend requests */
  async listFriendRequests(): Promise<PlusApiResultListFriendRequestVO> {
    return this.client.get<PlusApiResultListFriendRequestVO>(appApiPath(`/social/friend-requests`));
  }

/** Send friend request */
  async sendFriendRequest(body: FriendRequestCreateForm): Promise<PlusApiResultFriendRequestVO> {
    return this.client.post<PlusApiResultFriendRequestVO>(appApiPath(`/social/friend-requests`), body);
  }

/** 关注用户 */
  async followUser(userId: string | number): Promise<PlusApiResultFollowVO> {
    return this.client.post<PlusApiResultFollowVO>(appApiPath(`/social/follow/${userId}`));
  }

/** 取消关注 */
  async unfollowUser(userId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/social/follow/${userId}`));
  }

/** 批量检查关注状态 */
  async batchCheckFollowStatus(body: BatchFollowCheckForm): Promise<PlusApiResultListFollowCheckVO> {
    return this.client.post<PlusApiResultListFollowCheckVO>(appApiPath(`/social/follow/check/batch`), body);
  }

/** List contact groups */
  async listContactGroups(): Promise<PlusApiResultListContactGroupVO> {
    return this.client.get<PlusApiResultListContactGroupVO>(appApiPath(`/social/contact-groups`));
  }

/** Create contact group */
  async createContactGroup(body: ContactGroupCreateForm): Promise<PlusApiResultContactGroupVO> {
    return this.client.post<PlusApiResultContactGroupVO>(appApiPath(`/social/contact-groups`), body);
  }

/** 拉黑用户 */
  async blockUser(userId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/social/block/${userId}`));
  }

/** 取消拉黑 */
  async unblockUser(userId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/social/block/${userId}`));
  }

/** Update friend remark */
  async updateFriendRemark(contactId: string | number, body: FriendRemarkUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.patch<PlusApiResultVoid>(appApiPath(`/social/contacts/${contactId}/remark`), body);
  }

/** 获取关注统计 */
  async getFollowStats(): Promise<PlusApiResultFollowStatsVO> {
    return this.client.get<PlusApiResultFollowStatsVO>(appApiPath(`/social/stats`));
  }

/** 获取未读消息数 */
  async getUnreadMessageCount(): Promise<PlusApiResultMessageUnreadCountVO> {
    return this.client.get<PlusApiResultMessageUnreadCountVO>(appApiPath(`/social/messages/unread/count`));
  }

/** 获取关注列表 */
  async getFollowingList(params?: QueryParams): Promise<PlusApiResultPageFollowUserVO> {
    return this.client.get<PlusApiResultPageFollowUserVO>(appApiPath(`/social/following`), params);
  }

/** 获取粉丝列表 */
  async getFollowerList(params?: QueryParams): Promise<PlusApiResultPageFollowUserVO> {
    return this.client.get<PlusApiResultPageFollowUserVO>(appApiPath(`/social/followers`), params);
  }

/** 检查关注状态 */
  async checkFollowStatus(params?: QueryParams): Promise<PlusApiResultFollowCheckVO> {
    return this.client.get<PlusApiResultFollowCheckVO>(appApiPath(`/social/follow/check`), params);
  }

/** 获取会话列表 */
  async getConversations(params?: QueryParams): Promise<PlusApiResultPageConversationVO> {
    return this.client.get<PlusApiResultPageConversationVO>(appApiPath(`/social/conversations`), params);
  }

/** 获取会话消息 */
  async getConversationMessages(userId: string | number, params?: QueryParams): Promise<PlusApiResultPagePrivateMessageVO> {
    return this.client.get<PlusApiResultPagePrivateMessageVO>(appApiPath(`/social/conversations/${userId}/messages`), params);
  }

/** List contacts */
  async listContacts(params?: QueryParams): Promise<PlusApiResultListContactFriendVO> {
    return this.client.get<PlusApiResultListContactFriendVO>(appApiPath(`/social/contacts`), params);
  }

/** Get contact detail */
  async getContactDetail(contactId: string | number): Promise<PlusApiResultContactFriendVO> {
    return this.client.get<PlusApiResultContactFriendVO>(appApiPath(`/social/contacts/${contactId}`));
  }

/** Delete contact */
  async deleteContact(contactId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/social/contacts/${contactId}`));
  }

/** Get contact stats */
  async getContactStats(): Promise<PlusApiResultContactStatsVO> {
    return this.client.get<PlusApiResultContactStatsVO>(appApiPath(`/social/contacts/stats`));
  }

/** 获取黑名单 */
  async getBlockedUsers(params?: QueryParams): Promise<PlusApiResultPageBlockedUserVO> {
    return this.client.get<PlusApiResultPageBlockedUserVO>(appApiPath(`/social/blocks`), params);
  }

/** 检查黑名单状态 */
  async checkBlockStatus(params?: QueryParams): Promise<PlusApiResultBlockCheckVO> {
    return this.client.get<PlusApiResultBlockCheckVO>(appApiPath(`/social/block/check`), params);
  }

/** 删除会话 */
  async deleteConversation(userId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/social/conversations/${userId}`));
  }
}

export function createSocialApi(client: HttpClient): SocialApi {
  return new SocialApi(client);
}
