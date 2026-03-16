import { HttpClient, createHttpClient } from './http/client';
import type { SdkworkAppConfig } from './types/common';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import { WorkspacesApi, createWorkspacesApi } from './api/workspaces';
import { VoiceSpeakerApi, createVoiceSpeakerApi } from './api/voice-speaker';
import { VideoApi, createVideoApi } from './api/video';
import { UserApi, createUserApi } from './api/user';
import { ToolApi, createToolApi } from './api/tool';
import { TenantApi, createTenantApi } from './api/tenant';
import { SocialApi, createSocialApi } from './api/social';
import { SkillApi, createSkillApi } from './api/skill';
import { ShopsApi, createShopsApi } from './api/shops';
import { ShareApi, createShareApi } from './api/share';
import { SettingsApi, createSettingsApi } from './api/settings';
import { AiApi, createAiApi } from './api/ai';
import { ProjectsApi, createProjectsApi } from './api/projects';
import { ProductsApi, createProductsApi } from './api/products';
import { PartnerApi, createPartnerApi } from './api/partner';
import { NotificationApi, createNotificationApi } from './api/notification';
import { NotesApi, createNotesApi } from './api/notes';
import { NewsApi, createNewsApi } from './api/news';
import { MusicApi, createMusicApi } from './api/music';
import { KnowledgeDocumentsApi, createKnowledgeDocumentsApi } from './api/knowledge-documents';
import { InvoiceApi, createInvoiceApi } from './api/invoice';
import { ImageApi, createImageApi } from './api/image';
import { StyleApi, createStyleApi } from './api/style';
import { FileSystemApi, createFileSystemApi } from './api/file-system';
import { FeedbackApi, createFeedbackApi } from './api/feedback';
import { FavoriteApi, createFavoriteApi } from './api/favorite';
import { DriveApi, createDriveApi } from './api/drive';
import { DocumentsApi, createDocumentsApi } from './api/documents';
import { DashboardApi, createDashboardApi } from './api/dashboard';
import { CollectionApi, createCollectionApi } from './api/collection';
import { ChatApi, createChatApi } from './api/chat';
import { CharacterApi, createCharacterApi } from './api/character';
import { CategoryApi, createCategoryApi } from './api/category';
import { CartApi, createCartApi } from './api/cart';
import { AssetsApi, createAssetsApi } from './api/assets';
import { AppApi, createAppApi } from './api/app';
import { AnnouncementApi, createAnnouncementApi } from './api/announcement';
import { AgentApi, createAgentApi } from './api/agent';
import { AdvertApi, createAdvertApi } from './api/advert';
import { WalletApi, createWalletApi } from './api/wallet';
import { VoteApi, createVoteApi } from './api/vote';
import { VipApi, createVipApi } from './api/vip';
import { UploadApi, createUploadApi } from './api/upload';
import { SearchApi, createSearchApi } from './api/search';
import { RtcApi, createRtcApi } from './api/rtc';
import { PaymentsApi, createPaymentsApi } from './api/payments';
import { OrganizationApi, createOrganizationApi } from './api/organization';
import { OrdersApi, createOrdersApi } from './api/orders';
import { ModelApi, createModelApi } from './api/model';
import { HistoryApi, createHistoryApi } from './api/history';
import { SoundEffectApi, createSoundEffectApi } from './api/sound-effect';
import { GenerationApi, createGenerationApi } from './api/generation';
import { AudioApi, createAudioApi } from './api/audio';
import { FeedApi, createFeedApi } from './api/feed';
import { CurrencyApi, createCurrencyApi } from './api/currency';
import { CouponsApi, createCouponsApi } from './api/coupons';
import { CommentsApi, createCommentsApi } from './api/comments';
import { AuthApi, createAuthApi } from './api/auth';
import { AuditApi, createAuditApi } from './api/audit';
import { AnalyticsApi, createAnalyticsApi } from './api/analytics';
import { AgentMemoryApi, createAgentMemoryApi } from './api/agent-memory';
import { ActivityApi, createActivityApi } from './api/activity';
import { AccountApi, createAccountApi } from './api/account';
import { AbApi, createAbApi } from './api/ab';
import { SkuApi, createSkuApi } from './api/sku';
import { TradeTaskApi, createTradeTaskApi } from './api/trade-task';
import { ClawAuthApi, createClawAuthApi } from './api/claw-auth';
import { ClawRegistryApi, createClawRegistryApi } from './api/claw-registry';
import { OpenChatAgentApi, createOpenChatAgentApi } from './api/open-chat-agent';
import { OpenChatWalletApi, createOpenChatWalletApi } from './api/open-chat-wallet';
import { OpenChatVideoApi, createOpenChatVideoApi } from './api/open-chat-video';
import { OpenChatDiscoverApi, createOpenChatDiscoverApi } from './api/open-chat-discover';
import { OpenChatNotificationApi, createOpenChatNotificationApi } from './api/open-chat-notification';
import { OpenChatSearchApi, createOpenChatSearchApi } from './api/open-chat-search';
import { OpenChatSettingsApi, createOpenChatSettingsApi } from './api/open-chat-settings';
import { OpenChatSkillApi, createOpenChatSkillApi } from './api/open-chat-skill';
import { OpenChatToolApi, createOpenChatToolApi } from './api/open-chat-tool';
import { OpenChatSocialApi, createOpenChatSocialApi } from './api/open-chat-social';
import { OpenChatDeviceApi, createOpenChatDeviceApi } from './api/open-chat-device';
import { OpenChatAppstoreApi, createOpenChatAppstoreApi } from './api/open-chat-appstore';
import { OpenChatFileApi, createOpenChatFileApi } from './api/open-chat-file';

