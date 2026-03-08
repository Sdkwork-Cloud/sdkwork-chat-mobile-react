import React from 'react';
import type { SkillAction, SkillDetailData, SkillEntryType } from '../types';
import { skillsSdkService } from '../services';

export interface UseSkillDetailOptions {
  id?: string;
  type?: SkillEntryType;
}

export interface UseSkillDetailResult {
  detail: SkillDetailData | null;
  isLoading: boolean;
  actionLoading: boolean;
  hasBackend: boolean;
  error: string | null;
  reload: () => Promise<void>;
  resolvePrimaryAction: () => SkillAction;
  performAction: (action: SkillAction) => Promise<void>;
}

function toId(value?: string): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function useSkillDetail(options: UseSkillDetailOptions): UseSkillDetailResult {
  const targetId = React.useMemo(() => toId(options.id), [options.id]);
  const targetType = options.type === 'package' ? 'package' : 'skill';
  const hasBackend = React.useMemo(() => skillsSdkService.hasSdkBaseUrl(), []);

  const [detail, setDetail] = React.useState<SkillDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadDetail = React.useCallback(async () => {
    if (!hasBackend) {
      setDetail(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!targetId) {
      setDetail(null);
      setError('invalid_id');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const nextDetail = targetType === 'package'
      ? await skillsSdkService.getPackageDetail(targetId)
      : await skillsSdkService.getSkillDetail(targetId);

    if (!nextDetail) {
      setDetail(null);
      setError('request_failed');
      setIsLoading(false);
      return;
    }

    setDetail(nextDetail);
    setError(null);
    setIsLoading(false);
  }, [hasBackend, targetId, targetType]);

  React.useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const resolvePrimaryAction = React.useCallback((): SkillAction => {
    if (!detail) return 'install';
    if (detail.installStatus === 'not_installed') return 'install';
    if (detail.installStatus === 'installed_disabled') return 'enable';
    return 'disable';
  }, [detail]);

  const performAction = React.useCallback(async (action: SkillAction) => {
    if (!hasBackend || !targetId) return;

    setActionLoading(true);
    setError(null);

    const nextDetail = targetType === 'package'
      ? await skillsSdkService.applyPackageAction(targetId, action)
      : await skillsSdkService.applySkillAction(targetId, action);

    if (!nextDetail) {
      setError('request_failed');
      setActionLoading(false);
      return;
    }

    setDetail(nextDetail);
    setError(null);
    setActionLoading(false);
  }, [hasBackend, targetId, targetType]);

  return {
    detail,
    isLoading,
    actionLoading,
    hasBackend,
    error,
    reload: loadDetail,
    resolvePrimaryAction,
    performAction,
  };
}
