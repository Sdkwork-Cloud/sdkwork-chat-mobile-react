import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { ClawAuthRegisterForm, ClawLoginForm, ClawRefreshTokenForm, PlusApiResultClawLoginVO } from '../types';


export class ClawAuthApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Claw login */
  async login(body: ClawLoginForm): Promise<PlusApiResultClawLoginVO> {
    return this.client.post<PlusApiResultClawLoginVO>(appApiPath(`/claw/auth/login`), body);
  }

/** Claw register */
  async register(body: ClawAuthRegisterForm): Promise<PlusApiResultClawLoginVO> {
    return this.client.post<PlusApiResultClawLoginVO>(appApiPath(`/claw/auth/register`), body);
  }

/** Claw refresh */
  async refresh(body: ClawRefreshTokenForm): Promise<PlusApiResultClawLoginVO> {
    return this.client.post<PlusApiResultClawLoginVO>(appApiPath(`/claw/auth/refresh`), body);
  }
}

export function createClawAuthApi(client: HttpClient): ClawAuthApi {
  return new ClawAuthApi(client);
}