export class SdkworkAppClient {
  private httpClient: HttpClient;

  public readonly workspaces: WorkspacesApi;
  public readonly voiceSpeaker: VoiceSpeakerApi;
  public readonly video: VideoApi;
  public readonly user: UserApi;
  public readonly tool: ToolApi;
  public readonly tenant: TenantApi;
  public readonly social: SocialApi;
  public readonly skill: SkillApi;
  public readonly shops: ShopsApi;
  public readonly share: ShareApi;
  public readonly settings: SettingsApi;
  public readonly ai: AiApi;
  public readonly projects: ProjectsApi;
  public readonly products: ProductsApi;
  public readonly partner: PartnerApi;
  public readonly notification: NotificationApi;
  public readonly notes: NotesApi;
  public readonly news: NewsApi;
  public readonly music: MusicApi;
  public readonly knowledgeDocuments: KnowledgeDocumentsApi;
  public readonly invoice: InvoiceApi;
  public readonly image: ImageApi;
  public readonly style: StyleApi;
  public readonly fileSystem: FileSystemApi;
  public readonly feedback: FeedbackApi;
  public readonly favorite: FavoriteApi;
  public readonly drive: DriveApi;
  public readonly documents: DocumentsApi;
  public readonly dashboard: DashboardApi;
  public readonly collection: CollectionApi;
  public readonly chat: ChatApi;
  public readonly character: CharacterApi;
  public readonly category: CategoryApi;
  public readonly cart: CartApi;
  public readonly assets: AssetsApi;
  public readonly app: AppApi;
  public readonly announcement: AnnouncementApi;
  public readonly agent: AgentApi;
  public readonly advert: AdvertApi;
  public readonly wallet: WalletApi;
  public readonly vote: VoteApi;
  public readonly vip: VipApi;
  public readonly upload: UploadApi;
  public readonly search: SearchApi;
  public readonly rtc: RtcApi;
  public readonly payments: PaymentsApi;
  public readonly organization: OrganizationApi;
  public readonly orders: OrdersApi;
  public readonly model: ModelApi;
  public readonly history: HistoryApi;
  public readonly soundEffect: SoundEffectApi;
  public readonly generation: GenerationApi;
  public readonly audio: AudioApi;
  public readonly feed: FeedApi;
  public readonly currency: CurrencyApi;
  public readonly coupons: CouponsApi;
  public readonly comments: CommentsApi;
  public readonly auth: AuthApi;
  public readonly audit: AuditApi;
  public readonly analytics: AnalyticsApi;
  public readonly agentMemory: AgentMemoryApi;
  public readonly activity: ActivityApi;
  public readonly account: AccountApi;
  public readonly ab: AbApi;
  public readonly sku: SkuApi;
  public readonly tradeTask: TradeTaskApi;
  public readonly clawAuth: ClawAuthApi;
  public readonly clawRegistry: ClawRegistryApi;
  public readonly openChatAgent: OpenChatAgentApi;
  public readonly openChatWallet: OpenChatWalletApi;
  public readonly openChatVideo: OpenChatVideoApi;
  public readonly openChatDiscover: OpenChatDiscoverApi;
  public readonly openChatNotification: OpenChatNotificationApi;
  public readonly openChatSearch: OpenChatSearchApi;
  public readonly openChatSettings: OpenChatSettingsApi;
  public readonly openChatSkill: OpenChatSkillApi;
  public readonly openChatTool: OpenChatToolApi;
  public readonly openChatSocial: OpenChatSocialApi;
  public readonly openChatDevice: OpenChatDeviceApi;
  public readonly openChatAppstore: OpenChatAppstoreApi;
  public readonly openChatFile: OpenChatFileApi;

