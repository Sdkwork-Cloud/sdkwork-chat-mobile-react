import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { OpenChatFileUploadSessionForm, OpenChatUploadCompleteForm, PlusApiResultFileUploadChunkVO, PlusApiResultFileUploadSessionVO, PlusApiResultFileVO } from '../types';


export class OpenChatFileApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Create file upload session */
  async createUploadSession(body: OpenChatFileUploadSessionForm): Promise<PlusApiResultFileUploadSessionVO> {
    return this.client.post<PlusApiResultFileUploadSessionVO>(appApiPath(`/openchat/files/upload/session`), body);
  }

/** Upload file chunk */
  async uploadChunk(body: FormData): Promise<PlusApiResultFileUploadChunkVO> {
    return this.client.post<PlusApiResultFileUploadChunkVO>(appApiPath(`/openchat/files/upload/chunk`), body);
  }

/** Complete file upload */
  async completeUpload(body: OpenChatUploadCompleteForm): Promise<PlusApiResultFileVO> {
    return this.client.post<PlusApiResultFileVO>(appApiPath(`/openchat/files/upload/complete`), body);
  }
}

export function createOpenChatFileApi(client: HttpClient): OpenChatFileApi {
  return new OpenChatFileApi(client);
}
