/** 渠道查询请求 */
export interface ChannelQueryForm {
  /** 开始时间 */
  startDate?: string;
  /** 结束时间 */
  endDate?: string;
  /** 渠道类型 */
  channelType?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 每页大小 */
  pageSize?: number;
  /** 页码 */
  pageNum?: number;
}
