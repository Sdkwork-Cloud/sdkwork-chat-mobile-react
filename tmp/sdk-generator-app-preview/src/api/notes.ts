import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { NoteBatchUpdateRequest, NoteContentUpdateRequest, NoteCopyRequest, NoteCreateRequest, NoteFolderCreateRequest, NoteFolderUpdateRequest, NoteMoveRequest, NoteUpdateRequest, PlusApiResultListNoteFolderVO, PlusApiResultNoteBatchUpdateResultVO, PlusApiResultNoteContentVO, PlusApiResultNoteFolderVO, PlusApiResultNoteOperationVO, PlusApiResultNoteStatisticsVO, PlusApiResultNoteVO, PlusApiResultPageNoteVO, PlusApiResultVoid } from '../types';


export class NotesApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取笔记详情 */
  async getNoteDetail(noteId: string | number): Promise<PlusApiResultNoteVO> {
    return this.client.get<PlusApiResultNoteVO>(appApiPath(`/notes/${noteId}`));
  }

/** 更新笔记 */
  async updateNote(noteId: string | number, body: NoteUpdateRequest): Promise<PlusApiResultNoteOperationVO> {
    return this.client.put<PlusApiResultNoteOperationVO>(appApiPath(`/notes/${noteId}`), body);
  }

/** 删除笔记 */
  async deleteNote(noteId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/notes/${noteId}`));
  }

/** 恢复笔记 */
  async restoreNote(noteId: string | number): Promise<PlusApiResultNoteOperationVO> {
    return this.client.put<PlusApiResultNoteOperationVO>(appApiPath(`/notes/${noteId}/restore`));
  }

/** 移动笔记 */
  async moveNote(noteId: string | number, body: NoteMoveRequest): Promise<PlusApiResultNoteOperationVO> {
    return this.client.put<PlusApiResultNoteOperationVO>(appApiPath(`/notes/${noteId}/move`), body);
  }

/** 获取笔记正文 */
  async getNoteContent(noteId: string | number): Promise<PlusApiResultNoteContentVO> {
    return this.client.get<PlusApiResultNoteContentVO>(appApiPath(`/notes/${noteId}/content`));
  }

/** 更新笔记正文 */
  async updateNoteContent(noteId: string | number, body: NoteContentUpdateRequest): Promise<PlusApiResultNoteContentVO> {
    return this.client.put<PlusApiResultNoteContentVO>(appApiPath(`/notes/${noteId}/content`), body);
  }

/** 归档笔记 */
  async archiveNote(noteId: string | number): Promise<PlusApiResultNoteOperationVO> {
    return this.client.put<PlusApiResultNoteOperationVO>(appApiPath(`/notes/${noteId}/archive`));
  }

/** 重命名文件夹 */
  async updateFolder(folderId: string | number, body: NoteFolderUpdateRequest): Promise<PlusApiResultNoteFolderVO> {
    return this.client.put<PlusApiResultNoteFolderVO>(appApiPath(`/notes/folders/${folderId}`), body);
  }

/** 删除文件夹 */
  async deleteFolder(folderId: string | number): Promise<PlusApiResultNoteOperationVO> {
    return this.client.delete<PlusApiResultNoteOperationVO>(appApiPath(`/notes/folders/${folderId}`));
  }

/** 获取笔记列表 */
  async listNotes(params?: QueryParams): Promise<PlusApiResultPageNoteVO> {
    return this.client.get<PlusApiResultPageNoteVO>(appApiPath(`/notes`), params);
  }

/** 创建笔记 */
  async createNote(body: NoteCreateRequest): Promise<PlusApiResultNoteOperationVO> {
    return this.client.post<PlusApiResultNoteOperationVO>(appApiPath(`/notes`), body);
  }

/** 收藏笔记 */
  async favoriteNote(noteId: string | number): Promise<PlusApiResultNoteOperationVO> {
    return this.client.post<PlusApiResultNoteOperationVO>(appApiPath(`/notes/${noteId}/favorite`));
  }

/** 取消收藏 */
  async unfavoriteNote(noteId: string | number): Promise<PlusApiResultNoteOperationVO> {
    return this.client.delete<PlusApiResultNoteOperationVO>(appApiPath(`/notes/${noteId}/favorite`));
  }

/** 复制笔记 */
  async copyNote(noteId: string | number, body: NoteCopyRequest): Promise<PlusApiResultNoteOperationVO> {
    return this.client.post<PlusApiResultNoteOperationVO>(appApiPath(`/notes/${noteId}/copy`), body);
  }

/** 批量更新笔记正文 */
  async batchUpdateNote(noteId: string | number, body: NoteBatchUpdateRequest): Promise<PlusApiResultNoteBatchUpdateResultVO> {
    return this.client.post<PlusApiResultNoteBatchUpdateResultVO>(appApiPath(`/notes/${noteId}/batch-update`), body);
  }

/** 批量更新笔记正文 */
  async createBatchUpdateNote(noteId: string | number, body: NoteBatchUpdateRequest): Promise<PlusApiResultNoteBatchUpdateResultVO> {
    return this.client.post<PlusApiResultNoteBatchUpdateResultVO>(appApiPath(`/notes/${noteId}:batchUpdate`), body);
  }

/** 获取文件夹树 */
  async listFolders(): Promise<PlusApiResultListNoteFolderVO> {
    return this.client.get<PlusApiResultListNoteFolderVO>(appApiPath(`/notes/folders`));
  }

/** 创建文件夹 */
  async createFolder(body: NoteFolderCreateRequest): Promise<PlusApiResultNoteFolderVO> {
    return this.client.post<PlusApiResultNoteFolderVO>(appApiPath(`/notes/folders`), body);
  }

/** 获取笔记统计 */
  async getNoteStatistics(): Promise<PlusApiResultNoteStatisticsVO> {
    return this.client.get<PlusApiResultNoteStatisticsVO>(appApiPath(`/notes/statistics`));
  }

/** 批量删除笔记 */
  async batchDelete(): Promise<PlusApiResultNoteOperationVO> {
    return this.client.delete<PlusApiResultNoteOperationVO>(appApiPath(`/notes/batch`));
  }

/** 批量删除笔记 */
  async deleteBatch(): Promise<PlusApiResultNoteOperationVO> {
    return this.client.delete<PlusApiResultNoteOperationVO>(appApiPath(`/notes/batch-delete`));
  }
}

export function createNotesApi(client: HttpClient): NotesApi {
  return new NotesApi(client);
}
