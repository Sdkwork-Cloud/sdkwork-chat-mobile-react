import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { DocumentBatchUpdateRequest, DocumentContentUpdateRequest, DocumentCopyRequest, DocumentCreateRequest, DocumentUpdateRequest, PlusApiResultDocumentBatchUpdateResultVO, PlusApiResultDocumentContentVO, PlusApiResultDocumentDetailVO, PlusApiResultDocumentOperationVO, PlusApiResultPageDocumentVO, PlusApiResultVoid } from '../types';


export class KnowledgeDocumentsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Restore knowledge document */
  async restoreKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.put<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}/restore`));
  }

/** Restore knowledge document */
  async updateRestoreKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.put<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/restore`));
  }

/** Get knowledge document content */
  async getKnowledgeDocumentContent(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentContentVO> {
    return this.client.get<PlusApiResultDocumentContentVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/content`));
  }

/** Update knowledge document content */
  async updateKnowledgeDocumentContent(knowledgeBaseId: string | number, documentId: string | number, body: DocumentContentUpdateRequest): Promise<PlusApiResultDocumentContentVO> {
    return this.client.put<PlusApiResultDocumentContentVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/content`), body);
  }

/** Get knowledge document content */
  async getKnowledgeDocumentContentKnowledgeBase(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentContentVO> {
    return this.client.get<PlusApiResultDocumentContentVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}/content`));
  }

/** Update knowledge document content */
  async updateKnowledgeDocumentContentKnowledgeBase(knowledgeBaseId: string | number, documentId: string | number, body: DocumentContentUpdateRequest): Promise<PlusApiResultDocumentContentVO> {
    return this.client.put<PlusApiResultDocumentContentVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}/content`), body);
  }

/** Archive knowledge document */
  async archiveKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.put<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}/archive`));
  }

/** Archive knowledge document */
  async updateArchiveKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.put<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/archive`));
  }

/** Get knowledge document detail */
  async getKnowledgeDocumentDetail(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentDetailVO> {
    return this.client.get<PlusApiResultDocumentDetailVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`));
  }

/** Update knowledge document metadata */
  async updateKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number, body: DocumentUpdateRequest): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.put<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`), body);
  }

/** Delete knowledge document */
  async deleteKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`));
  }

/** Get knowledge document detail */
  async getKnowledgeDocumentDetailKnowledgeBase(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentDetailVO> {
    return this.client.get<PlusApiResultDocumentDetailVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}`));
  }

/** Update knowledge document metadata */
  async updateKnowledgeDocumentKnowledgeBase(knowledgeBaseId: string | number, documentId: string | number, body: DocumentUpdateRequest): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.put<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}`), body);
  }

/** Delete knowledge document */
  async deleteKnowledgeDocumentKnowledgeBase(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}`));
  }

/** Favorite knowledge document */
  async favoriteKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.post<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/favorite`));
  }

/** Unfavorite knowledge document */
  async unfavoriteKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.delete<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/favorite`));
  }

/** Favorite knowledge document */
  async createFavoriteKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.post<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}/favorite`));
  }

/** Unfavorite knowledge document */
  async deleteUnfavoriteKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.delete<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}/favorite`));
  }

/** Copy knowledge document */
  async copyKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number, body: DocumentCopyRequest): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.post<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}/copy`), body);
  }

/** Copy knowledge document */
  async createCopyKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number, body: DocumentCopyRequest): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.post<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/copy`), body);
  }

/** Batch update knowledge document */
  async batchUpdateKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number, body: DocumentBatchUpdateRequest): Promise<PlusApiResultDocumentBatchUpdateResultVO> {
    return this.client.post<PlusApiResultDocumentBatchUpdateResultVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}/batch-update`), body);
  }

/** Batch update knowledge document */
  async createBatchUpdateKnowledgeDocument(knowledgeBaseId: string | number, documentId: string | number, body: DocumentBatchUpdateRequest): Promise<PlusApiResultDocumentBatchUpdateResultVO> {
    return this.client.post<PlusApiResultDocumentBatchUpdateResultVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}:batchUpdate`), body);
  }

/** Batch update knowledge document */
  async createBatchUpdateKnowledgeDocumentDocumentIdBatchUpdate(knowledgeBaseId: string | number, documentId: string | number, body: DocumentBatchUpdateRequest): Promise<PlusApiResultDocumentBatchUpdateResultVO> {
    return this.client.post<PlusApiResultDocumentBatchUpdateResultVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/${documentId}:batchUpdate`), body);
  }

/** Batch update knowledge document */
  async createBatchUpdateKnowledgeDocumentBatchUpdate(knowledgeBaseId: string | number, documentId: string | number, body: DocumentBatchUpdateRequest): Promise<PlusApiResultDocumentBatchUpdateResultVO> {
    return this.client.post<PlusApiResultDocumentBatchUpdateResultVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/${documentId}/batch-update`), body);
  }

/** List knowledge documents */
  async listKnowledgeDocuments(knowledgeBaseId: string | number, params?: QueryParams): Promise<PlusApiResultPageDocumentVO> {
    return this.client.get<PlusApiResultPageDocumentVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents`), params);
  }

/** Create knowledge document */
  async createKnowledgeDocument(knowledgeBaseId: string | number, body: DocumentCreateRequest): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.post<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents`), body);
  }

/** List knowledge documents */
  async getList(knowledgeBaseId: string | number, params?: QueryParams): Promise<PlusApiResultPageDocumentVO> {
    return this.client.get<PlusApiResultPageDocumentVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents`), params);
  }

/** Create knowledge document */
  async createKnowledgeDocumentKnowledgeBase(knowledgeBaseId: string | number, body: DocumentCreateRequest): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.post<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents`), body);
  }

/** Batch delete knowledge documents */
  async batchDelete(knowledgeBaseId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.delete<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/batch-delete`));
  }

/** Batch delete knowledge documents */
  async deleteBatch(knowledgeBaseId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.delete<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/batch`));
  }

/** Batch delete knowledge documents */
  async deleteBatchBatchDelete(knowledgeBaseId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.delete<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge_base/${knowledgeBaseId}/documents/batch-delete`));
  }

/** Batch delete knowledge documents */
  async deleteBatchDocuments(knowledgeBaseId: string | number): Promise<PlusApiResultDocumentOperationVO> {
    return this.client.delete<PlusApiResultDocumentOperationVO>(appApiPath(`/knowledge-bases/${knowledgeBaseId}/documents/batch`));
  }
}

export function createKnowledgeDocumentsApi(client: HttpClient): KnowledgeDocumentsApi {
  return new KnowledgeDocumentsApi(client);
}
