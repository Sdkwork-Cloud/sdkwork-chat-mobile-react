import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { AudioGenerationForm, AudioTranscriptionForm, AudioTranslationForm, PlusApiResultGenerationTaskVO, PlusApiResultPageGenerationTaskVO, PlusApiResultVoiceListVO, PlusApiResultVoid, VoiceCloneForm } from '../types';


export class AudioApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 语音克隆 */
  async voiceClone(body: VoiceCloneForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/audio/voice-clone`), body);
  }

/** 文本转语音 */
  async textToSpeech(body: AudioGenerationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/audio/tts`), body);
  }

/** 语音翻译 */
  async translation(body: AudioTranslationForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/audio/translation`), body);
  }

/** 语音转文本 */
  async transcription(body: AudioTranscriptionForm): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.post<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/audio/transcription`), body);
  }

/** 获取语音列表 */
  async getVoiceList(params?: QueryParams): Promise<PlusApiResultVoiceListVO> {
    return this.client.get<PlusApiResultVoiceListVO>(appApiPath(`/generation/audio/voices`), params);
  }

/** 获取转录结果 */
  async getTranscriptionResult(taskId: string | number): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.get<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/audio/transcription/${taskId}`));
  }

/** 获取任务列表 */
  async listTasks(params?: QueryParams): Promise<PlusApiResultPageGenerationTaskVO> {
    return this.client.get<PlusApiResultPageGenerationTaskVO>(appApiPath(`/generation/audio/tasks`), params);
  }

/** 获取任务状态 */
  async getTaskStatus(taskId: string | number): Promise<PlusApiResultGenerationTaskVO> {
    return this.client.get<PlusApiResultGenerationTaskVO>(appApiPath(`/generation/audio/tasks/${taskId}`));
  }

/** 取消任务 */
  async cancelTask(taskId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/generation/audio/tasks/${taskId}`));
  }
}

export function createAudioApi(client: HttpClient): AudioApi {
  return new AudioApi(client);
}
