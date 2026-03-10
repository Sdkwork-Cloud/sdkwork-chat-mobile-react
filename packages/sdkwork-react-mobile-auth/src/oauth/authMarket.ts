import type { AuthMarket, ResolvedAuthMarket } from './oauthTypes';

export interface ResolveAuthMarketInput {
  requestedMarket?: AuthMarket | null;
  envMarket?: string | null;
  locale?: string | null;
}

export interface ResolveRuntimeAuthMarketInput extends ResolveAuthMarketInput {
  globalMarket?: string | null;
}

const normalizeMarket = (value: string | null | undefined): AuthMarket | undefined => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'cn') return 'cn';
  if (normalized === 'global') return 'global';
  if (normalized === 'auto') return 'auto';
  return undefined;
};

export const inferAuthMarketFromLocale = (locale: string | null | undefined): ResolvedAuthMarket => {
  const normalized = String(locale || '').trim().toLowerCase();
  if (!normalized) return 'global';
  if (normalized === 'zh' || normalized.startsWith('zh-cn') || normalized.startsWith('zh-hans')) {
    return 'cn';
  }
  return 'global';
};

export const resolveAuthMarket = ({
  requestedMarket,
  envMarket,
  locale,
}: ResolveAuthMarketInput): ResolvedAuthMarket => {
  const explicit = normalizeMarket(requestedMarket);
  if (explicit && explicit !== 'auto') return explicit;

  const envResolved = normalizeMarket(envMarket);
  if (envResolved && envResolved !== 'auto') return envResolved;

  return inferAuthMarketFromLocale(locale);
};

const readImportMetaEnvMarket = (): string | undefined => {
  const meta = import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  };
  return meta.env?.VITE_AUTH_MARKET;
};

const readGlobalAuthMarket = (): string | undefined => {
  if (typeof globalThis === 'undefined') return undefined;
  const runtimeGlobal = globalThis as typeof globalThis & {
    __SDKWORK_AUTH_MARKET__?: string;
  };
  return runtimeGlobal.__SDKWORK_AUTH_MARKET__;
};

export const resolveRuntimeAuthMarket = ({
  requestedMarket,
  envMarket,
  globalMarket,
  locale,
}: ResolveRuntimeAuthMarketInput): ResolvedAuthMarket =>
  resolveAuthMarket({
    requestedMarket,
    envMarket: envMarket ?? readImportMetaEnvMarket() ?? globalMarket ?? readGlobalAuthMarket(),
    locale,
  });
