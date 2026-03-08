export const ROUTE_PATHS = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',

  root: '/',
  contacts: '/contacts',
  discover: '/discover',
  me: '/me',

  chat: '/chat',
  conversationList: '/conversation-list',
  chatDetails: '/chat-details',
  chatFiles: '/chat-files',

  agents: '/agents',
  agentDetails: '/agent-details',
  agentStore: '/agent-store',
  contactProfile: '/contact-profile',
  newFriends: '/new-friends',
  addFriend: '/add-friend',

  moments: '/moments',
  video: '/video',
  videoDetails: '/video-details',
  shake: '/shake',
  app: '/app',
  skills: '/skills',
  skillDetail: '/skills/detail',

  profileInfo: '/profile-info',
  profileEdit: '/profile-edit',
  profileBinding: '/profile-binding',
  accountSecurity: '/account-security',
  myQRCode: '/my-qrcode',
  myAddress: '/my-address',
  myAgents: '/my-agents',
  myCreations: '/my-creations',
  myInvoice: '/my-invoice',
  myActivityHistory: '/my-activity-history',
  myUserSettings: '/my-user-settings',
  vip: '/vip',

  settings: '/settings',
  theme: '/theme',
  chatBackground: '/chat-background',
  general: '/general',
  settingsBackground: '/settings/background',
  modelSettings: '/model-settings',
  modelConfig: '/model-config',
  feedback: '/feedback',

  notifications: '/notifications',
  wallet: '/wallet',
  drive: '/drive',
  nearby: '/nearby',
  search: '/search',
  scan: '/scan',
  joinGroup: '/join-group',

  creation: '/creation',
  creationDetail: '/creation/detail',
  creationSearch: '/creation/search',

  shopping: '/shopping',
  category: '/category',
  product: '/product',
  shoppingCart: '/shopping-cart',
  orderConfirmation: '/order-confirmation',
  orders: '/orders',
  orderDetail: '/order-detail',
  orderCenter: '/order-center',
  gigCenter: '/gig-center',
  myGigs: '/my-gigs',
  distribution: '/distribution',
  distributionGoods: '/distribution-goods',
  myTeam: '/my-team',
  commission: '/commission',
  distributionRank: '/distribution-rank',
  withdraw: '/withdraw',
  sharePoster: '/share-poster',

  appointments: '/appointments',
  appointmentsDetail: '/appointments/detail',

  groupDetails: '/group-details',
  favorites: '/favorites',

  content: '/content',
  look: '/look',
  media: '/media',
  articleDetail: '/article/detail',

  communication: '/communication',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
export type RoutePathInput = RoutePath | `${RoutePath}?${string}`;

export const ROUTE_PREFIXES = {
  profile: '/profile',
  settings: '/settings',
  my: '/my-',
  conversation: '/conversation',
  agent: '/agent',
} as const;

export type RoutePrefix = (typeof ROUTE_PREFIXES)[keyof typeof ROUTE_PREFIXES];
