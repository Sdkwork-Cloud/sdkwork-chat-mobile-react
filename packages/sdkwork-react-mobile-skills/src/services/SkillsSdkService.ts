import type {
  PlusApiResultBoolean,
  PlusApiResultListSkillPackageVO,
  PlusApiResultListUserSkillVO,
  PlusApiResultPageSkillVO,
  PlusApiResultSkillVO,
  PlusApiResultUserSkillVO,
  SkillPackageVO,
  SkillVO,
  SdkworkAppClient,
  UserSkillVO,
} from '@sdkwork/app-sdk';
import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  createAppSdkCoreConfig,
  getAppSdkCoreClientWithSession,
  resolveServiceFactoryRuntimeDeps,
} from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { SkillAction, SkillDetailData, SkillListItem, SkillsCenterGroups, SkillsCenterQuery } from '../types';
import { buildPackageListItem, filterSkillEntriesByKeyword, mapSkillListItem } from '../view-models/skillViewModel';

const TAG = 'SkillsSdkService';

interface ApiResultLike {
  code?: string;
  msg?: string;
}

const SUCCESS_CODE = '2000';

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

function isSuccess(result: ApiResultLike | null | undefined): boolean {
  return result?.code === SUCCESS_CODE;
}

function getSkillId(skill: Partial<SkillVO>): string {
  return toId(skill.skillId) || toId(skill.skillKey);
}

function getSkillPackageId(skill: Partial<SkillVO>): string {
  return toId(skill.packageId);
}

function getPackageId(skillPackage: Partial<SkillPackageVO>): string {
  return toId(skillPackage.packageId) || toId(skillPackage.packageKey);
}

function dedupeById(entries: SkillListItem[]): SkillListItem[] {
  const map = new Map<string, SkillListItem>();
  entries.forEach((entry) => {
    if (!entry.id) return;
    if (!map.has(entry.id)) {
      map.set(entry.id, entry);
    }
  });
  return Array.from(map.values());
}

function resolveSkillDetailData(base: SkillListItem, skill: Partial<SkillVO>): SkillDetailData {
  return {
    ...base,
    latestPublishedAt: toText(skill.latestPublishedAt) || undefined,
    documentationUrl: toText(skill.documentationUrl) || undefined,
    homepageUrl: toText(skill.homepageUrl) || undefined,
    repositoryUrl: toText(skill.repositoryUrl) || undefined,
    manifestUrl: toText(skill.manifestUrl) || undefined,
    licenseName: toText(skill.licenseName) || undefined,
    marketStatus: toText(skill.marketStatus) || undefined,
    reviewStatus: toText(skill.reviewStatus) || undefined,
    includedSkills: [],
  };
}

export interface ISkillsSdkService {
  hasSdkBaseUrl(): boolean;
  listCenterData(query?: SkillsCenterQuery): Promise<SkillsCenterGroups | null>;
  getSkillDetail(skillId: string): Promise<SkillDetailData | null>;
  getPackageDetail(packageId: string): Promise<SkillDetailData | null>;
  applySkillAction(skillId: string, action: SkillAction): Promise<SkillDetailData | null>;
  applyPackageAction(packageId: string, action: SkillAction): Promise<SkillDetailData | null>;
}

