import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { VoiceSpeakerVO } from './voice-speaker-vo';

export interface PageVoiceSpeakerVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: VoiceSpeakerVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
