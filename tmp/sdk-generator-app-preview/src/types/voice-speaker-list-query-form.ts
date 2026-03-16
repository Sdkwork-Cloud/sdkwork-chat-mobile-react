/** 说话人列表查询请求 */
export interface VoiceSpeakerListQueryForm {
  /** 性别 */
  gender?: string;
  /** 语言 */
  language?: string;
  /** 风格 */
  style?: string;
  /** 年龄范围 */
  ageRange?: string;
  /** 页面 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 是否仅显示收藏 */
  onlyFavorite?: boolean;
}
