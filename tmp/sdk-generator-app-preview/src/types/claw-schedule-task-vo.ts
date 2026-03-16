/** Claw schedule task response. */
export interface ClawScheduleTaskVO {
  createdAt?: string;
  updatedAt?: string;
  taskId?: number;
  taskKey?: string;
  taskName?: string;
  taskType?: string;
  scheduleMode?: string;
  enabled?: boolean;
  lastSuccessAt?: string;
  lastFailureAt?: string;
}
