interface ResolveChatBackgroundInput {
  sessionBackground?: string | null;
  globalBackground?: string | null;
}

const normalizeBackgroundValue = (value: string | null | undefined): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export const resolveChatBackground = ({
  sessionBackground,
  globalBackground,
}: ResolveChatBackgroundInput): string => {
  const sessionValue = normalizeBackgroundValue(sessionBackground);
  if (sessionValue) return sessionValue;
  return normalizeBackgroundValue(globalBackground);
};
