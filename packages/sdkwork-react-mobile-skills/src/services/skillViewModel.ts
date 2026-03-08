import type { SkillPackageVO, SkillVO, UserSkillVO } from '@sdkwork/app-sdk';
import type { SkillInstallStatus, SkillListItem } from '../types';

function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toId(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

function toTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toText(item))
    .filter((item): item is string => item.length > 0);
}

function normalizeDescription(skill: Partial<SkillVO>): {
  summary: string;
  description: string;
} {
  const summary = toText(skill.summary) || toText(skill.description);
  const description = toText(skill.description) || summary;
  return { summary, description };
}

function normalizePackageDescription(skillPackage: Partial<SkillPackageVO>): {
  summary: string;
  description: string;
} {
  const summary = toText(skillPackage.summary) || toText(skillPackage.description);
  const description = toText(skillPackage.description) || summary;
  return { summary, description };
}

export function resolveSkillInstallStatus(
  userSkill?: Partial<UserSkillVO>,
  skill?: Partial<SkillVO>,
): SkillInstallStatus {
  if (userSkill?.enabled === true || skill?.userEnabled === true) {
    return 'enabled';
  }

  const hasInstallSignals =
    Boolean(userSkill) ||
    skill?.userConfigured === true ||
    Boolean(toText(skill?.configuredAt)) ||
    skill?.userEnabled === false;

  return hasInstallSignals ? 'installed_disabled' : 'not_installed';
}

export function mapSkillListItem(
  skill: Partial<SkillVO>,
  userSkill?: Partial<UserSkillVO>,
): SkillListItem {
  const { summary, description } = normalizeDescription(skill);
  const id = toId(skill.skillId) || toId(skill.skillKey);
  const packageId = toId(skill.packageId);
  const version = toText(skill.version);
  const name = toText(skill.name) || `Skill ${id || '-'}`;

  return {
    id,
    type: 'skill',
    name,
    summary,
    description,
    icon: toText(skill.icon) || undefined,
    version: version || undefined,
    provider: toText(skill.provider) || undefined,
    runtime: toText(skill.runtime) || undefined,
    categoryName: toText(skill.categoryName) || undefined,
    packageId: packageId || undefined,
    packageName: toText(skill.packageName) || undefined,
    tags: toTextList(skill.tags),
    capabilities: toTextList(skill.capabilities),
    installStatus: resolveSkillInstallStatus(userSkill, skill),
    installedAt: toText(userSkill?.installedAt) || undefined,
    lastEnabledAt: toText(userSkill?.lastEnabledAt) || undefined,
  };
}

function resolvePackageVersion(skills: SkillListItem[]): string | undefined {
  const versions = skills
    .map((item) => toText(item.version))
    .filter((item): item is string => item.length > 0);
  const uniqueVersions = Array.from(new Set(versions));
  if (uniqueVersions.length === 1) return uniqueVersions[0];
  return undefined;
}

function resolvePackageInstallStatus(skills: SkillListItem[]): SkillInstallStatus {
  if (skills.some((item) => item.installStatus === 'enabled')) {
    return 'enabled';
  }
  if (skills.some((item) => item.installStatus === 'installed_disabled')) {
    return 'installed_disabled';
  }
  return 'not_installed';
}

export function buildPackageListItem(
  skillPackage: Partial<SkillPackageVO>,
  includedSkills: SkillListItem[],
): SkillListItem {
  const id = toId(skillPackage.packageId) || toId(skillPackage.packageKey);
  const { summary, description } = normalizePackageDescription(skillPackage);
  const name = toText(skillPackage.name) || `Package ${id || '-'}`;
  const fallbackSkillCount = includedSkills.length > 0 ? includedSkills.length : undefined;
  const skillCountRaw = skillPackage.skillCount;
  const skillCount = typeof skillCountRaw === 'number' && Number.isFinite(skillCountRaw)
    ? skillCountRaw
    : fallbackSkillCount;

  return {
    id,
    type: 'package',
    name,
    summary,
    description,
    icon: toText(skillPackage.icon) || undefined,
    version: resolvePackageVersion(includedSkills),
    categoryName: toText(skillPackage.categoryName) || undefined,
    tags: toTextList(skillPackage.tags),
    capabilities: [],
    skillCount,
    installStatus: resolvePackageInstallStatus(includedSkills),
  };
}

export function filterSkillEntriesByKeyword<T extends SkillListItem>(
  entries: T[],
  keyword: string,
): T[] {
  const normalizedKeyword = toText(keyword).toLowerCase();
  if (!normalizedKeyword) return entries;

  return entries.filter((entry) => {
    const tags = Array.isArray(entry.tags) ? entry.tags : [];
    const capabilities = Array.isArray(entry.capabilities) ? entry.capabilities : [];
    const matcher = [
      entry.name,
      entry.summary,
      entry.description,
      entry.version,
      entry.provider,
      entry.runtime,
      entry.categoryName,
      entry.packageName,
      ...tags,
      ...capabilities,
    ]
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .join(' ')
      .toLowerCase();

    return matcher.includes(normalizedKeyword);
  });
}
