export interface ClawLoginForm {
  /** Claw username. */
  username: string;
  /** Claw password. */
  password: string;
  /** Claw key. */
  clawKey?: string;
  /** Remember me. */
  rememberMe?: boolean;
}
