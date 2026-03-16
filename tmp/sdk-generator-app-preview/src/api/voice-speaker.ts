import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultGenerationTaskVO, PlusApiResultListVoiceSpeakerVO, PlusApiResultPageGenerationTaskVO, PlusApiResultPageMarketVoiceVO, PlusApiResultPageVoiceSpeakerListVO, PlusApiResultPageVoiceSpeakerVO, PlusApiResultSpeakerStatisticsVO, PlusApiResultVoiceSpeakerCloneTaskResultVO, PlusApiResultVoiceSpeakerDetailVO, PlusApiResultVoiceSpeakerGenerationVO, PlusApiResultVoiceSpeakerVO, PlusApiResultVoid, VoiceSpeakerCloneForm, VoiceSpeakerCloneFromAssetForm, VoiceSpeakerCreateForm, VoiceSpeakerGenerationForm, VoiceSpeakerPreviewUpdateForm } from '../types';


export class VoiceSpeakerApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取发音人详情 */
  async getSpeakerDetail(speakerId: string | number): Promise<PlusApiResultVoiceSpeakerDetailVO> {
    return this.client.get<PlusApiResultVoiceSpeakerDetailVO>(appApiPath(`/voice-speakers/${speakerId}`));
  }

/** 更新发音人 */
  async updateSpeaker(speakerId: string | number, body: VoiceSpeakerCreateForm): Promise<PlusApiResultVoiceSpeakerVO> {
    return this.client.put<PlusApiResultVoiceSpeakerVO>(appApiPath(`/voice-speakers/${speakerId}`), body);
  }

/** 删除发音人 */
  async deleteSpeaker(speakerId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/voice-speakers/${speakerId}`));
  }

/** 获取发音人列表 */
  async listSpeakers(params?: QueryParams): Promise<PlusApiResultPageVoiceSpeakerVO> {
    return this.client.get<PlusApiResultPageVoiceSpeakerVO>(appApiPath(`/voice-speakers`), params);
  }

/** 创建发音人 */
  async createSpeaker(body: VoiceSpeakerCreateForm): Promise<PlusApiResultVoiceSpeakerVO> {
    return this.client.post<PlusApiResultVoiceSpeakerVO>(appApiPath(`/voice-speakers`), body);
  }

/** 更新发音人状态 */
  async updateStatus(speakerId: string | number, params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/voice-speakers/${speakerId}/status`), undefined, params);
  }

/** 设为默认发音人 */
  async setAsDefault(speakerId: string | number): Promise<PlusApiResultVoiceSpeakerVO> {
    return this.client.post<PlusApiResultVoiceSpeakerVO>(appApiPath(`/voice-speakers/${speakerId}/set-default`));
  }

/** 创建语音生成任务 */
  async createGeneration(body: VoiceSpeakerGenerationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/voice-speaker`), body);
  }

/** 克隆说话人 */
  async cloneSpeaker(body: VoiceSpeakerCloneForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/voice-speaker/clone`), body);
  }

/** 获取发音人统计 */
  async getStatistics(): Promise<PlusApiResultSpeakerStatisticsVO> {
    return this.client.get<PlusApiResultSpeakerStatisticsVO>(appApiPath(`/voice-speakers/statistics`));
  }

/** 获取默认发音人 */
  async getDefaultSpeaker(): Promise<PlusApiResultVoiceSpeakerVO> {
    return this.client.get<PlusApiResultVoiceSpeakerVO>(appApiPath(`/voice-speakers/default`));
  }

/** 根据代码获取发音人 */
  async getSpeakerByCode(code: string | number): Promise<PlusApiResultVoiceSpeakerVO> {
    return this.client.get<PlusApiResultVoiceSpeakerVO>(appApiPath(`/voice-speakers/code/${code}`));
  }

/** 获取渠道发音人 */
  async listSpeakersByChannel(channel: string | number): Promise<PlusApiResultListVoiceSpeakerVO> {
    return this.client.get<PlusApiResultListVoiceSpeakerVO>(appApiPath(`/voice-speakers/channel/${channel}`));
  }

/** 获取说话人详情 */
  async getSpeakerDetailVoice(speakerId: string | number): Promise<PlusApiResultVoiceSpeakerGenerationVO> {
    return this.client.get<PlusApiResultVoiceSpeakerGenerationVO>(appApiPath(`/generation/voice-speaker/${speakerId}`));
  }

/** 删除说话人 */
  async deleteSpeakerVoice(speakerId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/voice-speaker/${speakerId}`));
  }

/** 获取任务列表 */
  async listTasks(params?: QueryParams): Promise<PlusApiResultPageGenerationTaskVO> {
    return this.client.get<PlusApiResultPageGenerationTaskVO>(appApiPath(`/generation/voice-speaker/tasks`), params);
  }

/** 获取任务状态 */
  async getTaskStatus(taskId: string | number): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.get<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/voice-speaker/tasks/${taskId}`));
  }

/** 取消任务 */
  async cancelTask(taskId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/voice-speaker/tasks/${taskId}`));
  }

/** 获取说话人列表 */
  async getListSpeakers(params?: QueryParams): Promise<PlusApiResultPageVoiceSpeakerListVO> {
    return this.client.get<PlusApiResultPageVoiceSpeakerListVO>(appApiPath(`/generation/voice-speaker/list`), params);
  }

/** Clone voice speaker from workspace asset */
  async cloneFromAsset(body: VoiceSpeakerCloneFromAssetForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/voice-speaker/clone-from-asset`), body);
  }

/** Get deterministic clone task result */
  async getCloneTaskResult(taskId: string | number): Promise<PlusApiResultVoiceSpeakerCloneTaskResultVO> {
    return this.client.get<PlusApiResultVoiceSpeakerCloneTaskResultVO>(appApiPath(`/generation/voice-speaker/tasks/${taskId}/result`));
  }

/** Update speaker preview settings */
  async updatePreviewSettings(speakerId: string | number, body: VoiceSpeakerPreviewUpdateForm): Promise<PlusApiResultVoiceSpeakerVO> {
    return this.client.patch<PlusApiResultVoiceSpeakerVO>(appApiPath(`/voice-speakers/${speakerId}/preview`), body);
  }

/** List normalized market voices */
  async listMarketVoices(params?: QueryParams): Promise<PlusApiResultPageMarketVoiceVO> {
    return this.client.get<PlusApiResultPageMarketVoiceVO>(appApiPath(`/voice-speakers/market`), params);
  }
}

export function createVoiceSpeakerApi(client: HttpClient): VoiceSpeakerApi {
  return new VoiceSpeakerApi(client);
}
