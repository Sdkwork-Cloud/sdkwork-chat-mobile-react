import { resolveSessionAgent } from '../config/agentRegistry';
import type { ChatSession } from '../types';

interface ResolveSessionDisplayNameOptions {
  fallback?: string;
  groupFallback?: string;
}

const normalizeValue = (value?: string): string => (value || '').trim();

export const resolveSessionDisplayName = (
  session?: Pick<ChatSession, 'type' | 'title' | 'groupName' | 'agentId' | 'agentProfile'> | null,
  options: ResolveSessionDisplayNameOptions = {},
): string => {
  const fallback = options.fallback || 'OpenChat';
  const groupFallback = options.groupFallback || 'Group';
  if (!session) return fallback;

  if (session.type === 'group') {
    return normalizeValue(session.groupName) || groupFallback;
  }

  return (
    normalizeValue(session.title)
    || normalizeValue(resolveSessionAgent(session).name)
    || fallback
  );
};
