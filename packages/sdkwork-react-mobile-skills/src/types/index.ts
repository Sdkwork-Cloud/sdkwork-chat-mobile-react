export type SkillEntryType = 'package' | 'skill';

export type SkillInstallStatus = 'not_installed' | 'installed_disabled' | 'enabled';

export type SkillAction = 'install' | 'enable' | 'disable';

export interface SkillListItem {
  id: string;
  type: SkillEntryType;
  name: string;
  summary: string;
  description: string;
  icon?: string;
  version?: string;
  provider?: string;
  runtime?: string;
  categoryName?: string;
  packageId?: string;
  packageName?: string;
  tags: string[];
  capabilities: string[];
  skillCount?: number;
  installStatus: SkillInstallStatus;
  installedAt?: string;
  lastEnabledAt?: string;
}

export interface SkillsCenterGroups {
  packages: SkillListItem[];
  singles: SkillListItem[];
}

export interface SkillsCenterQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface SkillDetailData extends SkillListItem {
  latestPublishedAt?: string;
  documentationUrl?: string;
  homepageUrl?: string;
  repositoryUrl?: string;
  manifestUrl?: string;
  licenseName?: string;
  marketStatus?: string;
  reviewStatus?: string;
  includedSkills: SkillListItem[];
}
