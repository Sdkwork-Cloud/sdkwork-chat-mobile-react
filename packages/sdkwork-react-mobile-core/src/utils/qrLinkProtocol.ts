export type OpenChatQrType = 'user' | 'group' | 'agent';

export interface OpenChatQrLinkBuildInput {
  type: OpenChatQrType;
  id: string;
  name?: string;
  baseUrl?: string;
}

export interface OpenChatQrLinkPayload {
  type: OpenChatQrType;
  id: string;
  name?: string;
  raw: string;
}

export const OPENCHAT_QR_LINK_VERSION = '1';
export const OPENCHAT_QR_LINK_ROUTE = '/scan';

const DEFAULT_OPENCHAT_QR_BASE_URL = 'https://sdkwork.ai';

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const normalizeType = (value: string): OpenChatQrType | null => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'user' || normalized === 'friend' || normalized === 'contact') return 'user';
  if (normalized === 'group' || normalized === 'chat-group') return 'group';
  if (normalized === 'agent' || normalized === 'assistant' || normalized === 'bot') return 'agent';
  return null;
};

const pickFirst = (...values: Array<string | null | undefined>): string => {
  for (const value of values) {
    const normalized = normalizeText(value);
    if (normalized) return normalized;
  }
  return '';
};

const isLikelyLocalOrigin = (origin: string): boolean => {
  const normalized = normalizeText(origin).toLowerCase();
  if (!normalized) return true;
  return (
    normalized.includes('localhost')
    || normalized.includes('127.0.0.1')
    || normalized.includes('0.0.0.0')
  );
};

const resolveBaseUrl = (explicitBaseUrl?: string): string => {
  const explicit = normalizeText(explicitBaseUrl);
  if (explicit) return explicit.replace(/\/+$/, '');

  if (typeof window !== 'undefined' && typeof window.location?.origin === 'string') {
    const origin = normalizeText(window.location.origin);
    if (origin && !isLikelyLocalOrigin(origin)) {
      return origin.replace(/\/+$/, '');
    }
  }

  return DEFAULT_OPENCHAT_QR_BASE_URL;
};

const normalizeName = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const isQrMarkerEnabled = (value: string | null): boolean => {
  const normalized = normalizeText(value).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'openchat';
};

export const buildOpenChatQrLink = ({
  type,
  id,
  name,
  baseUrl,
}: OpenChatQrLinkBuildInput): string => {
  const normalizedId = normalizeText(id);
  if (!normalizedId) {
    throw new Error('QR link id is required');
  }

  const root = resolveBaseUrl(baseUrl);
  const url = new URL(OPENCHAT_QR_LINK_ROUTE, `${root}/`);
  url.searchParams.set('qr', '1');
  url.searchParams.set('v', OPENCHAT_QR_LINK_VERSION);
  url.searchParams.set('type', type);
  url.searchParams.set('id', normalizedId);

  const normalizedName = normalizeText(name);
  if (normalizedName) {
    url.searchParams.set('name', normalizedName);
  }

  return url.toString();
};

export const parseOpenChatQrLink = (content: string): OpenChatQrLinkPayload | null => {
  const raw = normalizeText(content);
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const path = normalizeText(url.pathname);
  const isSupportedPath = path === OPENCHAT_QR_LINK_ROUTE || path.startsWith(`${OPENCHAT_QR_LINK_ROUTE}/`);
  if (!isSupportedPath) return null;

  const type = normalizeType(
    pickFirst(
      url.searchParams.get('type'),
      url.searchParams.get('t'),
      url.searchParams.get('entity'),
      url.searchParams.get('target'),
      url.searchParams.get('kind')
    )
  );
  if (!type) return null;

  const id = pickFirst(
    url.searchParams.get('id'),
    url.searchParams.get('i'),
    url.searchParams.get('uid'),
    url.searchParams.get('gid'),
    url.searchParams.get('aid'),
    url.searchParams.get('userId'),
    url.searchParams.get('groupId'),
    url.searchParams.get('agentId')
  );
  if (!id) return null;

  const hasMarker = isQrMarkerEnabled(url.searchParams.get('qr'));
  const version = pickFirst(url.searchParams.get('v'), url.searchParams.get('version'));
  if (!hasMarker && !version) return null;

  const name = normalizeName(
    pickFirst(url.searchParams.get('name'), url.searchParams.get('n'), url.searchParams.get('title'))
  );

  return {
    type,
    id,
    name: name || undefined,
    raw,
  };
};
