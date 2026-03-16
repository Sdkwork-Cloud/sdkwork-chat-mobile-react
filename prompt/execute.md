# SDKWork Chat Mobile - 前端SDK接入执行规范

## 项目概述

**应用名称**: sdkwork-chat-mobile-react (OpenChat Mobile)  
**技术栈**: React + TypeScript + Vite + Capacitor + pnpm Workspace  
**SDK接入**: `@sdkwork/app-sdk` (基于 OpenAPI 生成的 TypeScript SDK)  
**目标平台**: iOS / Android 移动应用

---

## 核心原则

### 1. SDK架构理解

```
后端服务 (端口: 8080)
    ↓ OpenAPI 3.x Schema
SDK生成器 (sdkwork-sdk-generator)
    ↓ 生成多语言SDK
@sdkwork/app-sdk (TypeScript SDK包)
    ↓ workspace 依赖
packages/sdkwork-react-mobile-*/services (前端Service层)
    ↓ 业务封装
各业务Package (auth/chat/contacts/wallet/...)
    ↓ Capacitor桥接
原生移动应用 (iOS/Android)
```

### 2. 目录结构规范

```
sdkwork-chat-mobile-react/
├── src/                               # Shell App (主应用壳)
│   ├── app/                           # 应用入口、导航、路由
│   ├── components/                    # 共享UI组件
│   ├── platform/                      # 平台适配层 (Capacitor桥接)
│   └── styles/                        # 全局样式
├── packages/                          # 业务模块分包 (pnpm workspace)
│   ├── sdkwork-react-mobile-core/     # 核心层：SDK客户端、状态管理
│   │   └── src/
│   │       ├── sdk/                   # SDK客户端配置
│   │       │   ├── useAppSdkClient.ts # SDK客户端Hook
│   │       │   └── mappers.ts         # DTO ↔ UI Model 映射
│   │       └── stores/                # 全局状态管理 (Zustand)
│   ├── sdkwork-react-mobile-commons/  # 共享组件库
│   ├── sdkwork-react-mobile-auth/     # 认证模块 (登录/注册/OAuth)
│   ├── sdkwork-react-mobile-chat/     # 聊天模块 (会话/消息)
│   ├── sdkwork-react-mobile-contacts/ # 通讯录模块
│   ├── sdkwork-react-mobile-wallet/   # 钱包模块
│   ├── sdkwork-react-mobile-commerce/ # 电商模块
│   └── ...                            # 其他业务模块
├── android/                           # Android原生项目
├── ios/                               # iOS原生项目 (如存在)
├── scripts/                           # 构建/验证脚本
└── prompt/execute.md                  # 本执行规范
```

### 3. Service层开发规范

所有业务Service必须遵循以下原则：

1. **SDK客户端获取**: 使用 `useAppSdkClient()` Hook
2. **DTO映射**: 使用 `mappers.ts` 中的映射函数转换SDK返回的VO到UI Model
3. **错误处理**: 统一处理SDK调用异常，适配移动端交互
4. **原生能力**: 通过 Capacitor 插件访问设备功能
5. **类型安全**: 充分利用 `@sdkwork/app-sdk` 提供的类型定义

**Service模板示例**:

```typescript
import { useAppSdkClient } from '@sdkwork/react-mobile-core/sdk/useAppSdkClient';
import { mapConversationFromSdk } from '@sdkwork/react-mobile-core/sdk/mappers';
import type { Conversation } from '@sdkwork/react-mobile-chat/types';

export async function fetchConversations(): Promise<Conversation[]> {
  const client = useAppSdkClient();
  try {
    const response = await client.chat.listConversations();
    return (response.data?.items || []).map(mapConversationFromSdk);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    // 移动端错误处理：显示Toast提示
    throw error;
  }
}
```

### 4. Capacitor原生能力使用规范

```typescript
// 正确：通过平台适配层访问原生能力
import { Haptics } from '@capacitor/haptics';
import { Camera } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';

// 触觉反馈
await Haptics.impact({ style: ImpactStyle.Light });

// 相机
const photo = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: CameraResultType.Uri,
  source: CameraSource.Prompt
});

// 本地存储
await Preferences.set({ key: 'token', value: authToken });
```

