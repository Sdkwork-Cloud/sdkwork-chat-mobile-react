import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPromptEnhanceResponse, PromptEnhanceRequest } from '../types';


export class GenerationApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Enhance generation prompt */
  async enhanceGenerationPrompt(body: PromptEnhanceRequest): Promise<PlusApiResultPromptEnhanceResponse> {
    return this.client.post<PlusApiResultPromptEnhanceResponse>(appApiPath(`/generation/prompt/enhance`), body);
  }
}

export function createGenerationApi(client: HttpClient): GenerationApi {
  return new GenerationApi(client);
}
