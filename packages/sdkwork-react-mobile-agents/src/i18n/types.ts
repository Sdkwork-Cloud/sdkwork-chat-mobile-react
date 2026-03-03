// 页面翻译键
export type AgentsPageKeys = 
  | 'pages.agents.title'
  | 'pages.agents.search'
  | 'pages.agents.create'
  | 'pages.agents.entering'
  | 'pages.agents.hero_title'
  | 'pages.agents.hero_desc'
  | 'pages.agents.open_failed'
  | 'pages.agents.empty'
  | 'pages.chat.title'
  | 'pages.conversations.title'
  | 'pages.conversations.empty';

// 通用翻译键
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

// 分类翻译键
export type AgentsCategoryKeys = 
  | 'category.all'
  | 'category.productivity'
  | 'category.image'
  | 'category.study'
  | 'category.life'
  | 'category.mine';

// 操作翻译键
export type AgentsActionKeys = 
  | 'actions.createAgent'
  | 'actions.startChat'
  | 'actions.deleteConversation'
  | 'actions.pinConversation'
  | 'actions.unpinConversation'
  | 'actions.clearHistory'
  | 'actions.confirmDelete'
  | 'actions.confirmClearHistory';

// 所有翻译键
export type AgentsTranslationKeys = AgentsPageKeys | AgentsCommonKeys | AgentsCategoryKeys | AgentsActionKeys;
