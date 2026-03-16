import type { ClawScheduleTaskVO } from './claw-schedule-task-vo';

/** Claw bootstrap response. */
export interface ClawBootstrapVO {
  createdAt?: string;
  updatedAt?: string;
  clawId?: number;
  clawUserId?: number;
  clawKey?: string;
  displayName?: string;
  appId?: number;
  appName?: string;
  defaultConfig?: Record<string, unknown>;
  opsPolicy?: Record<string, unknown>;
  currentConfigSnapshotId?: number;
  currentConfigVersionName?: string;
  currentConfigHash?: string;
  identityConfig?: Record<string, unknown>;
  runtimeConfig?: Record<string, unknown>;
  providerConfig?: Record<string, unknown>;
  schedulerConfig?: Record<string, unknown>;
  securityConfig?: Record<string, unknown>;
  currentSourceVersionId?: number;
  currentVersionName?: string;
  currentSemanticVersion?: string;
  currentReleaseChannel?: string;
  currentSourceType?: string;
  scheduleTasks?: ClawScheduleTaskVO[];
}
