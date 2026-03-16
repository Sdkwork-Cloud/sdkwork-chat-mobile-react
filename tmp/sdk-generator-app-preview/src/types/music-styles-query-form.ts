/** 音乐风格查询请求 */
export interface MusicStylesQueryForm {
  /** 分类 */
  category?: string;
  /** 流派 */
  genre?: string;
  /** 风格 */
  style?: string;
  /** 情绪 */
  mood?: string;
  /** 乐器 */
  instrument?: string;
}
