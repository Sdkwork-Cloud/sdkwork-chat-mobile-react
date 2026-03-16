import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { FeedbackFollowUpForm, FeedbackSubmitForm, PlusApiResultFaqDetailVO, PlusApiResultFeedbackDetailVO, PlusApiResultFeedbackVO, PlusApiResultListFaqCategoryVO, PlusApiResultListFaqVO, PlusApiResultListOnboardingStepVO, PlusApiResultPageFaqVO, PlusApiResultPageFeedbackVO, PlusApiResultPageReportVO, PlusApiResultPageSupportMessageVO, PlusApiResultPageTutorialVO, PlusApiResultReportDetailVO, PlusApiResultReportVO, PlusApiResultSupportInfoVO, PlusApiResultSupportMessageVO, PlusApiResultTutorialDetailVO, PlusApiResultVoid, ReportSubmitForm, SupportMessageRequest } from '../types';


export class FeedbackApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 关闭反馈 */
  async close(feedbackId: string | number, params?: QueryParams): Promise<PlusApiResultFeedbackDetailVO> {
    return this.client.put<PlusApiResultFeedbackDetailVO>(appApiPath(`/feedback/${feedbackId}/close`), undefined, params);
  }

/** 反馈列表 */
  async listFeedback(params?: QueryParams): Promise<PlusApiResultPageFeedbackVO> {
    return this.client.get<PlusApiResultPageFeedbackVO>(appApiPath(`/feedback`), params);
  }

/** 提交反馈 */
  async submit(body: FeedbackSubmitForm): Promise<PlusApiResultFeedbackVO> {
    return this.client.post<PlusApiResultFeedbackVO>(appApiPath(`/feedback`), body);
  }

/** 追加反馈 */
  async followUp(feedbackId: string | number, body: FeedbackFollowUpForm): Promise<PlusApiResultFeedbackDetailVO> {
    return this.client.post<PlusApiResultFeedbackDetailVO>(appApiPath(`/feedback/${feedbackId}/followup`), body);
  }

/** 客服消息列表 */
  async listSupportMessages(params?: QueryParams): Promise<PlusApiResultPageSupportMessageVO> {
    return this.client.get<PlusApiResultPageSupportMessageVO>(appApiPath(`/feedback/support/messages`), params);
  }

/** 发送客服消息 */
  async sendSupportMessage(body: SupportMessageRequest): Promise<PlusApiResultSupportMessageVO> {
    return this.client.post<PlusApiResultSupportMessageVO>(appApiPath(`/feedback/support/messages`), body);
  }

/** 举报列表 */
  async listReports(params?: QueryParams): Promise<PlusApiResultPageReportVO> {
    return this.client.get<PlusApiResultPageReportVO>(appApiPath(`/feedback/reports`), params);
  }

/** 提交举报 */
  async submitReport(body: ReportSubmitForm): Promise<PlusApiResultReportVO> {
    return this.client.post<PlusApiResultReportVO>(appApiPath(`/feedback/reports`), body);
  }

/** 完成指引 */
  async completeOnboardingStep(stepId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/feedback/onboarding/${stepId}/complete`));
  }

/** FAQ点赞 */
  async likeFaq(faqId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/feedback/faq/${faqId}/like`));
  }

/** FAQ点踩 */
  async dislikeFaq(faqId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/feedback/faq/${faqId}/dislike`));
  }

/** 反馈详情 */
  async getFeedbackDetail(feedbackId: string | number): Promise<PlusApiResultFeedbackDetailVO> {
    return this.client.get<PlusApiResultFeedbackDetailVO>(appApiPath(`/feedback/${feedbackId}`));
  }

/** 教程列表 */
  async listTutorials(params?: QueryParams): Promise<PlusApiResultPageTutorialVO> {
    return this.client.get<PlusApiResultPageTutorialVO>(appApiPath(`/feedback/tutorials`), params);
  }

/** 教程详情 */
  async getTutorialDetail(tutorialId: string | number): Promise<PlusApiResultTutorialDetailVO> {
    return this.client.get<PlusApiResultTutorialDetailVO>(appApiPath(`/feedback/tutorials/${tutorialId}`));
  }

/** 客服信息 */
  async getSupportInfo(): Promise<PlusApiResultSupportInfoVO> {
    return this.client.get<PlusApiResultSupportInfoVO>(appApiPath(`/feedback/support`));
  }

/** 举报详情 */
  async getReportDetail(reportId: string | number): Promise<PlusApiResultReportDetailVO> {
    return this.client.get<PlusApiResultReportDetailVO>(appApiPath(`/feedback/reports/${reportId}`));
  }

/** 新手指引 */
  async getOnboardingGuide(): Promise<PlusApiResultListOnboardingStepVO> {
    return this.client.get<PlusApiResultListOnboardingStepVO>(appApiPath(`/feedback/onboarding`));
  }

/** FAQ列表 */
  async listFaqs(params?: QueryParams): Promise<PlusApiResultPageFaqVO> {
    return this.client.get<PlusApiResultPageFaqVO>(appApiPath(`/feedback/faq`), params);
  }

/** FAQ详情 */
  async getFaqDetail(faqId: string | number): Promise<PlusApiResultFaqDetailVO> {
    return this.client.get<PlusApiResultFaqDetailVO>(appApiPath(`/feedback/faq/${faqId}`));
  }

/** 搜索FAQ */
  async searchFaqs(params?: QueryParams): Promise<PlusApiResultListFaqVO> {
    return this.client.get<PlusApiResultListFaqVO>(appApiPath(`/feedback/faq/search`), params);
  }

/** FAQ分类 */
  async listFaqCategories(): Promise<PlusApiResultListFaqCategoryVO> {
    return this.client.get<PlusApiResultListFaqCategoryVO>(appApiPath(`/feedback/faq/categories`));
  }
}

export function createFeedbackApi(client: HttpClient): FeedbackApi {
  return new FeedbackApi(client);
}
