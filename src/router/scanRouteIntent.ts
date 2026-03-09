import { parseOpenChatQrLink } from '@sdkwork/react-mobile-core';

export type ScanRouteIntentType = 'user' | 'group' | 'agent' | 'unknown';

export interface ScanRouteIntent {
  type: ScanRouteIntentType;
  raw: string;
  id?: string;
  name?: string;
}

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeType = (value: string | undefined): ScanRouteIntentType => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'user' || normalized === 'friend' || normalized === 'contact') return 'user';
  if (normalized === 'group' || normalized === 'chat-group') return 'group';
  if (normalized === 'agent' || normalized === 'bot' || normalized === 'assistant') return 'agent';
  return 'unknown';
};

const pickFirst = (...values: Array<string | null | undefined>): string | undefined => {
  for (const value of values) {
    const normalized = normalizeText(value);
    if (normalized) return normalized;
  }
  return undefined;
};

const tryResolveFromJson = (raw: string): ScanRouteIntent | null => {
  if (!raw.startsWith('{') || !raw.endsWith('}')) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const type = normalizeType(
      pickFirst(
        normalizeText(parsed.type),
        normalizeText(parsed.entityType),
        normalizeText(parsed.targetType)
      )
    );
    if (type === 'unknown') return null;
    const id = pickFirst(
      normalizeText(parsed.id),
      normalizeText(parsed.userId),
      normalizeText(parsed.groupId),
      normalizeText(parsed.agentId)
    );
    const name = pickFirst(normalizeText(parsed.name), normalizeText(parsed.title));
    return {
      type,
      raw,
      id,
      name,
    };
  } catch {
    return null;
  }
};

const tryResolveFromUrl = (raw: string): ScanRouteIntent | null => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const segments = url.pathname.split('/').map((item) => item.trim()).filter(Boolean);
  const typeFromQuery = normalizeType(
    pickFirst(
      url.searchParams.get('type'),
      url.searchParams.get('entity'),
      url.searchParams.get('target'),
      url.searchParams.get('kind')
    )
  );

  let type = typeFromQuery;
  let idFromPath: string | undefined;
  for (let i = 0; i < segments.length; i += 1) {
    const segmentType = normalizeType(segments[i]);
    if (segmentType === 'unknown') continue;
    type = segmentType;
    idFromPath = pickFirst(segments[i + 1]);
    break;
  }

  if (type === 'unknown') return null;

  const id = pickFirst(
    type === 'user' ? url.searchParams.get('userId') : undefined,
    type === 'group' ? url.searchParams.get('groupId') : undefined,
    type === 'agent' ? url.searchParams.get('agentId') : undefined,
    url.searchParams.get('id'),
    url.searchParams.get('uid'),
    url.searchParams.get('gid'),
    idFromPath
  );

  const name = pickFirst(
    safeDecode(normalizeText(url.searchParams.get('name'))),
    safeDecode(normalizeText(url.searchParams.get('title')))
  );

  return {
    type,
    raw,
    id,
    name,
  };
};

const tryResolveFromToken = (raw: string): ScanRouteIntent | null => {
  const tokenMatch = raw.match(/^(user|group|agent)[/:|]([^/:|]+)(?:[/:|](.+))?$/i);
  if (!tokenMatch) return null;

  const type = normalizeType(tokenMatch[1]);
  if (type === 'unknown') return null;

  const id = normalizeText(tokenMatch[2]);
  const name = normalizeText(tokenMatch[3] ? safeDecode(tokenMatch[3]) : '');
  return {
    type,
    raw,
    id: id || undefined,
    name: name || undefined,
  };
};

export const resolveScanRouteIntent = (content: string): ScanRouteIntent => {
  const raw = normalizeText(content);
  if (!raw) return { type: 'unknown', raw: '' };

  const standardLink = parseOpenChatQrLink(raw);
  if (standardLink) {
    return {
      type: standardLink.type,
      raw,
      id: standardLink.id,
      name: standardLink.name,
    };
  }

  const byJson = tryResolveFromJson(raw);
  if (byJson) return byJson;

  const byUrl = tryResolveFromUrl(raw);
  if (byUrl) return byUrl;

  const byToken = tryResolveFromToken(raw);
  if (byToken) return byToken;

  return {
    type: 'unknown',
    raw,
  };
};
