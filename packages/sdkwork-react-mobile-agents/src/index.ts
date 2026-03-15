// ============================================
// Types
// ============================================
export type {
  Agent,
  AgentStatus,
  AgentCapability,
  AgentConfig,
  AgentMessage,
  MessageRole,
  MessageStatus,
  MessageAttachment,
  AgentConversation,
  AgentSession,
  AgentUsage,
  AgentStats,
  AgentPromptTemplate,
  AgentTool,
  ToolParameter,
  StreamChunk,
  AgentRequest,
  AgentResponse,
  IAgentService,
} from './types';

// ============================================
// Services
// ============================================
export { agentService, createAgentService } from './services/AgentService';
export { agentSdkService, createAgentSdkService } from './services/AgentSdkService';

// ============================================
// Stores
// ============================================
export { useAgentStore } from './stores/agentStore';

// ============================================
// Hooks
// ============================================
export { useAgents } from './hooks/useAgents';
export { useConversations } from './hooks/useConversations';
export { useTemplates } from './hooks/useTemplates';

// ============================================
// Pages
// ============================================
export { default as AgentsPage } from './pages/AgentsPage';

// ============================================
// i18n (Internationalization)
// ============================================
export {
  useAgentsI18n,
  t,
  setLocale,
  getLocale,
} from './i18n';
export type { AgentsTranslationKeys } from './i18n';

// ============================================
// Bridge (Capacitor Native Bridge)
// ============================================
export {
  // Native Bridges
  ClipboardBridge,
  HapticBridge,
  // Utilities
  isNative,
  getPlatform,
  isFeatureAvailable,
} from './bridge';
export type {
  ClipboardOptions,
  ClipboardResult,
  HapticOptions,
} from './bridge';
