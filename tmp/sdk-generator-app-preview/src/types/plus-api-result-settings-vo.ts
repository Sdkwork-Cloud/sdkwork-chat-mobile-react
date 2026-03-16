import type { PlusApiResultBase } from './plus-api-result-base';
import type { SettingsVO } from './settings-vo';

export type PlusApiResultSettingsVO = PlusApiResultBase & Record<string, unknown>;
