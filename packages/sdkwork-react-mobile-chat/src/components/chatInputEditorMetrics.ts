export interface ChatInputEditorMetrics {
  height: number;
  overflow: boolean;
}

export const resolveChatInputEditorMetrics = (
  scrollHeight: number,
  minHeight = 24,
  maxHeight = 136
): ChatInputEditorMetrics => {
  const normalizedHeight = Number.isFinite(scrollHeight) ? scrollHeight : minHeight;
  const height = Math.min(maxHeight, Math.max(minHeight, normalizedHeight));

  return {
    height,
    overflow: normalizedHeight > maxHeight,
  };
};
