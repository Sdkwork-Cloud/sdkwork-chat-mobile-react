import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { AccountRiskCheckForm, AudioAsrAuditForm, AudioAuditForm, AuditAppealForm, BatchImageAuditForm, BatchTextAuditForm, BehaviorRiskCheckForm, ContentAuditForm, ImageAuditForm, ImageOcrAuditForm, PlusApiResultAccountRiskVO, PlusApiResultAudioAsrAuditVO, PlusApiResultAudioAuditVO, PlusApiResultAuditAppealStatusVO, PlusApiResultAuditAppealVO, PlusApiResultAuditRecordDetailVO, PlusApiResultBatchImageAuditVO, PlusApiResultBatchTextAuditVO, PlusApiResultBehaviorRiskVO, PlusApiResultContentAuditVO, PlusApiResultImageAuditVO, PlusApiResultImageOcrAuditVO, PlusApiResultListAuditPolicyVO, PlusApiResultListSensitiveWordListVO, PlusApiResultPageAuditAppealVO, PlusApiResultPageAuditRecordVO, PlusApiResultRealtimeAuditVO, PlusApiResultSensitiveWordsVO, PlusApiResultTextAuditVO, PlusApiResultTextSuggestVO, PlusApiResultVideoAuditStatusVO, PlusApiResultVideoAuditVO, RealtimeAuditForm, SensitiveWordsForm, TextAuditForm, TextSuggestForm, VideoAuditForm } from '../types';


export class AuditApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 审核申诉 */
  async submitAppeal(recordId: string | number, body: AuditAppealForm): Promise<PlusApiResultAuditAppealVO> {
    return this.client.post<PlusApiResultAuditAppealVO>(appApiPath(`/audit/${recordId}/appeal`), body);
  }

/** 视频审核 */
  async video(body: VideoAuditForm): Promise<PlusApiResultVideoAuditVO> {
    return this.client.post<PlusApiResultVideoAuditVO>(appApiPath(`/audit/video`), body);
  }

/** 文本审核 */
  async text(body: TextAuditForm): Promise<PlusApiResultTextAuditVO> {
    return this.client.post<PlusApiResultTextAuditVO>(appApiPath(`/audit/text`), body);
  }

/** 文本替换建议 */
  async suggestTextReplacement(body: TextSuggestForm): Promise<PlusApiResultTextSuggestVO> {
    return this.client.post<PlusApiResultTextSuggestVO>(appApiPath(`/audit/text/suggest`), body);
  }

/** 批量文本审核 */
  async batchAuditText(body: BatchTextAuditForm): Promise<PlusApiResultBatchTextAuditVO> {
    return this.client.post<PlusApiResultBatchTextAuditVO>(appApiPath(`/audit/text/batch`), body);
  }

/** 敏感词检测 */
  async detectSensitiveWords(body: SensitiveWordsForm): Promise<PlusApiResultSensitiveWordsVO> {
    return this.client.post<PlusApiResultSensitiveWordsVO>(appApiPath(`/audit/sensitive-words`), body);
  }

/** 行为风险检测 */
  async checkBehaviorRisk(body: BehaviorRiskCheckForm): Promise<PlusApiResultBehaviorRiskVO> {
    return this.client.post<PlusApiResultBehaviorRiskVO>(appApiPath(`/audit/risk/behavior`), body);
  }

/** 账号风险检测 */
  async checkAccountRisk(body: AccountRiskCheckForm): Promise<PlusApiResultAccountRiskVO> {
    return this.client.post<PlusApiResultAccountRiskVO>(appApiPath(`/audit/risk/account`), body);
  }

/** 实时内容审核 */
  async realtime(body: RealtimeAuditForm): Promise<PlusApiResultRealtimeAuditVO> {
    return this.client.post<PlusApiResultRealtimeAuditVO>(appApiPath(`/audit/realtime`), body);
  }

/** 图片审核 */
  async image(body: ImageAuditForm): Promise<PlusApiResultImageAuditVO> {
    return this.client.post<PlusApiResultImageAuditVO>(appApiPath(`/audit/image`), body);
  }

/** 图片OCR审核 */
  async imageOcr(body: ImageOcrAuditForm): Promise<PlusApiResultImageOcrAuditVO> {
    return this.client.post<PlusApiResultImageOcrAuditVO>(appApiPath(`/audit/image/ocr`), body);
  }

/** 批量图片审核 */
  async batchAuditImage(body: BatchImageAuditForm): Promise<PlusApiResultBatchImageAuditVO> {
    return this.client.post<PlusApiResultBatchImageAuditVO>(appApiPath(`/audit/image/batch`), body);
  }

/** 综合内容审核 */
  async content(body: ContentAuditForm): Promise<PlusApiResultContentAuditVO> {
    return this.client.post<PlusApiResultContentAuditVO>(appApiPath(`/audit/content`), body);
  }

/** 音频审核 */
  async audio(body: AudioAuditForm): Promise<PlusApiResultAudioAuditVO> {
    return this.client.post<PlusApiResultAudioAuditVO>(appApiPath(`/audit/audio`), body);
  }

/** 语音审核 */
  async audioAsr(body: AudioAsrAuditForm): Promise<PlusApiResultAudioAsrAuditVO> {
    return this.client.post<PlusApiResultAudioAsrAuditVO>(appApiPath(`/audit/audio/asr`), body);
  }

/** 敏感词库 */
  async listSensitiveWord(): Promise<PlusApiResultListSensitiveWordListVO> {
    return this.client.get<PlusApiResultListSensitiveWordListVO>(appApiPath(`/audit/word-lists`));
  }

/** 视频审核状态 */
  async getVideoAuditStatus(taskId: string | number): Promise<PlusApiResultVideoAuditStatusVO> {
    return this.client.get<PlusApiResultVideoAuditStatusVO>(appApiPath(`/audit/video/${taskId}`));
  }

/** 审核记录 */
  async listAuditRecords(params?: QueryParams): Promise<PlusApiResultPageAuditRecordVO> {
    return this.client.get<PlusApiResultPageAuditRecordVO>(appApiPath(`/audit/records`), params);
  }

/** 审核记录详情 */
  async getAuditRecord(recordId: string | number): Promise<PlusApiResultAuditRecordDetailVO> {
    return this.client.get<PlusApiResultAuditRecordDetailVO>(appApiPath(`/audit/records/${recordId}`));
  }

/** 审核策略 */
  async listAuditPolicies(): Promise<PlusApiResultListAuditPolicyVO> {
    return this.client.get<PlusApiResultListAuditPolicyVO>(appApiPath(`/audit/policies`));
  }

/** 我的审核记录 */
  async listMyAuditRecords(params?: QueryParams): Promise<PlusApiResultPageAuditRecordVO> {
    return this.client.get<PlusApiResultPageAuditRecordVO>(appApiPath(`/audit/my-records`), params);
  }

/** 申诉记录 */
  async listAppeals(): Promise<PlusApiResultPageAuditAppealVO> {
    return this.client.get<PlusApiResultPageAuditAppealVO>(appApiPath(`/audit/appeals`));
  }

/** 申诉状态 */
  async getAppealStatus(appealId: string | number): Promise<PlusApiResultAuditAppealStatusVO> {
    return this.client.get<PlusApiResultAuditAppealStatusVO>(appApiPath(`/audit/appeals/${appealId}`));
  }
}

export function createAuditApi(client: HttpClient): AuditApi {
  return new AuditApi(client);
}
