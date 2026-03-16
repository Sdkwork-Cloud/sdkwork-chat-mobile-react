import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultTradeTaskPageVO, PlusApiResultTradeTaskVO, TradeTaskAcceptForm, TradeTaskApproveForm, TradeTaskCancelForm, TradeTaskSubmitForm } from '../types';


export class TradeTaskApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** List available trade tasks */
  async listTasks(params?: QueryParams): Promise<PlusApiResultTradeTaskPageVO> {
    return this.client.get<PlusApiResultTradeTaskPageVO>(appApiPath(`/trade/tasks`), params);
  }

/** Get trade task detail */
  async getTaskDetail(taskId: string | number): Promise<PlusApiResultTradeTaskVO> {
    return this.client.get<PlusApiResultTradeTaskVO>(appApiPath(`/trade/tasks/${taskId}`));
  }

/** Accept task */
  async acceptTask(taskId: string | number, body: TradeTaskAcceptForm): Promise<PlusApiResultTradeTaskVO> {
    return this.client.post<PlusApiResultTradeTaskVO>(appApiPath(`/trade/tasks/${taskId}/accept`), body);
  }

/** Submit task delivery */
  async submitTask(taskId: string | number, body: TradeTaskSubmitForm): Promise<PlusApiResultTradeTaskVO> {
    return this.client.post<PlusApiResultTradeTaskVO>(appApiPath(`/trade/tasks/${taskId}/submit`), body);
  }

/** Approve or reject task */
  async approveTask(taskId: string | number, body: TradeTaskApproveForm): Promise<PlusApiResultTradeTaskVO> {
    return this.client.post<PlusApiResultTradeTaskVO>(appApiPath(`/trade/tasks/${taskId}/approve`), body);
  }

/** Cancel task */
  async cancelTask(taskId: string | number, body: TradeTaskCancelForm): Promise<PlusApiResultTradeTaskVO> {
    return this.client.post<PlusApiResultTradeTaskVO>(appApiPath(`/trade/tasks/${taskId}/cancel`), body);
  }

/** List tasks published by current user */
  async listPublishedTasks(params?: QueryParams): Promise<PlusApiResultTradeTaskPageVO> {
    return this.client.get<PlusApiResultTradeTaskPageVO>(appApiPath(`/trade/tasks/published`), params);
  }

/** List tasks accepted by current user */
  async listAcceptedTasks(params?: QueryParams): Promise<PlusApiResultTradeTaskPageVO> {
    return this.client.get<PlusApiResultTradeTaskPageVO>(appApiPath(`/trade/tasks/accepted`), params);
  }
}

export function createTradeTaskApi(client: HttpClient): TradeTaskApi {
  return new TradeTaskApi(client);
}
