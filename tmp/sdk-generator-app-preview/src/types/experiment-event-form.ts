/** 实验事件请求 */
export interface ExperimentEventForm {
  /** 实验标识 */
  experimentKey: string;
  /** 事件类型 */
  eventType?: string;
  /** 事件数据 */
  eventData?: unknown;
}
