/** Claw heartbeat response. */
export interface ClawHeartbeatVO {
  createdAt?: string;
  updatedAt?: string;
  heartbeatId?: number;
  instanceId?: number;
  reportedAt?: string;
  healthStatus?: string;
  runtimeState?: string;
}
