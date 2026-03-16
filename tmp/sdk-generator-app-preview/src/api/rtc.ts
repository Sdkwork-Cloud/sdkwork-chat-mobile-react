import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CreateRoomRequest, PlusApiResultListMapStringObject, PlusApiResultMapStringObject, PlusApiResultVoid } from '../types';


export class RtcApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Create RTC room */
  async createRoom(body?: CreateRoomRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/rtc/rooms`), body);
  }

/** Create RTC room token */
  async createRoomToken(roomId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/rtc/rooms/${roomId}/token`));
  }

/** End RTC room */
  async endRoom(roomId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/rtc/rooms/${roomId}/end`));
  }

/** Get RTC room */
  async getRoom(roomId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/rtc/rooms/${roomId}`));
  }

/** List RTC records */
  async listRecords(params?: QueryParams): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/rtc/records`), params);
  }
}

export function createRtcApi(client: HttpClient): RtcApi {
  return new RtcApi(client);
}
