# Mobile IM SDK Integration Design

## Goal

在 `apps/sdkwork-chat-mobile-react` 中明确远程能力边界：

- 登录、账号恢复、token 刷新继续走 `@sdkwork/app-sdk`
- IM、realtime、RTC 统一走 `@openchat/sdkwork-im-sdk`
- 其余业务能力继续走 `@sdkwork/app-sdk`

同时避免在 feature 包中重复处理 token、连接状态和 realtime bootstrap。

## Recommended Approach

采用统一 IM 桥接层。

在 `packages/sdkwork-react-mobile-core` 新增应用级 IM runtime，负责：

- 基于 `VITE_IM_API_BASE_URL` 创建专用 IM backend client
- 复用 app 登录结果，把 auth token 和用户身份同步到 IM runtime
- 用 `im-sdk.session.connectRealtime()` 自举 WuKongIM realtime
- 暴露当前 IM 身份、连接状态、SDK 单例和清理能力

上层 feature 不直接拼装 IM SDK，不直接管理 token。

## Why This Approach

### Option 1: 每个 feature 包自己接 IM SDK

- 优点：初始改动少
- 缺点：token 同步、重连、登出清理、错误恢复会重复实现

### Option 2: 统一 IM 桥接层

- 优点：边界清晰，auth 生命周期和 IM 生命周期一致，后续 chat / communication / contacts / rtc 可复用
- 缺点：第一轮需要先补基础设施

### Option 3: 一次性重写聊天模块为 IM 驱动

- 优点：最终形态最彻底
- 缺点：当前聊天模块仍包含本地 AI 会话语义，一次替换风险过高

推荐 Option 2。

## Scope

本轮闭环：

- core: 增加 IM SDK bridge
- auth: 登录、恢复会话、刷新、登出时同步 IM bridge
- communication: 优先尝试从 IM RTC 读取远程记录，失败回退本地数据
- 工程配置: 让当前工作区可直接解析本地 IM SDK 源码和 WuKongIM runtime 依赖

本轮不做：

- 不把当前 AI agent chat 全量改造成 IM 会话模型
- 不新增后端 contract
- 不改动数据库或 schema

## Data Flow

1. `AppAuthService` 通过 `app-sdk` 完成认证
2. 认证成功后把 `userId + authToken + accessToken` 同步到 core IM bridge
3. core IM bridge 创建 IM backend client，设置 token
4. core IM bridge 调用 `im-sdk.session.connectRealtime()` 建立 realtime
5. RTC/IM feature 通过 core bridge 获取 SDK 和当前 IM 身份

## Error Handling

- app 登录成功是主流程，IM bootstrap 失败不应阻塞认证成功
- IM 失败要保留可观测状态，并允许后续 feature 再次触发连接
- RTC 记录拉取失败回退本地存储，不让页面空白或崩溃

## Testing

- core: IM bridge runtime config、session sync、clear 行为
- auth: 登录/恢复/登出触发 IM sync/clear
- communication: 远程 RTC 记录优先，失败回退本地
