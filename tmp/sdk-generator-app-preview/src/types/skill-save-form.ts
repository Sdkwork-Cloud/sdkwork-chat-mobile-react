/** 技能创建/更新参数 */
export interface SkillSaveForm {
  /** 技能唯一标识，留空自动生成 */
  skillKey?: string;
  /** 技能名称 */
  name?: string;
  /** 技能简介 */
  summary?: string;
  /** 技能描述 */
  description?: string;
  /** 图标 */
  icon?: string;
  /** 封面图 */
  coverImage?: string;
  /** 分类ID */
  categoryId?: number;
  /** 分包ID */
  packageId?: number;
  /** 供应商 */
  provider?: string;
  /** 版本号 */
  version?: string;
  /** 运行时 */
  runtime?: string;
  /** 入口 */
  entrypoint?: string;
  /** manifest地址 */
  manifestUrl?: string;
  /** 代码仓库地址 */
  repositoryUrl?: string;
  /** 主页地址 */
  homepageUrl?: string;
  /** 文档地址 */
  documentationUrl?: string;
  /** 许可证 */
  licenseName?: string;
  /** 来源类型：OFFICIAL/COMMUNITY/ENTERPRISE/PRIVATE/CUSTOM */
  sourceType?: string;
  /** 可见性：PUBLIC/PRIVATE/UNLISTED */
  visibility?: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 价格 */
  price?: number;
  /** 货币 */
  currency?: string;
  /** 标签 */
  tags?: string[];
  /** 能力标签 */
  capabilities?: string[];
  /** 配置Schema */
  configSchema?: Record<string, unknown>;
  /** 默认配置 */
  defaultConfig?: Record<string, unknown>;
}
