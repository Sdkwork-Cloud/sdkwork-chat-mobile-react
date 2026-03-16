import type { ImageItem } from './image-item';

/** 批量图片审核请求 */
export interface BatchImageAuditForm {
  /** 图片列表 */
  images: ImageItem[];
  /** 检测类型 */
  checkTypes?: string[];
  /** 场景类型 */
  scene?: string;
}
