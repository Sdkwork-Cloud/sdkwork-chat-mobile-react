import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { ChatExportForm, ChatMessageSendForm, ChatSessionCreateForm, ChatSessionUpdateForm, PlusApiResultChatMessageVO, PlusApiResultChatSessionDetailVO, PlusApiResultChatSessionVO, PlusApiResultExportVO, PlusApiResultPageChatMessageVO, PlusApiResultPageChatSessionVO, PlusApiResultVoid } from '../types';


export class ChatApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取会话详情 */
  async getSessionDetail(sessionId: string | number): Promise<PlusApiResultChatSessionDetailVO> {
    return this.client.get<PlusApiResultChatSessionDetailVO>(appApiPath(`/chat/sessions/${sessionId}`));
  }

/** 更新会话 */
  async updateSession(sessionId: string | number, body: ChatSessionUpdateForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/chat/sessions/${sessionId}`), body);
  }

/** 删除会话 */
  async deleteSession(sessionId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/chat/sessions/${sessionId}`));
  }

/** 获取会话列表 */
  async listSessions(params?: QueryParams): Promise<PlusApiResultPageChatSessionVO> {
    return this.client.get<PlusApiResultPageChatSessionVO>(appApiPath(`/chat/sessions`), params);
  }

/** 创建对话会话 */
  async createSession(body: ChatSessionCreateForm): Promise<PlusApiResultChatSessionVO> {
    return this.client.post<PlusApiResultChatSessionVO>(appApiPath(`/chat/sessions`), body);
  }

/** 停止生成 */
  async stopGeneration(sessionId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/chat/sessions/${sessionId}/stop`));
  }

/** 获取消息历史 */
  async getMessageHistory(sessionId: string | number, params?: QueryParams): Promise<PlusApiResultPageChatMessageVO> {
    return this.client.get<PlusApiResultPageChatMessageVO>(appApiPath(`/chat/sessions/${sessionId}/messages`), params);
  }

/** 发送消息 */
  async sendMessage(sessionId: string | number, body: ChatMessageSendForm): Promise<PlusApiResultChatMessageVO> {
    return this.client.post<PlusApiResultChatMessageVO>(appApiPath(`/chat/sessions/${sessionId}/messages`), body);
  }

/** 重新生成 */
  async regenerateMessage(sessionId: string | number, messageId: string | number): Promise<PlusApiResultChatMessageVO> {
    return this.client.post<PlusApiResultChatMessageVO>(appApiPath(`/chat/sessions/${sessionId}/messages/${messageId}/regenerate`));
  }

/** 收藏消息 */
  async favoriteMessage(sessionId: string | number, messageId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/chat/sessions/${sessionId}/messages/${messageId}/favorite`));
  }

/** 取消收藏消息 */
  async unfavoriteMessage(sessionId: string | number, messageId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/chat/sessions/${sessionId}/messages/${messageId}/favorite`));
  }

/** 流式发送消息 */
  async sendMessageStream(sessionId: string | number, body: ChatMessageSendForm): Promise<void> {
    return this.client.post<void>(appApiPath(`/chat/sessions/${sessionId}/messages/stream`), body);
  }

/** 导出对话 */
  async exportConversation(sessionId: string | number, body: ChatExportForm): Promise<PlusApiResultExportVO> {
    return this.client.post<PlusApiResultExportVO>(appApiPath(`/chat/sessions/${sessionId}/export`), body);
  }

/** 复制对话 */
  async copySession(sessionId: string | number): Promise<PlusApiResultChatSessionVO> {
    return this.client.post<PlusApiResultChatSessionVO>(appApiPath(`/chat/sessions/${sessionId}/copy`));
  }
}

export function createChatApi(client: HttpClient): ChatApi {
  return new ChatApi(client);
}
