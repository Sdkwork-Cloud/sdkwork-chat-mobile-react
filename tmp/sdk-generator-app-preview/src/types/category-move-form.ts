/** 移动分类请求 */
export interface CategoryMoveForm {
  /** 目标父分类ID，为空表示移动到根级别 */
  targetParentId?: number;
}
