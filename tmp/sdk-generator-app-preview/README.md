# sdkwork-app-sdk-typescript

Professional TypeScript SDK for SDKWork API.

## Installation

```bash
npm install @sdkwork/app-sdk
# or
yarn add @sdkwork/app-sdk
# or
pnpm add @sdkwork/app-sdk
```

## Quick Start

```typescript
import { SdkworkAppClient } from '@sdkwork/app-sdk';

const client = new SdkworkAppClient({
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
});

// Mode A: API Key (recommended for server-to-server calls)
client.setApiKey('your-api-key');

// Use the SDK
const result = await client.tenant.getTenantTypes();
```

## Authentication Modes (Mutually Exclusive)

Choose exactly one mode for the same client instance.

### Mode A: API Key

```typescript
const client = new SdkworkAppClient({ baseUrl: 'http://localhost:8080' });
client.setApiKey('your-api-key');
// Sends: Authorization: Bearer <apiKey>
```

### Mode B: Dual Token

```typescript
const client = new SdkworkAppClient({ baseUrl: 'http://localhost:8080' });
client.setAuthToken('your-auth-token');
client.setAccessToken('your-access-token');
// Sends:
// Authorization: Bearer <authToken>
// Access-Token: <accessToken>
```

> Do not call `setApiKey(...)` together with `setAuthToken(...)` + `setAccessToken(...)` on the same client.

## Configuration (Non-Auth)

```typescript
import { SdkworkAppClient } from '@sdkwork/app-sdk';

const client = new SdkworkAppClient({
  baseUrl: 'http://localhost:8080',
  timeout: 30000, // Request timeout in ms
  headers: {      // Custom headers
    'X-Custom-Header': 'value',
  },
});
```

## API Modules

- `client.workspaces` - workspaces API
- `client.voiceSpeaker` - voice_speaker API
- `client.video` - video API
- `client.user` - user API
- `client.tool` - tool API
- `client.tenant` - tenant API
- `client.social` - social API
- `client.skill` - skill API
- `client.shops` - shops API
- `client.share` - share API
- `client.settings` - settings API
- `client.ai` - ai API
- `client.projects` - projects API
- `client.products` - products API
- `client.partner` - partner API
- `client.notification` - notification API
- `client.notes` - notes API
- `client.news` - news API
- `client.music` - music API
- `client.knowledgeDocuments` - knowledge_documents API
- `client.invoice` - invoice API
- `client.image` - image API
- `client.style` - style API
- `client.fileSystem` - file_system API
- `client.feedback` - feedback API
- `client.favorite` - favorite API
- `client.drive` - drive API
- `client.documents` - documents API
- `client.dashboard` - dashboard API
- `client.collection` - collection API
- `client.chat` - chat API
- `client.character` - character API
- `client.category` - category API
- `client.cart` - cart API
- `client.assets` - assets API
- `client.app` - app API
- `client.announcement` - announcement API
- `client.agent` - agent API
- `client.advert` - advert API
- `client.wallet` - wallet API
- `client.vote` - vote API
- `client.vip` - vip API
- `client.upload` - upload API
- `client.search` - search API
- `client.rtc` - rtc API
- `client.payments` - payments API
- `client.organization` - organization API
- `client.orders` - orders API
- `client.model` - model API
- `client.history` - history API
- `client.soundEffect` - sound_effect API
- `client.generation` - generation API
- `client.audio` - audio API
- `client.feed` - feed API
- `client.currency` - currency API
- `client.coupons` - coupons API
- `client.comments` - comments API
- `client.auth` - auth API
- `client.audit` - audit API
- `client.analytics` - analytics API
- `client.agentMemory` - agent_memory API
- `client.activity` - activity API
- `client.account` - account API
- `client.ab` - ab API
- `client.sku` - sku API
- `client.tradeTask` - trade_task API
- `client.clawAuth` - claw_auth API
- `client.clawRegistry` - claw_registry API
- `client.openChatAgent` - open_chat_agent API
- `client.openChatWallet` - open_chat_wallet API
- `client.openChatVideo` - open_chat_video API
- `client.openChatDiscover` - open_chat_discover API
- `client.openChatNotification` - open_chat_notification API
- `client.openChatSearch` - open_chat_search API
- `client.openChatSettings` - open_chat_settings API
- `client.openChatSkill` - open_chat_skill API
- `client.openChatTool` - open_chat_tool API
- `client.openChatSocial` - open_chat_social API
- `client.openChatDevice` - open_chat_device API
- `client.openChatAppstore` - open_chat_appstore API
- `client.openChatFile` - open_chat_file API

## Usage Examples

### workspaces

```typescript
// 获取工作空间列表
const result = await client.workspaces.listWorkspaces();
```

### voice_speaker

```typescript
// 获取发音人统计
const result = await client.voiceSpeaker.getStatistics();
```

