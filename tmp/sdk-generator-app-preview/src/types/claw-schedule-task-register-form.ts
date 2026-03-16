import type { ClawScheduleMode } from './claw-schedule-mode';
import type { ClawScheduleTaskType } from './claw-schedule-task-type';
import type { ClawTaskConcurrencyPolicy } from './claw-task-concurrency-policy';
import type { ClawTaskMisfirePolicy } from './claw-task-misfire-policy';

export interface ClawScheduleTaskRegisterForm {
  clawKey?: string;
  instanceCode?: string;
  taskKey: string;
  taskName?: string;
  taskType?: ClawScheduleTaskType;
  scheduleMode?: ClawScheduleMode;
  cronExpression?: string;
  fixedRateMs?: number;
  fixedDelayMs?: number;
  timeZone?: string;
  taskEntrypoint?: string;
  taskHandler?: string;
  payloadSchema?: Record<string, unknown>;
  concurrencyPolicy?: ClawTaskConcurrencyPolicy;
  misfirePolicy?: ClawTaskMisfirePolicy;
  timeoutSeconds?: number;
  maxRetryCount?: number;
  enabled?: boolean;
  nextRunAt?: string;
  taskVersion?: string;
  sourceVersionId?: number;
}
