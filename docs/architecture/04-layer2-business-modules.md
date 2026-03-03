# Layer 2: Business Modules (业务模块层)

## 概述

业务模块层 (Layer 2) 包含所有业务领域的功能模块。每个业务包都是高内聚、低耦合的独立单元，包含完整的业务逻辑、状态管理、页面组件和服务。

## 包命名规范

所有业务包统一使用 `sdkwork-react-mobile-{module}` 命名格式：

- `sdkwork-react-mobile-user` - 用户管理
- `sdkwork-react-mobile-contacts` - 联系人管理
- `sdkwork-react-mobile-chat` - 聊天模块
- `sdkwork-react-mobile-commerce` - 电商模块
- `sdkwork-react-mobile-agents` - AI 智能体
- `sdkwork-react-mobile-creation` - AI 创作
- `sdkwork-react-mobile-social` - 社交功能（朋友圈、收藏）
- `sdkwork-react-mobile-wallet` - 钱包支付
- 等等...

## 目录结构规范

每个业务包必须遵循以下目录结构：

```
packages/sdkwork-react-mobile-{module}/
├── package.json              # 包配置
├── tsconfig.json             # TypeScript 配置
├── tsconfig.node.json        # Node 类型配置
├── vite.config.ts            # Vite 构建配置
├── src/
│   ├── index.ts              # 统一入口导出
│   ├── types/
│   │   └── index.ts          # 类型定义
│   ├── services/
│   │   └── {module}Service.ts # 业务服务层
│   ├── stores/
│   │   └── {module}Store.ts  # Zustand 状态管理
│   ├── hooks/
│   │   └── use{Module}.ts    # React Hooks
│   └── pages/                # 页面组件
│       ├── {Module}Page.tsx
│       ├── {Module}ListPage.tsx
│       └── {Module}DetailPage.tsx
```

## 各模块详细说明

### 1. sdkwork-react-mobile-user (用户模块)

**职责**: 用户个人信息管理

**Services**:
- `UserService.ts` - 用户资料管理
- `addressService.ts` - 收货地址管理
- `invoiceService.ts` - 发票抬头管理

**Pages**:
- `MePage.tsx` - 我的主页
- `ProfileInfoPage.tsx` - 个人信息页
- `MyAddressPage.tsx` - 我的地址
- `MyInvoiceTitlePage.tsx` - 我的发票
- `MyQRCodePage.tsx` - 我的二维码
- `MyAgentsPage.tsx` - 我的智能体
- `MyCreationsPage.tsx` - 我的创作

**Types**:
- `UserProfile`, `Address`, `InvoiceTitle`

### 2. sdkwork-react-mobile-contacts (联系人模块)

**职责**: 联系人管理、好友请求

**Services**:
- `ContactsService.ts` - 联系人管理
- `friendRequestService.ts` - 好友请求处理

**Pages**:
- `ContactsPage.tsx` - 联系人列表
- `ContactProfilePage.tsx` - 联系人详情
- `NewFriendsPage.tsx` - 新的朋友

**Types**:
- `Contact`, `FriendRequest`

### 3. sdkwork-react-mobile-chat (聊天模块)

**职责**: 即时通讯核心功能

**Services**:
- `ChatService.ts` - 聊天消息管理
- `conversationService.ts` - 会话管理

**Pages**:
- `ChatPage.tsx` - 聊天列表
- `ChatDetailsPage.tsx` - 聊天详情
- `ChatFilesPage.tsx` - 聊天文件

**Components**:
- `MessageList.tsx`, `MessageInput.tsx`, `ChatBubble.tsx`

**Types**:
- `Message`, `Conversation`, `ChatSettings`

### 4. sdkwork-react-mobile-commerce (电商模块)

**职责**: 商品、购物车、订单、分销

**Services**:
- `ProductService.ts` - 商品管理
- `CartService.ts` - 购物车管理
- `OrderService.ts` - 订单管理
- `DistributionService.ts` - 分销管理
- `GigService.ts` - 服务市场