### video

```typescript
// 获取视频统计
const result = await client.video.getVideoStatistics();
```

### user

```typescript
// 获取用户设置
const result = await client.user.getUserSettings();
```

### tool

```typescript
// List my tools
const result = await client.tool.listMine();
```

### tenant

```typescript
// 获取租户类型列表
const result = await client.tenant.getTenantTypes();
```

### social

```typescript
// List friend requests
const result = await client.social.listFriendRequests();
```

### skill

```typescript
// List skill packages
const result = await client.skill.listPackages();
```

### shops

```typescript
// 获取店铺统计
const result = await client.shops.getStatistics();
```

### share

```typescript
// 获取分享平台配置
const result = await client.share.getSharePlatforms();
```

### settings

```typescript
// 获取界面设置
const result = await client.settings.getUi();
```

### ai

```typescript
// 获取热门提示语
const params = {} as Record<string, any>;
const result = await client.ai.getPopularPrompts(params);
```

### projects

```typescript
// 最近访问项目
const params = {} as Record<string, any>;
const result = await client.projects.listRecent(params);
```

### products

```typescript
// 获取商品分类树
const result = await client.products.getProductCategoryTree();
```

### partner

```typescript
// 获取合作伙伴统计
const result = await client.partner.getPartnerStatistics();
```

### notification

```typescript
// Get notification settings
const result = await client.notification.getNotificationSettings();
```

### notes

```typescript
// 获取文件夹树
const result = await client.notes.listFolders();
```

### news

```typescript
// 获取我的新闻
const params = {} as Record<string, any>;
const result = await client.news.getMy(params);
```

### music

```typescript
// 获取音乐统计
const result = await client.music.getMusicStatistics();
```

### knowledge_documents

```typescript
// Batch delete knowledge documents
const knowledgeBaseId = 1;
const result = await client.knowledgeDocuments.batchDelete(knowledgeBaseId);
```

### invoice

```typescript
// 获取发票统计
const result = await client.invoice.getInvoiceStatistics();
```

### image

```typescript
// 获取图片统计
const result = await client.image.getImageStatistics();
```

### style

```typescript
// 获取风格类型列表
const result = await client.style.getStyleTypes();
```

### file_system

```typescript
// List disks
const result = await client.fileSystem.listDisks();
```

### feedback

```typescript
// 客服信息
const result = await client.feedback.getSupportInfo();
```

### favorite

```typescript
// 收藏夹列表
const result = await client.favorite.listFavoriteFolders();
```

### drive

```typescript
// List drive items
const params = {} as Record<string, any>;
const result = await client.drive.listItems(params);
```

### documents

```typescript
// Batch delete documents
const result = await client.documents.batchDelete();
```

### dashboard

```typescript
// 快捷入口
const result = await client.dashboard.getShortcuts();
```

### collection

```typescript
// 获取合集树
const params = {} as Record<string, any>;
const result = await client.collection.getCollectionTree(params);
```

### chat

```typescript
// 获取会话列表
const params = {} as Record<string, any>;
const result = await client.chat.listSessions(params);
```

### character

```typescript
// 获取热门角色
const params = {} as Record<string, any>;
const result = await client.character.getPopularCharacters(params);
```

### category

```typescript
// 获取分类类型
const result = await client.category.getCategoryTypes();
```

### cart

```typescript
// 获取购物车商品列表
const result = await client.cart.getCartItems();
```

### assets

```typescript
// 获取文件夹列表
const result = await client.assets.listFolders();
```

### app

```typescript
// 获取应用统计
const result = await client.app.getAppStatistics();
```

### announcement

```typescript
// 未读公告
const result = await client.announcement.getUnreadAnnouncements();
```

### agent

```typescript
// List agents
const params = {} as Record<string, any>;
const result = await client.agent.list(params);
```

### advert

```typescript
// 广告设置
const result = await client.advert.getAdvertSettings();
```

### wallet

```typescript
// 钱包总览
const result = await client.wallet.getOverview();
```

### vote

```typescript
// 获取我的投票历史
const params = {} as Record<string, any>;
const result = await client.vote.getMyVotes(params);
```

### vip

```typescript
// 获取VIP状态
const result = await client.vip.getVipStatus();
```

### upload

```typescript
// 获取存储使用情况
const result = await client.upload.getStorageUsage();
```

### search

```typescript
// 搜索统计
const result = await client.search.getSearchStatistics();
```

### rtc

```typescript
// List RTC records
const params = {} as Record<string, any>;
const result = await client.rtc.listRecords(params);
```

### payments

```typescript
// 获取支付统计
const result = await client.payments.getPaymentStatistics();
```

### organization

```typescript
// 获取组织统计
const result = await client.organization.getOrganizationStatistics();
```

### orders

