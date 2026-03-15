import { describe, expect, it } from 'vitest';
import {
  buildPackageListItem,
  filterSkillEntriesByKeyword,
  mapSkillListItem,
  resolveSkillInstallStatus,
} from './skillViewModel';

describe('resolveSkillInstallStatus', () => {
  it('returns enabled when user skill is enabled', () => {
    expect(resolveSkillInstallStatus({ enabled: true }, undefined)).toBe('enabled');
  });

  it('returns installed_disabled when user skill exists and disabled', () => {
    expect(resolveSkillInstallStatus({ enabled: false }, undefined)).toBe('installed_disabled');
  });

  it('returns not_installed when no install signals exist', () => {
    expect(resolveSkillInstallStatus(undefined, undefined)).toBe('not_installed');
  });
});

describe('mapSkillListItem', () => {
  it('maps market skill and user install status into list item', () => {
    const mapped = mapSkillListItem(
      {
        skillId: 10,
        name: 'Video Cleaner',
        summary: 'Cleanup toolchain',
        version: '1.2.0',
        tags: ['video', 'toolchain'],
      },
      {
        enabled: false,
      },
    );

    expect(mapped.id).toBe('10');
    expect(mapped.name).toBe('Video Cleaner');
    expect(mapped.version).toBe('1.2.0');
    expect(mapped.installStatus).toBe('installed_disabled');
  });
});

describe('buildPackageListItem', () => {
  it('marks package enabled when any included skill is enabled', () => {
    const mapped = buildPackageListItem(
      {
        packageId: 8,
        name: 'A/V Toolkit',
        description: 'Media package',
      },
      [
        {
          id: 's1',
          type: 'skill',
          name: 'Skill 1',
          summary: '',
          description: '',
          installStatus: 'enabled',
          tags: [],
          capabilities: [],
        },
      ],
    );

    expect(mapped.id).toBe('8');
    expect(mapped.type).toBe('package');
    expect(mapped.installStatus).toBe('enabled');
  });
});

describe('filterSkillEntriesByKeyword', () => {
  it('filters by keyword in name and tags', () => {
    const items = [
      {
        id: '1',
        type: 'skill' as const,
        name: 'Translator',
        summary: 'CN EN',
        description: 'translate text',
        installStatus: 'not_installed' as const,
        tags: ['language'],
        capabilities: [],
      },
      {
        id: '2',
        type: 'skill' as const,
        name: 'Image Upscale',
        summary: 'image',
        description: 'enhance image',
        installStatus: 'not_installed' as const,
        tags: ['vision'],
        capabilities: [],
      },
    ];

    expect(filterSkillEntriesByKeyword(items, 'language').map((item) => item.id)).toEqual(['1']);
  });
});
