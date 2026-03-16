import type { PageableObject } from './pageable-object';
import type { SortObject } from './sort-object';
import type { VoiceSpeakerListVO } from './voice-speaker-list-vo';

export interface PageVoiceSpeakerListVO {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: VoiceSpeakerListVO[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: SortObject;
  pageable?: PageableObject;
  empty?: boolean;
}