---

## 执行流程

### 阶段一：环境准备与基础服务

1. **确认后端服务状态**
   - 确保后端服务运行在 `http://localhost:8080`
   - 验证 OpenAPI 文档可访问: `http://localhost:8080/v3/api-docs/app`

2. **检查SDK状态**
   - 确认 `@sdkwork/app-sdk` 包已正确链接 (workspace:*)
   - 验证 SDK 类型定义与后端 API 一致

3. **移动端环境准备**
   - Android: 配置 `android/local.properties` (SDK路径)
   - Java: 配置 `android/gradle.properties` (Java 21路径)
   - 模拟器/真机已连接并通过 `adb devices` 验证

4. **基础Service实现**
   - 实现 `useAppSdkClient.ts` 中的客户端配置
   - 完善 `mappers.ts` 中的核心DTO映射函数
   - 建立统一的错误处理和响应解析机制

### 阶段二：逐个模块SDK接入

按优先级顺序处理各业务模块：

#### P0 - 核心基础模块

1. **Auth (认证模块)**
   - Service: `packages/sdkwork-react-mobile-auth/src/services/appAuthService.ts`
   - API: `/auth/**`, `/login/**`, `/register/**`, `/oauth/**`
   - 功能: 登录、注册、OAuth、Token刷新、生物识别
   - 原生能力: SecureStorage (安全存储token)

2. **User (用户中心)**
   - Service: `packages/sdkwork-react-mobile-user/src/services/`
   - API: `/profile/**`, `/account/**`
   - 功能: 用户信息、个人资料、账户设置

#### P1 - 核心业务模块

1. **Chat (聊天模块)**
   - Service: `packages/sdkwork-react-mobile-chat/src/services/ChatService.ts`
   - API: `/chat/**`, `/session/**`, `/message/**`
   - 功能: 会话列表、消息收发、多媒体消息
   - 原生能力: Camera (拍照/录像)、Filesystem (文件存储)

2. **Contacts (通讯录)**
   - Service: `packages/sdkwork-react-mobile-contacts/src/services/`
   - API: `/contacts/**`, `/friends/**`
   - 功能: 好友列表、添加好友、群组管理

3. **Wallet (钱包)**
   - Service: `packages/sdkwork-react-mobile-wallet/src/services/`
   - API: `/wallet/**`, `/payments/**`
   - 功能: 余额、交易记录、支付
   - 原生能力: BiometricAuth (生物识别验证)

4. **Commerce (电商)**
   - Service: `packages/sdkwork-react-mobile-commerce/src/services/`
   - API: `/product/**`, `/order/**`, `/cart/**`
   - 功能: 商品列表、购物车、订单管理

#### P2 - 扩展业务模块

1. **Agents (智能体)**
   - Service: `packages/sdkwork-react-mobile-agents/src/services/AgentService.ts`
   - API: `/character/**`, `/agent/**`
   - 功能: 智能体列表、对话、创建

2. **Drive (云盘)**
   - API: `/drive/**`, `/file/**`
   - 功能: 文件上传、下载、管理
   - 原生能力: FilePicker、Filesystem

3. **Notifications (通知)**
   - API: `/notification/**`
   - 功能: 消息推送、本地通知
   - 原生能力: PushNotifications、LocalNotifications

#### P3 - 其他模块

- Settings (设置)
- Discover (发现)
- Search (搜索)
- Social (社交)
- ...

### 阶段三：SDK迭代修复流程

当发现SDK不满足业务需求时，按以下流程处理：

```
1. 分析问题
   ↓
2. 定位后端Controller代码
   (路径: spring-ai-plus-business/spring-ai-plus-server-application)
   ↓
3. 修复后端Java代码
   ↓
4. 重新编译启动后端服务
   cd spring-ai-plus-business/spring-ai-plus-server-application
   mvn clean package -DskipTests
   java -jar target/*.jar
   ↓
5. 刷新OpenAPI快照
   curl http://localhost:8080/v3/api-docs/app -o sdkwork-sdk-app/app-openapi-8080.json
   ↓
6. 重新生成SDK
   node sdk/sdkwork-sdk-generator/bin/sdkgen.js generate \
     -i sdkwork-sdk-app/app-openapi-8080.json \
     -o sdkwork-sdk-app/sdkwork-app-sdk-typescript \
     -n sdkwork-app-sdk -t app -l typescript \
     --base-url http://localhost:8080 --api-prefix /app/v3/api
   ↓
7. 移动端重新同步
   pnpm cap:sync
   ↓
8. 验证功能
   pnpm dev:android  # 或 pnpm dev:ios
   ↓
9. 重复迭代直到功能完美
```

