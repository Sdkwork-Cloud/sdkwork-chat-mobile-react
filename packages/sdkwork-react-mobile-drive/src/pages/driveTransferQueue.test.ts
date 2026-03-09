import { describe, expect, it } from 'vitest';
import {
  createDriveTransferTask,
  markDriveTransferTaskFailed,
  markDriveTransferTaskSuccess,
} from './driveTransferQueue';

describe('driveTransferQueue', () => {
  it('creates running upload task with deterministic id', () => {
    const task = createDriveTransferTask({
      id: 'tx_1',
      name: 'video.mp4',
      size: 2048,
      startedAt: 1000,
    });

    expect(task.id).toBe('tx_1');
    expect(task.status).toBe('running');
    expect(task.direction).toBe('upload');
    expect(task.completedAt).toBeUndefined();
  });

  it('marks task success and failed', () => {
    const base = createDriveTransferTask({
      id: 'tx_2',
      name: 'doc.pdf',
      size: 512,
      startedAt: 2000,
    });

    const success = markDriveTransferTaskSuccess(base, 3000);
    expect(success.status).toBe('success');
    expect(success.completedAt).toBe(3000);

    const failed = markDriveTransferTaskFailed(base, 'network failed', 4000);
    expect(failed.status).toBe('failed');
    expect(failed.error).toBe('network failed');
    expect(failed.completedAt).toBe(4000);
  });
});
