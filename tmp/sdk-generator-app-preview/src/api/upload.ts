import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { ChunkRequest, FileRequest, ImageRequest, PlusApiResultFileVO, PlusApiResultListFileVO, PlusApiResultListInteger, PlusApiResultPageFileVO, PlusApiResultPresignedUrlVO, PlusApiResultStorageUsageVO, PlusApiResultUploadChunkVO, PlusApiResultUploadCredentialsVO, PlusApiResultUploadInitVO, PlusApiResultUploadPolicyVO, PlusApiResultVoid, PresignedUrlForm, UploadInitForm } from '../types';


export class UploadApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取上传策略 */
  async getUploadPolicy(params?: QueryParams): Promise<PlusApiResultUploadPolicyVO> {
    return this.client.post<PlusApiResultUploadPolicyVO>(appApiPath(`/upload/upload-policy`), undefined, params);
  }

/** 获取上传凭证 */
  async getUploadCredentials(params?: QueryParams): Promise<PlusApiResultUploadCredentialsVO> {
    return this.client.post<PlusApiResultUploadCredentialsVO>(appApiPath(`/upload/upload-credentials`), undefined, params);
  }

/** 获取预签名URL */
  async getPresignedUrl(body: PresignedUrlForm): Promise<PlusApiResultPresignedUrlVO> {
    return this.client.post<PlusApiResultPresignedUrlVO>(appApiPath(`/upload/presigned-url`), body);
  }

/** 上传图片 */
  async image(body?: ImageRequest, params?: QueryParams): Promise<PlusApiResultFileVO> {
    return this.client.post<PlusApiResultFileVO>(appApiPath(`/upload/image`), body, params);
  }

/** 上传Base64图片 */
  async base64Image(params?: QueryParams): Promise<PlusApiResultFileVO> {
    return this.client.post<PlusApiResultFileVO>(appApiPath(`/upload/image/base64`), undefined, params);
  }

/** 获取文件列表 */
  async listFiles(params?: QueryParams): Promise<PlusApiResultPageFileVO> {
    return this.client.get<PlusApiResultPageFileVO>(appApiPath(`/upload/files`), params);
  }

/** 多文件上传 */
  async files(params?: QueryParams): Promise<PlusApiResultListFileVO> {
    return this.client.post<PlusApiResultListFileVO>(appApiPath(`/upload/files`), undefined, params);
  }

/** 复制文件 */
  async copyFile(fileId: string | number, params?: QueryParams): Promise<PlusApiResultFileVO> {
    return this.client.post<PlusApiResultFileVO>(appApiPath(`/upload/files/${fileId}/copy`), undefined, params);
  }

/** 单文件上传 */
  async file(body?: FileRequest, params?: QueryParams): Promise<PlusApiResultFileVO> {
    return this.client.post<PlusApiResultFileVO>(appApiPath(`/upload/file`), body, params);
  }

/** 上传分片 */
  async chunk(body?: ChunkRequest, params?: QueryParams): Promise<PlusApiResultUploadChunkVO> {
    return this.client.post<PlusApiResultUploadChunkVO>(appApiPath(`/upload/chunk`), body, params);
  }

/** 合并分片 */
  async mergeChunks(params?: QueryParams): Promise<PlusApiResultFileVO> {
    return this.client.post<PlusApiResultFileVO>(appApiPath(`/upload/chunk/merge`), undefined, params);
  }

/** 初始化分片上传 */
  async initChunk(body: UploadInitForm): Promise<PlusApiResultUploadInitVO> {
    return this.client.post<PlusApiResultUploadInitVO>(appApiPath(`/upload/chunk/init`), body);
  }

/** 获取上传进度 */
  async getUploadProgress(uploadId: string | number): Promise<PlusApiResultUploadChunkVO> {
    return this.client.get<PlusApiResultUploadChunkVO>(appApiPath(`/upload/task/${uploadId}/progress`));
  }

/** 获取存储使用情况 */
  async getStorageUsage(): Promise<PlusApiResultStorageUsageVO> {
    return this.client.get<PlusApiResultStorageUsageVO>(appApiPath(`/upload/storage/usage`));
  }

/** 获取文件预签名URL */
  async getFilePresignedUrl(fileId: string | number, params?: QueryParams): Promise<PlusApiResultPresignedUrlVO> {
    return this.client.get<PlusApiResultPresignedUrlVO>(appApiPath(`/upload/presigned-url/${fileId}`), params);
  }

/** 获取文件详情 */
  async getFileDetail(fileId: string | number): Promise<PlusApiResultFileVO> {
    return this.client.get<PlusApiResultFileVO>(appApiPath(`/upload/files/${fileId}`));
  }

/** 删除文件 */
  async deleteFile(fileId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/upload/files/${fileId}`));
  }

/** 查询分片状态 */
  async getChunkStatus(params?: QueryParams): Promise<PlusApiResultListInteger> {
    return this.client.get<PlusApiResultListInteger>(appApiPath(`/upload/chunk/status`), params);
  }

/** 取消上传 */
  async cancel(uploadId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/upload/task/${uploadId}`));
  }
}

export function createUploadApi(client: HttpClient): UploadApi {
  return new UploadApi(client);
}
