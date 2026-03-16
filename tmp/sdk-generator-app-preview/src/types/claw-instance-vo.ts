/** Claw instance response. */
export interface ClawInstanceVO {
  createdAt?: string;
  updatedAt?: string;
  instanceId?: number;
  instanceCode?: string;
  environmentId?: number;
  runtimeState?: string;
  healthStatus?: string;
  currentConfigSnapshotId?: number;
  currentSourceVersionId?: number;
}