```typescript
// 获取订单统计
const result = await client.orders.getOrderStatistics();
```

### model

```typescript
// Get model types
const result = await client.model.getModelTypes();
```

### history

```typescript
// 历史统计
const result = await client.history.getHistoryStatistics();
```

### sound_effect

```typescript
// 获取任务列表
const params = {} as Record<string, any>;
const result = await client.soundEffect.listTasks(params);
```

### generation

```typescript
// Enhance generation prompt
const body = {} as any;
const result = await client.generation.enhanceGenerationPrompt(body);
```

### audio

```typescript
// 获取语音列表
const params = {} as Record<string, any>;
const result = await client.audio.getVoiceList(params);
```

### feed

```typescript
// Get top feeds
const params = {} as Record<string, any>;
const result = await client.feed.getTopFeeds(params);
```

### currency

```typescript
// 获取货币类型列表
const result = await client.currency.getCurrencyTypes();
```

### coupons

```typescript
// 获取优惠券统计
const result = await client.coupons.getStatistics();
```

### comments

```typescript
// 获取我的评论
const params = {} as Record<string, any>;
const result = await client.comments.getMy(params);
```

### auth

```typescript
// 生成登录二维码
const result = await client.auth.generateQrCode();
```

### audit

```typescript
// 敏感词库
const result = await client.audit.listSensitiveWord();
```

### analytics

```typescript
// 使用统计
const result = await client.analytics.getUserUsageStats();
```

### agent_memory

```typescript
// List knowledge
const agentId = 1;
const result = await client.agentMemory.listKnowledge(agentId);
```

### activity

```typescript
// 获取抽奖列表
const result = await client.activity.listLotteryActivities();
```

### account

```typescript
// 获取积分账户信息
const result = await client.account.getPoints();
```

### ab

```typescript
// 所有特性开关
const result = await client.ab.listFeatureFlags();
```

### sku

```typescript
// 检查SKU编码是否存在
const params = {} as Record<string, any>;
const result = await client.sku.checkSkuCodeExists(params);
```

### trade_task

```typescript
// List tasks published by current user
const params = {} as Record<string, any>;
const result = await client.tradeTask.listPublishedTasks(params);
```

### claw_auth

```typescript
// Claw login
const body = {} as any;
const result = await client.clawAuth.login(body);
```

### claw_registry

```typescript
// Get claw bootstrap
const result = await client.clawRegistry.bootstrap();
```

### open_chat_agent

```typescript
// List agents
const params = {} as Record<string, any>;
const result = await client.openChatAgent.list(params);
```

### open_chat_wallet

```typescript
// Wallet summary
const result = await client.openChatWallet.summary();
```

### open_chat_video

```typescript
// List short videos
const params = {} as Record<string, any>;
const result = await client.openChatVideo.list(params);
```

### open_chat_discover

```typescript
// Discover feed
const params = {} as Record<string, any>;
const result = await client.openChatDiscover.feed(params);
```

### open_chat_notification

```typescript
// Notification page query
const params = {} as Record<string, any>;
const result = await client.openChatNotification.page(params);
```

### open_chat_search

```typescript
// Unified search query
const body = {} as any;
const result = await client.openChatSearch.query(body);
```

### open_chat_settings

```typescript
// Get user setting profile
const result = await client.openChatSettings.get();
```

### open_chat_skill

```typescript
// Skill market list
const params = {} as Record<string, any>;
const result = await client.openChatSkill.market(params);
```

### open_chat_tool

```typescript
// Tool market list
const params = {} as Record<string, any>;
const result = await client.openChatTool.market(params);
```

### open_chat_social

```typescript
// Moments list
const params = {} as Record<string, any>;
const result = await client.openChatSocial.moments(params);
```

### open_chat_device

```typescript
// Device list
const result = await client.openChatDevice.list();
```

### open_chat_appstore

```typescript
// App store app list
const params = {} as Record<string, any>;
const result = await client.openChatAppstore.apps(params);
```

### open_chat_file

```typescript
// Create file upload session
const body = {} as any;
const result = await client.openChatFile.createUploadSession(body);
```

## Error Handling

```typescript
import { SdkworkAppClient, NetworkError, TimeoutError, AuthenticationError } from '@sdkwork/app-sdk';

try {
  const result = await client.tenant.getTenantTypes();
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    throw error;
  }
}
```

## Publishing

This SDK includes cross-platform publish scripts in `bin/`:
- `bin/publish-core.mjs`
- `bin/publish.sh`
- `bin/publish.ps1`

### Check

```bash
./bin/publish.sh --action check
```

### Publish

```bash
./bin/publish.sh --action publish --channel release
```

```powershell
.\bin\publish.ps1 --action publish --channel test --dry-run
```

> Set `NPM_TOKEN` (and optional `NPM_REGISTRY_URL`) before release publish.

## License

MIT