class SkillsSdkServiceImpl implements ISkillsSdkService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private async getClient(): Promise<SdkworkAppClient> {
    return getAppSdkCoreClientWithSession({
      storage: this.deps.storage,
      authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
    });
  }

  hasSdkBaseUrl(): boolean {
    return (createAppSdkCoreConfig().baseUrl || '').trim().length > 0;
  }

  private warnFailure(scope: string, result: ApiResultLike | null | undefined): void {
    if (isSuccess(result)) return;
    this.deps.logger.warn(TAG, `${scope} failed`, {
      code: result?.code,
      message: result?.msg,
    });
  }

  private extractMarketSkills(result: PlusApiResultPageSkillVO): SkillVO[] {
    const content = result?.data?.content;
    return Array.isArray(content) ? content : [];
  }

  private extractPackages(result: PlusApiResultListSkillPackageVO): SkillPackageVO[] {
    return Array.isArray(result?.data) ? result.data : [];
  }

  private buildMineSkillMap(result: PlusApiResultListUserSkillVO | null): Map<string, UserSkillVO> {
    const map = new Map<string, UserSkillVO>();
    if (!result || !Array.isArray(result.data)) return map;

    result.data.forEach((userSkill) => {
      const skillId = toId(userSkill.skillId) || getSkillId(userSkill.skill || {});
      if (!skillId) return;
      map.set(skillId, userSkill);
    });
    return map;
  }

  private async listAllSkills(client: SdkworkAppClient): Promise<PlusApiResultPageSkillVO | null> {
    try {
      const result = await client.skill.list({
        page: 0,
        size: 200,
        pageNum: 1,
        pageSize: 200,
        sortBy: 'recommended',
      }) as PlusApiResultPageSkillVO;
      return result;
    } catch (error) {
      this.deps.logger.warn(TAG, 'list skills request failed', error);
      return null;
    }
  }

  async listCenterData(query: SkillsCenterQuery = {}): Promise<SkillsCenterGroups | null> {
    if (!this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const [marketResult, packagesResult, mineResult] = await Promise.all([
        client.skill.list({
          keyword: query.keyword,
          page: query.page ?? 0,
          size: query.pageSize ?? 200,
          pageNum: (query.page ?? 0) + 1,
          pageSize: query.pageSize ?? 200,
          sortBy: 'recommended',
        }) as Promise<PlusApiResultPageSkillVO>,
        client.skill.listPackages() as Promise<PlusApiResultListSkillPackageVO>,
        client.skill.listMine() as Promise<PlusApiResultListUserSkillVO>,
      ]);

      this.warnFailure('list market skills', marketResult);
      this.warnFailure('list skill packages', packagesResult);
      this.warnFailure('list mine skills', mineResult);

      if (!isSuccess(marketResult)) {
        return null;
      }

      const mineMap = isSuccess(mineResult) ? this.buildMineSkillMap(mineResult) : new Map<string, UserSkillVO>();
      const allSkillEntries = dedupeById(
        this.extractMarketSkills(marketResult)
          .map((skill) => {
            const skillId = getSkillId(skill);
            if (!skillId) return null;
            return mapSkillListItem(skill, mineMap.get(skillId));
          })
          .filter((item): item is SkillListItem => item !== null),
      );

      let singleEntries = allSkillEntries.filter((item) => !item.packageId);
      if (singleEntries.length === 0) {
        singleEntries = allSkillEntries;
      }

      const packageEntries = (isSuccess(packagesResult) ? this.extractPackages(packagesResult) : [])
        .map((skillPackage) => {
          const packageId = getPackageId(skillPackage);
          const included = packageId
            ? allSkillEntries.filter((entry) => entry.packageId === packageId)
            : [];
          const mapped = buildPackageListItem(skillPackage, included);
          return mapped.id ? mapped : null;
        })
        .filter((item): item is SkillListItem => item !== null);

      return {
        packages: filterSkillEntriesByKeyword(packageEntries, query.keyword || ''),
        singles: filterSkillEntriesByKeyword(singleEntries, query.keyword || ''),
      };
    } catch (error) {
      this.deps.logger.warn(TAG, 'listCenterData request failed', error);
      return null;
    }
  }

  async getSkillDetail(skillId: string): Promise<SkillDetailData | null> {
    const normalizedSkillId = toId(skillId);
    if (!normalizedSkillId || !this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const [detailResult, mineResult] = await Promise.all([
        client.skill.detail(normalizedSkillId) as Promise<PlusApiResultSkillVO>,
        client.skill.listMine() as Promise<PlusApiResultListUserSkillVO>,
      ]);

      this.warnFailure('skill detail', detailResult);
      this.warnFailure('list mine skills', mineResult);

      if (!isSuccess(detailResult)) {
        return null;
      }

      const skill = detailResult.data || {};
      const actualSkillId = getSkillId(skill) || normalizedSkillId;
      const mineMap = isSuccess(mineResult) ? this.buildMineSkillMap(mineResult) : new Map<string, UserSkillVO>();
      const mapped = mapSkillListItem(skill, mineMap.get(actualSkillId));
      return resolveSkillDetailData(mapped, skill);
    } catch (error) {
      this.deps.logger.warn(TAG, 'getSkillDetail request failed', {
        skillId: normalizedSkillId,
        error,
      });
      return null;
    }
  }

  async getPackageDetail(packageId: string): Promise<SkillDetailData | null> {
    const normalizedPackageId = toId(packageId);
    if (!normalizedPackageId || !this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      const [skillsResult, packagesResult, mineResult] = await Promise.all([
        this.listAllSkills(client),
        client.skill.listPackages() as Promise<PlusApiResultListSkillPackageVO>,
        client.skill.listMine() as Promise<PlusApiResultListUserSkillVO>,
      ]);

      this.warnFailure('list all skills', skillsResult || undefined);
      this.warnFailure('list skill packages', packagesResult);
      this.warnFailure('list mine skills', mineResult);

      if (!skillsResult || !isSuccess(skillsResult)) {
        return null;
      }

      const mineMap = isSuccess(mineResult) ? this.buildMineSkillMap(mineResult) : new Map<string, UserSkillVO>();
      const includedSkills = this.extractMarketSkills(skillsResult)
        .filter((skill) => getSkillPackageId(skill) === normalizedPackageId)
        .map((skill) => {
          const skillId = getSkillId(skill);
          if (!skillId) return null;
          return mapSkillListItem(skill, mineMap.get(skillId));
        })
        .filter((item): item is SkillListItem => item !== null);

      const packageSource = isSuccess(packagesResult)
        ? this.extractPackages(packagesResult).find((item) => getPackageId(item) === normalizedPackageId)
        : undefined;

      const packageItem = buildPackageListItem(
        packageSource || {
          packageKey: normalizedPackageId,
          name: `Package ${normalizedPackageId}`,
        },
        includedSkills,
      );

      return {
        ...packageItem,
        includedSkills,
      };
    } catch (error) {
      this.deps.logger.warn(TAG, 'getPackageDetail request failed', {
        packageId: normalizedPackageId,
        error,
      });
      return null;
    }
  }

  async applySkillAction(skillId: string, action: SkillAction): Promise<SkillDetailData | null> {
    const normalizedSkillId = toId(skillId);
    if (!normalizedSkillId || !this.hasSdkBaseUrl()) return null;

    try {
      const client = await this.getClient();
      if (action === 'disable') {
        const result = await client.skill.disable(normalizedSkillId) as PlusApiResultBoolean;
        this.warnFailure('disable skill', result);
        if (!isSuccess(result)) return null;
      } else {
        const result = await client.skill.enable(normalizedSkillId) as PlusApiResultUserSkillVO;
        this.warnFailure('enable skill', result);
        if (!isSuccess(result)) return null;
      }
      return this.getSkillDetail(normalizedSkillId);
    } catch (error) {
      this.deps.logger.warn(TAG, 'applySkillAction request failed', {
        skillId: normalizedSkillId,
        action,
        error,
      });
      return null;
    }
  }

  async applyPackageAction(packageId: string, action: SkillAction): Promise<SkillDetailData | null> {
    const normalizedPackageId = toId(packageId);
    if (!normalizedPackageId || !this.hasSdkBaseUrl()) return null;

    const detail = await this.getPackageDetail(normalizedPackageId);
    if (!detail) return null;

    const skillIds = detail.includedSkills
      .map((skill) => toId(skill.id))
      .filter((id): id is string => id.length > 0);
    if (skillIds.length === 0) return detail;

    try {
      const client = await this.getClient();
      await Promise.allSettled(
        skillIds.map((id) => {
          if (action === 'disable') {
            return client.skill.disable(id) as Promise<PlusApiResultBoolean>;
          }
          return client.skill.enable(id) as Promise<PlusApiResultUserSkillVO>;
        }),
      );
    } catch (error) {
      this.deps.logger.warn(TAG, 'applyPackageAction request failed', {
        packageId: normalizedPackageId,
        action,
        error,
      });
    }

    return this.getPackageDetail(normalizedPackageId);
  }
}

export function createSkillsSdkService(_deps?: ServiceFactoryDeps): ISkillsSdkService {
  return new SkillsSdkServiceImpl(_deps);
}

export const skillsSdkService: ISkillsSdkService = createSkillsSdkService();
