# 升级需求 - 社交动态模块 (v1.1.0)

- 业务模块: 社交动态模块 (Moments)
- 版本: v1.1.0
- 时间: 2026-03-03 14:25:29
- 状态: 待 SDK/OpenAPI 实现 agent 处理

## 1. 背景

OpenChat 当前已可接入收藏相关 SDK API，但朋友圈动态 (moments) 仍存在接口语义不完整问题：

1. 现有 `feed` API 提供列表与互动能力，但缺少“发布动态”标准接口。
2. 现有 `comments` API 使用 `contentType + contentId`，对 moments 语义绑定不够明确。
3. 客户端需要稳定的动态对象字段 (`momentId/author/content/images/likeCount/commentCount`) 用于 service 统一封装。

## 2. 当前已明确并可接入能力

1. `GET /app/v3/api/feeds/list` (可用于 feed 列表场景)
2. `POST /app/v3/api/feeds/like/{id}` / `POST /app/v3/api/feeds/unlike/{id}`
3. `POST /app/v3/api/comments` (泛型评论)

> 以上接口无法完整覆盖 OpenChat moments 的发布-互动闭环，需新增专用标准接口。

## 3. 升级目标

1. 定义 moments 领域专用 API，避免泛型接口在业务语义上的歧义。
2. 保证 OpenAPI 3.x 文档先行，便于 SDK 自动生成。
3. 保留兼容路径，避免破坏既有 `feeds/*` 使用方。

## 4. 提议新增接口

1. `GET /app/v3/api/social/moments`
2. `POST /app/v3/api/social/moments`
3. `POST /app/v3/api/social/moments/{momentId}/like`
4. `DELETE /app/v3/api/social/moments/{momentId}/like`
5. `POST /app/v3/api/social/moments/{momentId}/comments`

详细 OpenAPI 见同名 `-openapi.yaml` 文件。

## 5. 兼容策略

1. 新接口以增量方式上线，不删除既有 `feeds/*`。
2. SDK 生成后由应用侧 service 逐步迁移到 `social/moments`。
3. 迁移期间保持 SDK 优先 + 本地兜底。

## 6. 交付要求 (给 SDK 实现 agent)

1. 先更新 OpenAPI 3.x。
2. 基于 OpenAPI 重新生成 TypeScript SDK。
3. 提供最小回归测试：动态发布、点赞/取消点赞、发表评论、列表分页。
4. 不在 OpenChat 集成仓库改动 SDK 源码实现。