**Pages**:
- `MallPage.tsx` - 商城首页
- `ProductDetailPage.tsx` - 商品详情
- `ShoppingCartPage.tsx` - 购物车
- `OrderConfirmationPage.tsx` - 订单确认
- `OrderListPage.tsx` - 订单列表
- `OrderDetailPage.tsx` - 订单详情
- `CategoryPage.tsx` - 分类页
- `DistributionCenterPage.tsx` - 分销中心
- `GigCenterPage.tsx` - 服务市场
- `MyGigsPage.tsx` - 我的服务
- `CommissionPage.tsx` - 佣金明细
- `WithdrawPage.tsx` - 提现
- `MyTeamPage.tsx` - 我的团队

**Types**:
- `Product`, `Cart`, `Order`, `Distributor`, `Gig`

### 5. sdkwork-react-mobile-agents (AI 智能体模块)

**职责**: AI 智能体管理、对话

**Services**:
- `AgentService.ts` - 智能体管理
- `conversationService.ts` - 对话管理

**Pages**:
- `AgentsPage.tsx` - 智能体列表
- `AgentChatPage.tsx` - 智能体对话
- `AgentConfigPage.tsx` - 智能体配置

**Types**:
- `Agent`, `AgentConversation`, `AgentMessage`

### 6. sdkwork-react-mobile-creation (AI 创作模块)

**职责**: AI 图像、视频、音乐生成

**Services**:
- `CreationService.ts` - 创作任务管理

**Pages**:
- `CreationPage.tsx` - 创作首页
- `CreationDetailPage.tsx` - 创作详情
- `CreationSearchPage.tsx` - 创作搜索
- `ImageCreationPage.tsx` - 图像创作
- `VideoCreationPage.tsx` - 视频创作
- `MusicCreationPage.tsx` - 音乐创作

**Types**:
- `Creation`, `CreationStyle`, `CreationPrompt`

### 7. sdkwork-react-mobile-social (社交模块)

**职责**: 朋友圈、收藏

**Services**:
- `momentsService.ts` - 朋友圈管理
- `favoritesService.ts` - 收藏管理

**Pages**:
- `MomentsPage.tsx` - 朋友圈
- `FavoritesPage.tsx` - 我的收藏
- `MomentDetailPage.tsx` - 动态详情

**Types**:
- `Moment`, `Favorite`, `Comment`, `Like`

### 8. sdkwork-react-mobile-wallet (钱包模块)

**职责**: 支付、红包、账单

**Services**:
- `walletService.ts` - 钱包管理
- `redPacketService.ts` - 红包管理

**Pages**:
- `WalletPage.tsx` - 钱包首页
- `RedPacketPage.tsx` - 红包
- `TransactionPage.tsx` - 交易记录

**Types**:
- `Wallet`, `Transaction`, `RedPacket`

### 9. sdkwork-react-mobile-notification (通知模块)

**职责**: 消息通知管理

**Services**:
- `notificationService.ts` - 通知管理

**Pages**:
- `NotificationsPage.tsx` - 通知列表

**Types**:
- `Notification`, `NotificationSettings`

### 10. sdkwork-react-mobile-settings (设置模块)

**职责**: 应用设置

**Services**:
- `settingsService.ts` - 设置管理

**Pages**:
- `SettingsPage.tsx` - 设置首页
- `GeneralPage.tsx` - 通用设置
- `ThemePage.tsx` - 主题设置
- `ChatBackgroundPage.tsx` - 聊天背景
- `ModelSettingsPage.tsx` - 模型设置
- `ModelConfigDetailPage.tsx` - 模型配置详情

**Types**:
- `AppSettings`, `ThemeSettings`

### 11. sdkwork-react-mobile-search (搜索模块)

**职责**: 全局搜索

**Services**:
- `SearchService.ts` - 搜索服务

**Pages**:
- `SearchPage.tsx` - 搜索页

**Types**:
- `SearchResult`, `SearchHistory`

### 12. sdkwork-react-mobile-communication (通讯模块)

**职责**: 音视频通话

**Services**:
- `callService.ts` - 通话服务

**Pages**:
- `VideoCallPage.tsx` - 视频通话
- `
