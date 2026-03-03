export interface FloatingAssistantVisibilityOptions {
  pageAllowsFloatingBall: boolean;
  openAIAssistantEnabled: boolean;
}

export const shouldRenderFloatingAssistant = ({
  pageAllowsFloatingBall,
  openAIAssistantEnabled,
}: FloatingAssistantVisibilityOptions): boolean => {
  return pageAllowsFloatingBall && openAIAssistantEnabled;
};
