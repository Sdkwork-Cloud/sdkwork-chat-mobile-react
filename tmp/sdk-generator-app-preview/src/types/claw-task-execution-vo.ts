/** Claw task execution response. */
export interface ClawTaskExecutionVO {
  createdAt?: string;
  updatedAt?: string;
  executionId?: number;
  scheduleTaskId?: number;
  executionNo?: string;
  status?: string;
  triggeredAt?: string;
  finishedAt?: string;
  resultSummary?: string;
  errorMessage?: string;
}
