# 升级需求说明 - 聊天模块 v1.1.0

- 文档时间: 2026-03-03 12:56:20
- 业务模块: 聊天模块（Chat）
- 版本号: v1.1.0
- 目标仓库:
  - 业务接入侧: `openchat-react-mobile`
  - SDK 定义侧: `sdkwork-sdk-app`

## 1. 背景

OpenChat 已按 `sdkwork-sdk-app` TypeScript 定义完成实际接入（会话创建 + 消息发送）。

当前已接入的 SDK 能力：
1. `POST /app/v3/api/chat/sessions`（创建会话）
2. `POST /app/v3/api/chat/sessions/{sessionId}/messages`（发送消息）

当前不足：
1. 缺少可消费的流式返回协议（SSE/NDJSON 规范不完整）
2. 缺少按 `streamId` 的标准取消接口
3. 缺少富消息载荷（附件、多模态、幂等键）统一规范

## 2. 升级目标

1. 在不破坏现有接口的前提下提供标准流式协议。
2. 为流式生成提供显式、幂等、可观测的取消接口。
3. 增加富消息 API，避免客户端通过字符串拼接传递非文本内容。
4. 统一错误码与错误名称，便于 SDK 和业务端稳定兜底。

## 3. 需要新增/升级的 API

1. `POST /app/v3/api/chat/sessions/{sessionId}/messages/stream`
- 定义标准 SSE 事件结构：
  - `event: delta`
  - `event: done`
  - `event: error`
- 返回字段必须包含 `streamId`、`requestId`、`code`、`msg`。

2. `POST /app/v3/api/chat/sessions/{sessionId}/streams/{streamId}:cancel`
- 按 stream 取消生成，不再仅按 session 粗粒度停止。
- 要求幂等（重复取消返回 success）。

3. `POST /app/v3/api/chat/sessions/{sessionId}/messages/rich`
- 支持结构化附件与多模态参数：
  - `attachments[]`
  - `clientMessageId`
  - `idempotencyKey`
  - `generationOptions`

## 4. 交付规范（给 SDK 实现 Agent）

1. 先更新 OpenAPI 3.x，再生成 SDK 代码。
2. 不直接手工改业务侧 SDK 生成文件。
3. 新增 API 必须有：
- 请求/响应 schema
- 成功/失败示例
- 错误码说明
- 至少一个集成测试场景（流式完成、流式取消、幂等消息）

## 5. 对应 OpenAPI 文档

- `upgrade/upgrade-聊天模块-v1.1.0-20260303-125620-openapi.yaml`