---

## 移动端开发检查清单

### 每个模块接入时需检查：

- [ ] SDK API 调用是否正确
- [ ] DTO到UI Model的映射是否完整
- [ ] 错误处理是否完善 (含网络错误、超时处理)
- [ ] 加载状态是否处理 (Skeleton/Loading)
- [ ] 空状态是否处理 (EmptyState)
- [ ] 分页/无限滚动是否正确实现
- [ ] 原生能力调用是否正确 (Camera/Storage等)
- [ ] 权限申请是否处理 (Android/iOS权限)
- [ ] 离线状态是否处理
- [ ] 响应式布局是否正常 (移动端适配)

### 代码质量检查：

```bash
# 运行SDK规范检查
pnpm run check:sdk-standard

# 快速检查
pnpm run check:sdk-standard:quick

# Capacitor基线检查
pnpm run validate:capacitor:baseline

# 构建验证
pnpm run build

# 类型检查
pnpm run typecheck
```

---

## 重要配置

### 环境变量

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_IM_API_BASE_URL=http://localhost:8080
VITE_ACCESS_TOKEN=your-test-token
VITE_APP_ID=com.openchat.ai
```

### SDK客户端配置

```typescript
// 默认配置在 useAppSdkClient.ts 中
const DEFAULT_DEV_BASE_URL = 'http://localhost:8080';
const DEFAULT_TIMEOUT = 30000;
```

### Capacitor配置

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.openchat.ai',
  appName: 'OpenChat',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  // ...其他配置
};
```

### Android项目配置

```properties
# android/gradle.properties
org.gradle.java.home=C:\\Program Files\\Java\\jdk-21

# android/local.properties
sdk.dir=C:\\Users\\admin\\AppData\\Local\\Android\\Sdk
```

---

## 构建与部署

### Web构建

```bash
pnpm build          # 生产构建
pnpm build:staging  # 测试环境构建
```

### 移动端构建

```bash
# Android
pnpm build:app              # 构建并同步
pnpm dev:android            # 开发模式 (同步+打开Android Studio)
pnpm cap:run:android        # 直接运行到设备

# iOS (Mac only)
pnpm dev:ios                # 开发模式
pnpm cap:run:ios            # 直接运行到设备
```

### 原生项目同步

```bash
# 同步web资源到原生项目
pnpm cap:sync

# 仅复制 (不更新依赖)
pnpm cap:copy
```

---

## 调试指南

### Web调试

```bash
pnpm dev              # 启动开发服务器
```

### Android调试

```bash
# 查看日志
adb logcat -s AndroidRuntime:D

# 查看应用特定日志
adb logcat | findstr com.openchat.ai

# Chrome DevTools 调试 WebView
# 1. 在Chrome地址栏输入: chrome://inspect
# 2. 选择设备和应用
```

### iOS调试 (Mac)

```bash
# Safari DevTools 调试 WebView
# 1. Safari → 偏好设置 → 高级 → 显示开发菜单
# 2. 开发 → 选择模拟器/设备 → 选择页面
```

---

## 参考文档

- SDK README: `sdkwork-sdk-app/README.md`
- TypeScript SDK: `sdkwork-sdk-app/sdkwork-app-sdk-typescript/README.md`
- Capacitor文档: https://capacitorjs.com/docs
- 项目规则: `AGENTS.md`
- 架构文档: `docs/`

---

## 成功标准

1. 所有P0/P1模块完成功能接入
2. `pnpm run build` 构建成功
3. `pnpm run typecheck` 类型检查通过
4. Android/iOS原生构建成功
5. 核心业务流程端到端测试通过
6. 代码通过所有规范检查
7. 应用能在模拟器/真机正常运行
