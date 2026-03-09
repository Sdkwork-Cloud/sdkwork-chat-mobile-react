export type DriveTransferDirection = 'upload' | 'download';
export type DriveTransferStatus = 'running' | 'success' | 'failed';

export interface DriveTransferTask {
  id: string;
  name: string;
  size: number;
  direction: DriveTransferDirection;
  status: DriveTransferStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

export interface CreateDriveTransferTaskInput {
  id: string;
  name: string;
  size: number;
  direction?: DriveTransferDirection;
  startedAt?: number;
}

export const createDriveTransferTask = (input: CreateDriveTransferTaskInput): DriveTransferTask => ({
  id: input.id,
  name: input.name,
  size: input.size,
  direction: input.direction || 'upload',
  status: 'running',
  startedAt: input.startedAt ?? Date.now(),
});

export const markDriveTransferTaskSuccess = (
  task: DriveTransferTask,
  completedAt = Date.now(),
): DriveTransferTask => ({
  ...task,
  status: 'success',
  completedAt,
  error: undefined,
});

export const markDriveTransferTaskFailed = (
  task: DriveTransferTask,
  error: string,
  completedAt = Date.now(),
): DriveTransferTask => ({
  ...task,
  status: 'failed',
  completedAt,
  error,
});
