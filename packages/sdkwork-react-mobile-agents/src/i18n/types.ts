// Page translation keys
export type AgentsPageKeys =
  | 'pages.agents.title'
  | 'pages.agents.search'
  | 'pages.agents.create'
  | 'pages.agents.entering'
  | 'pages.agents.scan.title'
  | 'pages.agents.scan.open'
  | 'pages.agents.hero_title'
  | 'pages.agents.hero_desc'
  | 'pages.agents.open_failed'
  | 'pages.agents.empty'
  | 'pages.chat.title'
  | 'pages.conversations.title'
  | 'pages.conversations.empty';

// Common translation keys
export type AgentsCommonKeys =
  | 'common.agent'
  | 'common.agents'
  | 'common.conversation'
  | 'common.conversations'
  | 'common.message'
  | 'common.messages'
  | 'common.send'
  | 'common.loading'
  | 'common.retry'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.save'
  | 'common.favorite'
  | 'common.unfavorite'
  | 'common.default'
  | 'common.system'
  | 'common.custom';

// Category translation keys
export type AgentsCategoryKeys =
  | 'category.all'
  | 'category.productivity'
  | 'category.image'
  | 'category.study'
  | 'category.life'
  | 'category.mine';

// Action translation keys
export type AgentsActionKeys =
  | 'actions.createAgent'
  | 'actions.startChat'
  | 'actions.deleteConversation'
  | 'actions.pinConversation'
  | 'actions.unpinConversation'
  | 'actions.clearHistory'
  | 'actions.confirmDelete'
  | 'actions.confirmClearHistory';

// Full translation key union
export type AgentsTranslationKeys =
  | AgentsPageKeys
  | AgentsCommonKeys
  | AgentsCategoryKeys
  | AgentsActionKeys;
