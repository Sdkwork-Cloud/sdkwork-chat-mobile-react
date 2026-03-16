import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultAnnouncementDetailVO, PlusApiResultInteger, PlusApiResultListAnnouncementVO, PlusApiResultListChangelogVO, PlusApiResultListOnboardingPageVO, PlusApiResultListPopupNotificationVO, PlusApiResultMaintenanceNoticeVO, PlusApiResultPageAnnouncementVO, PlusApiResultSystemStatusVO, PlusApiResultUpdateCheckVO, PlusApiResultVoid } from '../types';


export class AnnouncementApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 标记已读 */
  async markAsRead(announcementId: string | number): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/announcement/${announcementId}/read`));
  }

/** 全部已读 */
  async markAllAsRead(): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/announcement/read/all`));
  }

/** 确认公告 */
  async acknowledge(announcementId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/announcement/${announcementId}/acknowledge`));
  }

/** 关闭弹窗 */
  async dismissPopup(popupId: string | number, params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/announcement/popups/${popupId}/dismiss`), undefined, params);
  }

/** 完成引导 */
  async completeOnboarding(params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/announcement/onboarding/complete`), undefined, params);
  }

/** 公告列表 */
  async listAnnouncements(params?: QueryParams): Promise<PlusApiResultPageAnnouncementVO> {
    return this.client.get<PlusApiResultPageAnnouncementVO>(appApiPath(`/announcement`), params);
  }

/** 公告详情 */
  async getAnnouncementDetail(announcementId: string | number): Promise<PlusApiResultAnnouncementDetailVO> {
    return this.client.get<PlusApiResultAnnouncementDetailVO>(appApiPath(`/announcement/${announcementId}`));
  }

/** 检查更新 */
  async checkUpdate(params?: QueryParams): Promise<PlusApiResultUpdateCheckVO> {
    return this.client.get<PlusApiResultUpdateCheckVO>(appApiPath(`/announcement/update/check`), params);
  }

/** 更新日志 */
  async getChangelogs(params?: QueryParams): Promise<PlusApiResultListChangelogVO> {
    return this.client.get<PlusApiResultListChangelogVO>(appApiPath(`/announcement/update/changelog`), params);
  }

/** 未读公告 */
  async getUnreadAnnouncements(): Promise<PlusApiResultListAnnouncementVO> {
    return this.client.get<PlusApiResultListAnnouncementVO>(appApiPath(`/announcement/unread`));
  }

/** 未读公告数 */
  async getUnreadAnnouncementCount(): Promise<PlusApiResultInteger> {
    return this.client.get<PlusApiResultInteger>(appApiPath(`/announcement/unread/count`));
  }

/** 系统状态 */
  async getSystemStatus(): Promise<PlusApiResultSystemStatusVO> {
    return this.client.get<PlusApiResultSystemStatusVO>(appApiPath(`/announcement/system/status`));
  }

/** 维护公告 */
  async getMaintenanceNotice(): Promise<PlusApiResultMaintenanceNoticeVO> {
    return this.client.get<PlusApiResultMaintenanceNoticeVO>(appApiPath(`/announcement/system/maintenance`));
  }

/** 弹窗通知 */
  async getPopupNotifications(params?: QueryParams): Promise<PlusApiResultListPopupNotificationVO> {
    return this.client.get<PlusApiResultListPopupNotificationVO>(appApiPath(`/announcement/popups`), params);
  }

/** 置顶公告 */
  async getPinnedAnnouncements(): Promise<PlusApiResultListAnnouncementVO> {
    return this.client.get<PlusApiResultListAnnouncementVO>(appApiPath(`/announcement/pinned`));
  }

/** 新用户引导 */
  async getOnboardingPages(params?: QueryParams): Promise<PlusApiResultListOnboardingPageVO> {
    return this.client.get<PlusApiResultListOnboardingPageVO>(appApiPath(`/announcement/onboarding`), params);
  }

/** 最新公告 */
  async getLatestAnnouncements(params?: QueryParams): Promise<PlusApiResultListAnnouncementVO> {
    return this.client.get<PlusApiResultListAnnouncementVO>(appApiPath(`/announcement/latest`), params);
  }
}

export function createAnnouncementApi(client: HttpClient): AnnouncementApi {
  return new AnnouncementApi(client);
}
