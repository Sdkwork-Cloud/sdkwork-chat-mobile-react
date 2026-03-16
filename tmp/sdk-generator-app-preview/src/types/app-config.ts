import type { AppPublishConfig } from './app-publish-config';
import type { OfficialAccountConfig } from './official-account-config';

export interface AppConfig {
  officialAccount?: OfficialAccountConfig;
  publish?: AppPublishConfig;
}
