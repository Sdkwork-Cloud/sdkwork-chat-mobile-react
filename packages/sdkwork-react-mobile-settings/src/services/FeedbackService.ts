import { AbstractStorageService, resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { FeedbackRecord, FeedbackSubmitInput, FeedbackType, IFeedbackService } from '../types';
import { createFeedbackSdkService } from './FeedbackSdkService';
import type { IFeedbackSdkService } from './FeedbackSdkService';

const TAG = 'FeedbackService';
const FEEDBACK_EVENTS = {
  SUBMITTED: 'settings:feedback_submitted',
} as const;

class FeedbackServiceImpl extends AbstractStorageService<FeedbackRecord> implements IFeedbackService {
  protected STORAGE_KEY = 'sys_feedback_v1';
  private readonly deps: ServiceFactoryRuntimeDeps;
  private readonly sdkService: IFeedbackSdkService;

  constructor(deps?: ServiceFactoryDeps, sdkService?: IFeedbackSdkService) {
    super();
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
    this.sdkService = sdkService || createFeedbackSdkService(deps);
  }

  private normalizeType(value: string): FeedbackType {
    const raw = (value || '').trim().toLowerCase();
    const supported: FeedbackType[] = ['bug', 'suggestion', 'complaint', 'other'];
    return supported.includes(raw as FeedbackType) ? (raw as FeedbackType) : 'other';
  }

  private normalizeSubmitInput(input: FeedbackSubmitInput): FeedbackSubmitInput {
    const content = (input.content || '').trim();
    if (!content) {
      throw new Error('Feedback content is required');
    }

    const contact = (input.contact || '').trim();
    const attachmentUrl = (input.attachmentUrl || '').trim();
    const screenshotUrl = (input.screenshotUrl || '').trim();

    return {
      type: this.normalizeType(input.type),
      content,
      contact: contact || undefined,
      attachmentUrl: attachmentUrl || undefined,
      screenshotUrl: screenshotUrl || undefined,
    };
  }

  private createLocalRecord(input: FeedbackSubmitInput): FeedbackRecord {
    const now = this.deps.clock.now();
    return {
      id: this.deps.idGenerator.next('feedback'),
      createTime: now,
      updateTime: now,
      type: input.type,
      content: input.content,
      contact: input.contact,
      status: 'submitted',
      submitTime: now,
    };
  }

  async submitFeedback(input: FeedbackSubmitInput): Promise<FeedbackRecord> {
    const normalized = this.normalizeSubmitInput(input);

    const remoteRecord = await this.sdkService.submitFeedback(normalized);
    if (remoteRecord) {
      const saved = await this.save(remoteRecord);
      this.deps.eventBus.emit(FEEDBACK_EVENTS.SUBMITTED, {
        id: saved.id,
        source: 'sdk',
      });
      this.deps.logger.info(TAG, 'Feedback submitted through SDK', { id: saved.id });
      return saved;
    }

    if (this.sdkService.hasSdkBaseUrl()) {
      const sdkError = this.sdkService.getLastError();
      throw new Error(sdkError?.message || 'Feedback submit failed');
    }

    const localRecord = this.createLocalRecord(normalized);
    const saved = await this.save(localRecord);
    this.deps.eventBus.emit(FEEDBACK_EVENTS.SUBMITTED, {
      id: saved.id,
      source: 'local',
    });
    this.deps.logger.info(TAG, 'Feedback submitted in local mode', { id: saved.id });
    return saved;
  }

  async getFeedbackList(): Promise<FeedbackRecord[]> {
    const remoteList = await this.sdkService.listFeedback();
    if (remoteList) {
      const sorted = [...remoteList].sort((a, b) => b.submitTime - a.submitTime);
      this.cache = sorted;
      await this.commit();
      return sorted;
    }

    const page = await this.findAll();
    return [...page.content].sort((a, b) => {
      const left = a.submitTime || a.createTime;
      const right = b.submitTime || b.createTime;
      return right - left;
    });
  }
}

export function createFeedbackService(_deps?: ServiceFactoryDeps): IFeedbackService {
  return new FeedbackServiceImpl(_deps);
}

export function createFeedbackServiceWithSdk(_deps?: ServiceFactoryDeps, sdkService?: IFeedbackSdkService): IFeedbackService {
  return new FeedbackServiceImpl(_deps, sdkService);
}

export const feedbackService: IFeedbackService = createFeedbackService();
