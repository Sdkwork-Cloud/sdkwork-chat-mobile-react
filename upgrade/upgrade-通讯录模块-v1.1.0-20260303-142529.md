# 升级需求 - 通讯录模块 (v1.1.0)

- 业务模块: 通讯录模块 (Contacts)
- 版本: v1.1.0
- 时间: 2026-03-03 14:25:29
- 状态: 待 SDK/OpenAPI 实现 agent 处理

## 1. 背景

OpenChat 通讯录 service 需要以下稳定能力：

1. 联系人列表/新增/删除。
2. 好友请求列表/发起/接受/拒绝。
3. 返回字段可直接映射到 `Contact` 与 `FriendRequest`。

当前 SDK 的 `social/follow*` 更偏“关注关系”，与通讯录 + 好友请求语义不一致，存在边界冲突。

## 2. 当前可参考但不完全匹配的接口

1. `GET /app/v3/api/social/following`
2. `POST /app/v3/api/social/follow/{userId}`
3. `DELETE /app/v3/api/social/follow/{userId}`

> 以上接口缺少好友请求生命周期，且联系人字段语义并非通讯录标准模型。

## 3. 升级目标

1. 提供通讯录领域独立 API，而不是复用关注关系接口。
2. 统一联系人与好友请求的数据模型。
3. 为 SDK 代码生成提供明确 OpenAPI 3.x 文档。

## 4. 提议新增接口

1. `GET /app/v3/api/user/contacts`
2. `POST /app/v3/api/user/contacts`
3. `DELETE /app/v3/api/user/contacts/{contactId}`
4. `GET /app/v3/api/user/friend-requests`
5. `POST /app/v3/api/user/friend-requests`
6. `PUT /app/v3/api/user/friend-requests/{requestId}/accept`
7. `PUT /app/v3/api/user/friend-requests/{requestId}/reject`

详细 OpenAPI 见同名 `-openapi.yaml` 文件。

## 5. 兼容策略

1. 新增接口优先，不移除旧 `social/follow*`。
2. OpenChat contacts service 在 SDK 可用后切换为 SDK 优先。
3. 本地兜底逻辑保留，用于渐进式迁移。

## 6. 交付要求 (给 SDK 实现 agent)

1. 先更新 OpenAPI 3.x。
2. 重新生成 TypeScript SDK。
3. 提供最小回归测试：联系人增删、好友请求发起/接受/拒绝。
4. 不在 OpenChat 集成仓库改动 SDK 源码实现。
