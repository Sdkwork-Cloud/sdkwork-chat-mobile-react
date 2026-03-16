import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { DeviceControlForm, DeviceMessageSendForm, DeviceRegisterForm, DeviceStatusUpdateForm, NotificationBatchReadForm, NotificationSettingsUpdateForm, NotificationTypeSettingsForm, PlusApiResultBoolean, PlusApiResultDeviceMessageVO, PlusApiResultDeviceVO, PlusApiResultListDeviceMessageVO, PlusApiResultListDeviceVO, PlusApiResultListNotificationTypeVO, PlusApiResultListString, PlusApiResultMapStringInteger, PlusApiResultNotificationDetailVO, PlusApiResultNotificationSettingsVO, PlusApiResultNotificationVO, PlusApiResultPageNotificationVO, PlusApiResultVoid, TestNotificationForm, TopicSubscribeForm } from '../types';


export class NotificationApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Mark notification as unread */
  async markAsUnread(notificationId: string | number): Promise<PlusApiResultNotificationVO> {
    return this.client.put<PlusApiResultNotificationVO>(appApiPath(`/notification/${notificationId}/unread`));
  }

/** Mark notification as read */
  async markAsRead(notificationId: string | number): Promise<PlusApiResultNotificationVO> {
    return this.client.put<PlusApiResultNotificationVO>(appApiPath(`/notification/${notificationId}/read`));
  }

/** Get notification settings */
  async getNotificationSettings(): Promise<PlusApiResultNotificationSettingsVO> {
    return this.client.get<PlusApiResultNotificationSettingsVO>(appApiPath(`/notification/settings`));
  }

/** Update notification settings */
  async updateNotificationSettings(body: NotificationSettingsUpdateForm): Promise<PlusApiResultNotificationSettingsVO> {
    return this.client.put<PlusApiResultNotificationSettingsVO>(appApiPath(`/notification/settings`), body);
  }

/** Update type settings */
  async updateTypeSettings(type: string | number, body: NotificationTypeSettingsForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/notification/settings/${type}`), body);
  }

/** Mark all notifications as read */
  async markAllAsRead(params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/notification/read/all`), undefined, params);
  }

/** Update device status */
  async updateDeviceStatus(deviceId: string | number, body: DeviceStatusUpdateForm): Promise<PlusApiResultDeviceVO> {
    return this.client.put<PlusApiResultDeviceVO>(appApiPath(`/notification/devices/${deviceId}/status`), body);
  }

/** Batch mark notifications as read */
  async batchMarkAsRead(body: NotificationBatchReadForm): Promise<PlusApiResultVoid> {
    return this.client.put<PlusApiResultVoid>(appApiPath(`/notification/batch/read`), body);
  }

/** Send test notification */
  async sendTest(body: TestNotificationForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/notification/test`), body);
  }

/** List subscriptions */
  async listSubscriptions(): Promise<PlusApiResultListString> {
    return this.client.get<PlusApiResultListString>(appApiPath(`/notification/subscriptions`));
  }

/** Subscribe topic */
  async subscribeTopic(body: TopicSubscribeForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/notification/subscriptions`), body);
  }

/** List devices */
  async listDevices(): Promise<PlusApiResultListDeviceVO> {
    return this.client.get<PlusApiResultListDeviceVO>(appApiPath(`/notification/devices`));
  }

/** Register device */
  async registerDevice(body: DeviceRegisterForm): Promise<PlusApiResultDeviceVO> {
    return this.client.post<PlusApiResultDeviceVO>(appApiPath(`/notification/devices`), body);
  }

/** List device messages */
  async listDeviceMessages(deviceId: string | number, params?: QueryParams): Promise<PlusApiResultListDeviceMessageVO> {
    return this.client.get<PlusApiResultListDeviceMessageVO>(appApiPath(`/notification/devices/${deviceId}/messages`), params);
  }

/** Send device message */
  async sendDeviceMessage(deviceId: string | number, body: DeviceMessageSendForm): Promise<PlusApiResultDeviceMessageVO> {
    return this.client.post<PlusApiResultDeviceMessageVO>(appApiPath(`/notification/devices/${deviceId}/messages`), body);
  }

/** Control device */
  async controlDevice(deviceId: string | number, body: DeviceControlForm): Promise<PlusApiResultBoolean> {
    return this.client.post<PlusApiResultBoolean>(appApiPath(`/notification/devices/${deviceId}/control`), body);
  }

/** List notifications */
  async listNotifications(params?: QueryParams): Promise<PlusApiResultPageNotificationVO> {
    return this.client.get<PlusApiResultPageNotificationVO>(appApiPath(`/notification`), params);
  }

/** Get notification detail */
  async getNotificationDetail(notificationId: string | number): Promise<PlusApiResultNotificationDetailVO> {
    return this.client.get<PlusApiResultNotificationDetailVO>(appApiPath(`/notification/${notificationId}`));
  }

/** Delete notification */
  async deleteNotification(notificationId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/notification/${notificationId}`));
  }

/** Get unread notification count */
  async getUnreadCount(): Promise<PlusApiResultMapStringInteger> {
    return this.client.get<PlusApiResultMapStringInteger>(appApiPath(`/notification/unread/count`));
  }

/** List notification types */
  async listNotificationTypes(): Promise<PlusApiResultListNotificationTypeVO> {
    return this.client.get<PlusApiResultListNotificationTypeVO>(appApiPath(`/notification/types`));
  }

/** Unsubscribe topic */
  async unsubscribeTopic(topic: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/notification/subscriptions/${topic}`));
  }

/** Unregister device */
  async unregisterDevice(deviceToken: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/notification/devices/${deviceToken}`));
  }

/** Clear notifications */
  async clearAllNotifications(params?: QueryParams): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/notification/clear`), params);
  }

/** Batch delete notifications */
  async batchDeleteNotifications(): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/notification/batch`));
  }
}

export function createNotificationApi(client: HttpClient): NotificationApi {
  return new NotificationApi(client);
}
