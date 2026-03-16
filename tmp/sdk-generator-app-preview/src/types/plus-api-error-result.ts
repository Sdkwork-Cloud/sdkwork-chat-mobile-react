export interface PlusApiErrorResult {
  code: number;
  message: string;
  data?: unknown;
  timestamp?: string;
  traceId?: string;
}
