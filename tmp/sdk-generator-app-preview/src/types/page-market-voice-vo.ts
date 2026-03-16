import type { MarketVoiceVO } from './market-voice-vo';

export interface PageMarketVoiceVO {
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  content?: MarketVoiceVO[];
}
