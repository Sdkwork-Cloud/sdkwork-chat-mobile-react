/** Claw login response. */
export interface ClawLoginVO {
  createdAt?: string;
  updatedAt?: string;
  authToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  clawId: number;
  clawUserId: number;
  clawKey?: string;
  displayName?: string;
  appId: number;
  appName?: string;
}
