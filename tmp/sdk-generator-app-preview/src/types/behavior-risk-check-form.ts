/** 行为风险检测请求 */
export interface BehaviorRiskCheckForm {
  /** 用户ID */
  userId?: string;
  /** 行为类型 */
  behaviorType?: 'post' | 'like' | 'follow' | 'comment' | 'share';
  /** 行为频率(次/分钟) */
  frequency?: number;
  /** 行为上下文 */
  context?: Record<string, unknown>;
  /** 检测时间窗口(分钟) */
  timeWindow?: number;
}
