import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CreateKnowledgeRequest, CreatePostRequest, PlusApiResultListMapStringObject, PlusApiResultMapStringObject } from '../types';


export class AgentMemoryApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** List memories */
  async list(agentId: string | number, params?: QueryParams): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/agents/${agentId}/memory`), params);
  }

/** Create memory */
  async create(agentId: string | number, body?: CreatePostRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory`), body);
  }

/** Summarize session */
  async summarizeSession(agentId: string | number, sessionId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/sessions/${sessionId}/summarize`));
  }

/** List knowledge */
  async listKnowledge(agentId: string | number): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/agents/${agentId}/memory/knowledge`));
  }

/** Create knowledge */
  async createKnowledge(agentId: string | number, body?: CreateKnowledgeRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/knowledge`), body);
  }

/** Consolidate memories */
  async consolidate(agentId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/consolidate`));
  }

/** Memory stats */
  async stats(agentId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/stats`));
  }

/** List session history */
  async listSessionHistory(agentId: string | number, sessionId: string | number, params?: QueryParams): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/agents/${agentId}/memory/sessions/${sessionId}/history`), params);
  }

/** Search memories */
  async search(agentId: string | number, params?: QueryParams): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/agents/${agentId}/memory/search`), params);
  }

/** Get knowledge */
  async getKnowledge(agentId: string | number, documentId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/knowledge/${documentId}`));
  }

/** Delete knowledge */
  async deleteKnowledge(agentId: string | number, documentId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.delete<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/knowledge/${documentId}`));
  }

/** List knowledge chunks */
  async listKnowledgeChunks(agentId: string | number, documentId: string | number): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/agents/${agentId}/memory/knowledge/${documentId}/chunks`));
  }

/** Knowledge stats */
  async knowledgeStats(agentId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/knowledge/stats`));
  }

/** Search knowledge */
  async searchKnowledge(agentId: string | number, params?: QueryParams): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/agents/${agentId}/memory/knowledge/search`), params);
  }

/** Delete memory */
  async delete(agentId: string | number, memoryId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.delete<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/${memoryId}`));
  }

/** Clear session memories */
  async clearSession(agentId: string | number, sessionId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.delete<PlusApiResultMapStringObject>(appApiPath(`/agents/${agentId}/memory/sessions/${sessionId}`));
  }
}

export function createAgentMemoryApi(client: HttpClient): AgentMemoryApi {
  return new AgentMemoryApi(client);
}