  constructor(config: SdkworkAppConfig) {
    this.httpClient = createHttpClient(config);
    this.workspaces = createWorkspacesApi(this.httpClient);

    this.voiceSpeaker = createVoiceSpeakerApi(this.httpClient);

    this.video = createVideoApi(this.httpClient);

    this.user = createUserApi(this.httpClient);

    this.tool = createToolApi(this.httpClient);

    this.tenant = createTenantApi(this.httpClient);

    this.social = createSocialApi(this.httpClient);

    this.skill = createSkillApi(this.httpClient);

    this.shops = createShopsApi(this.httpClient);

    this.share = createShareApi(this.httpClient);

    this.settings = createSettingsApi(this.httpClient);

    this.ai = createAiApi(this.httpClient);

    this.projects = createProjectsApi(this.httpClient);

    this.products = createProductsApi(this.httpClient);

    this.partner = createPartnerApi(this.httpClient);

    this.notification = createNotificationApi(this.httpClient);

    this.notes = createNotesApi(this.httpClient);

    this.news = createNewsApi(this.httpClient);

    this.music = createMusicApi(this.httpClient);

    this.knowledgeDocuments = createKnowledgeDocumentsApi(this.httpClient);

    this.invoice = createInvoiceApi(this.httpClient);

    this.image = createImageApi(this.httpClient);

    this.style = createStyleApi(this.httpClient);

    this.fileSystem = createFileSystemApi(this.httpClient);

    this.feedback = createFeedbackApi(this.httpClient);

    this.favorite = createFavoriteApi(this.httpClient);

    this.drive = createDriveApi(this.httpClient);

    this.documents = createDocumentsApi(this.httpClient);

    this.dashboard = createDashboardApi(this.httpClient);

    this.collection = createCollectionApi(this.httpClient);

    this.chat = createChatApi(this.httpClient);

    this.character = createCharacterApi(this.httpClient);

    this.category = createCategoryApi(this.httpClient);

    this.cart = createCartApi(this.httpClient);

    this.assets = createAssetsApi(this.httpClient);

    this.app = createAppApi(this.httpClient);

    this.announcement = createAnnouncementApi(this.httpClient);

    this.agent = createAgentApi(this.httpClient);

    this.advert = createAdvertApi(this.httpClient);

    this.wallet = createWalletApi(this.httpClient);

    this.vote = createVoteApi(this.httpClient);

    this.vip = createVipApi(this.httpClient);

    this.upload = createUploadApi(this.httpClient);

    this.search = createSearchApi(this.httpClient);

    this.rtc = createRtcApi(this.httpClient);

    this.payments = createPaymentsApi(this.httpClient);

    this.organization = createOrganizationApi(this.httpClient);

    this.orders = createOrdersApi(this.httpClient);

    this.model = createModelApi(this.httpClient);

    this.history = createHistoryApi(this.httpClient);

    this.soundEffect = createSoundEffectApi(this.httpClient);

    this.generation = createGenerationApi(this.httpClient);

    this.audio = createAudioApi(this.httpClient);

    this.feed = createFeedApi(this.httpClient);

    this.currency = createCurrencyApi(this.httpClient);

    this.coupons = createCouponsApi(this.httpClient);

    this.comments = createCommentsApi(this.httpClient);

    this.auth = createAuthApi(this.httpClient);

    this.audit = createAuditApi(this.httpClient);

    this.analytics = createAnalyticsApi(this.httpClient);

    this.agentMemory = createAgentMemoryApi(this.httpClient);

    this.activity = createActivityApi(this.httpClient);

    this.account = createAccountApi(this.httpClient);

    this.ab = createAbApi(this.httpClient);

    this.sku = createSkuApi(this.httpClient);

    this.tradeTask = createTradeTaskApi(this.httpClient);

    this.clawAuth = createClawAuthApi(this.httpClient);

    this.clawRegistry = createClawRegistryApi(this.httpClient);

    this.openChatAgent = createOpenChatAgentApi(this.httpClient);

    this.openChatWallet = createOpenChatWalletApi(this.httpClient);

    this.openChatVideo = createOpenChatVideoApi(this.httpClient);

    this.openChatDiscover = createOpenChatDiscoverApi(this.httpClient);

    this.openChatNotification = createOpenChatNotificationApi(this.httpClient);

    this.openChatSearch = createOpenChatSearchApi(this.httpClient);

    this.openChatSettings = createOpenChatSettingsApi(this.httpClient);

    this.openChatSkill = createOpenChatSkillApi(this.httpClient);

    this.openChatTool = createOpenChatToolApi(this.httpClient);

    this.openChatSocial = createOpenChatSocialApi(this.httpClient);

    this.openChatDevice = createOpenChatDeviceApi(this.httpClient);

    this.openChatAppstore = createOpenChatAppstoreApi(this.httpClient);

    this.openChatFile = createOpenChatFileApi(this.httpClient);
  }

  setApiKey(apiKey: string): this {
    this.httpClient.setApiKey(apiKey);
    return this;
  }

  setAuthToken(token: string): this {
    this.httpClient.setAuthToken(token);
    return this;
  }

  setAccessToken(token: string): this {
    this.httpClient.setAccessToken(token);
    return this;
  }

  setTokenManager(manager: AuthTokenManager): this {
    this.httpClient.setTokenManager(manager);
    return this;
  }

  get http(): HttpClient {
    return this.httpClient;
  }
}

export function createClient(config: SdkworkAppConfig): SdkworkAppClient {
  return new SdkworkAppClient(config);
}

export default SdkworkAppClient;
