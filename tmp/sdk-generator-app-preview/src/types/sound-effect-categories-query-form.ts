/** 音效类别查询请求 */
export interface SoundEffectCategoriesQueryForm {
  /** 父类别 */
  parentCategory?: string;
  /** 语言 */
  language?: string;
  /** 是否包含子类别 */
  includeSubcategories?: boolean;
}
