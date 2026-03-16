import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { ClawHeartbeatForm, ClawRegisterForm, ClawScheduleTaskRegisterForm, ClawTaskReportForm, PlusApiResultClawBootstrapVO, PlusApiResultClawHeartbeatVO, PlusApiResultClawInstanceVO, PlusApiResultClawScheduleTaskVO, PlusApiResultClawTaskExecutionVO } from '../types';


export class ClawRegistryApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Get claw bootstrap */
  async bootstrap(): Promise<PlusApiResultClawBootstrapVO> {
    return this.client.get<PlusApiResultClawBootstrapVO>(appApiPath(`/claw/registry/bootstrap`));
  }

/** Register claw instance */
  async register(body: ClawRegisterForm): Promise<PlusApiResultClawInstanceVO> {
    return this.client.post<PlusApiResultClawInstanceVO>(appApiPath(`/claw/registry/register`), body);
  }

/** Accept heartbeat */
  async heartbeat(body: ClawHeartbeatForm): Promise<PlusApiResultClawHeartbeatVO> {
    return this.client.post<PlusApiResultClawHeartbeatVO>(appApiPath(`/claw/registry/heartbeat`), body);
  }

/** Register claw schedule task */
  async registerTask(body: ClawScheduleTaskRegisterForm): Promise<PlusApiResultClawScheduleTaskVO> {
    return this.client.post<PlusApiResultClawScheduleTaskVO>(appApiPath(`/claw/registry/tasks/register`), body);
  }

/** Report claw task execution */
  async reportTask(body: ClawTaskReportForm): Promise<PlusApiResultClawTaskExecutionVO> {
    return this.client.post<PlusApiResultClawTaskExecutionVO>(appApiPath(`/claw/registry/tasks/report`), body);
  }
}

export function createClawRegistryApi(client: HttpClient): ClawRegistryApi {
  return new ClawRegistryApi(client);
}
