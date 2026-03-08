export const normalizePathname = (value: string): string => {
  const trimmed = (value || '').trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const withoutHash = withLeadingSlash.split('#')[0] || '/';
  const compact = withoutHash.replace(/\/{2,}/g, '/');
  if (compact.length <= 1) return '/';
  return compact.replace(/\/+$/, '');
};

export type ResolveRouteTargetResult =
  | { ok: true; path: string }
  | { ok: false; path: string; reason: 'unknown-route' };

export interface ResolveRouteTargetInput {
  rawPath: string;
  routeExists: (path: string) => boolean;
}

export const resolveRouteTarget = ({
  rawPath,
  routeExists,
}: ResolveRouteTargetInput): ResolveRouteTargetResult => {
  const normalizedPath = normalizePathname(rawPath);
  if (!routeExists(normalizedPath)) {
    return { ok: false, path: normalizedPath, reason: 'unknown-route' };
  }
  return { ok: true, path: normalizedPath };
};

export interface ResolveInitialPathInput {
  rawPath: string;
  fallbackPath: string;
  routeExists: (path: string) => boolean;
}

export const resolveInitialPath = ({
  rawPath,
  fallbackPath,
  routeExists,
}: ResolveInitialPathInput): string => {
  const target = resolveRouteTarget({ rawPath, routeExists });
  if (target.ok) return target.path;
  return normalizePathname(fallbackPath);
};
