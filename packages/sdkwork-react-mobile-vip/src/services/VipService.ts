import {
  APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  getAppSdkCoreClientWithSession,
} from '@sdkwork/react-mobile-core';
import type {
  PlusApiResultListVipPackVO,
  PlusApiResultLong,
  PlusApiResultVipPurchaseVO,
  PlusApiResultVipStatusVO,
  VipPackVO,
  VipPurchaseVO,
  VipStatusVO,
} from '@sdkwork/app-sdk';

const SUCCESS_CODE = '2000';

type ApiResult<T> = {
  code?: string;
  msg?: string;
  data?: T;
};

export interface MobileVipPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  durationDays: number;
  points: number;
  tags: string[];
  recommended: boolean;
}

export interface MobileVipOverview {
  status: VipStatusVO | null;
  pointsBalance: number;
  plans: MobileVipPlan[];
}

function unwrapResult<T>(result: ApiResult<T>, fallback: string): T {
  const code = (result?.code || '').trim();
  if (code && code !== SUCCESS_CODE) {
    throw new Error((result?.msg || '').trim() || fallback);
  }
  return (result?.data as T) || ({} as T);
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function mapPlan(pack: VipPackVO): MobileVipPlan | null {
  const id = toNumber(pack.id, Number.NaN);
  if (!Number.isFinite(id)) {
    return null;
  }

  const name = normalizeText(pack.name) || normalizeText(pack.levelName) || `VIP ${id}`;
  const description = normalizeText(pack.description) || undefined;
  const price = toNumber(pack.price, 0);
  const originalPrice = toNumber(pack.originalPrice, 0);

  return {
    id,
    name,
    description,
    price,
    originalPrice: originalPrice > price ? originalPrice : undefined,
    durationDays: Math.max(0, toNumber(pack.vipDurationDays, 0)),
    points: Math.max(0, toNumber(pack.pointAmount, 0)),
    tags: Array.isArray(pack.tags) ? pack.tags.map((item) => normalizeText(item)).filter(Boolean) : [],
    recommended: Boolean(pack.recommended),
  };
}

function sortPlans(plans: MobileVipPlan[]): MobileVipPlan[] {
  return [...plans].sort((left, right) => {
    if (left.recommended !== right.recommended) {
      return left.recommended ? -1 : 1;
    }
    if (left.price !== right.price) {
      return left.price - right.price;
    }
    return left.durationDays - right.durationDays;
  });
}

async function getClient() {
  return getAppSdkCoreClientWithSession({
    authStorageKey: APP_SDK_AUTH_TOKEN_STORAGE_KEY,
  });
}

async function getOverview(): Promise<MobileVipOverview> {
  const client = await getClient();
  const [statusResponse, packsResponse, pointsResponse] = await Promise.all([
    client.vip.getVipStatus(),
    client.vip.listAllPacks(),
    client.vip.getPointsBalance().catch(() => ({ data: 0 } as PlusApiResultLong)),
  ]);

  const status = unwrapResult<VipStatusVO>(
    statusResponse as PlusApiResultVipStatusVO,
    'Failed to load VIP status',
  );
  const packs = unwrapResult<VipPackVO[]>(
    packsResponse as PlusApiResultListVipPackVO,
    'Failed to load VIP plans',
  );
  const points = unwrapResult<number>(pointsResponse as PlusApiResultLong, 'Failed to load VIP points balance');

  const plans = sortPlans(
    (Array.isArray(packs) ? packs : [])
      .map((pack) => mapPlan(pack))
      .filter((plan): plan is MobileVipPlan => !!plan),
  );

  return {
    status: Object.keys(status || {}).length > 0 ? status : null,
    pointsBalance: Math.max(0, toNumber(points, 0)),
    plans,
  };
}

async function purchase(packId: number): Promise<VipPurchaseVO> {
  const client = await getClient();
  const response = await client.vip.purchase({ packId });
  return unwrapResult<VipPurchaseVO>(response as PlusApiResultVipPurchaseVO, 'Failed to purchase VIP plan');
}

export const vipService = {
  getOverview,
  purchase,
};
