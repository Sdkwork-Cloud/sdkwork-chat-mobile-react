import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CreateRequest, CreateSessionRequest, PlusApiResultListMapStringObject, PlusApiResultMapStringObject, PlusApiResultVoid, SendSessionMessageRequest, UpdateRequest } from '../types';


export class AgentApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Get agent */
  async get(agentId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}`));
  }

/** Update agent */
  async update(agentId: string | number, body?: UpdateRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.put<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}`), body);
  }

/** Delete agent */
  async delete(agentId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/agents/${agentId}`));
  }

/** List agents */
  async list(params?: QueryParams): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/agents`), params);
  }

/** Create agent */
  async create(body?: CreateRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/agents`), body);
  }

/** List sessions */
  async listSessions(agentId: string | number): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/agents/${agentId}/sessions`));
  }

/** Create session */
  async createSession(agentId: string | number, body?: CreateSessionRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/sessions`), body);
  }

/** Reset agent */
  async reset(agentId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/agents/${agentId}/reset`));
  }

/** List session messages */
  async listSessionMessages(sessionId: string | number): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/agents/sessions/${sessionId}/messages`));
  }

/** Send session message */
  async sendSessionMessage(sessionId: string | number, body?: SendSessionMessageRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/agents/sessions/${sessionId}/messages`), body);
  }

/** Clear session */
  async clearSession(sessionId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/agents/sessions/${sessionId}/clear`));
  }

/** Agent stats */
  async stats(agentId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/stats`));
  }

/** Delete session */
  async deleteSession(sessionId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/agents/sessions/${sessionId}`));
  }
}

export function createAgentApi(client: HttpClient): AgentApi {
  return new AgentApi(client);
}
