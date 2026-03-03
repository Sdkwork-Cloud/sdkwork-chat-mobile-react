# 升级需求说明 - 设置模块 v1.1.0

- 文档时间: 2026-03-03 13:11:08
- 业务模块: 设置模块（Settings）
- 版本号: v1.1.0
- 目标仓库:
  - 业务接入侧: `openchat-react-mobile`
  - SDK 定义侧: `sdkwork-sdk-app`

## 1. 背景

OpenChat 设置服务已完成 SDK 优先接入，覆盖：
1. `GET /app/v3/api/settings/ui`
2. `PUT /app/v3/api/settings/ui`
3. `PUT /app/v3/api/settings/ui/theme`
4. `PUT /app/v3/api/settings/ui/language`
5. `GET /app/v3/api/user/settings`
6. `PUT /app/v3/api/user/settings`

## 2. 当前问题

1. `settings/ui` 与 `user/settings` 在 `theme/language` 上职责重叠。
2. UI 主题枚举（`light/dark/system`）与业务侧历史主题模型不一致。
3. 部分字段语义不清（`fontSize` 字符串与 `zoomLevel` 数值并存，优先级不明确）。

## 3. 升级目标

1. 明确设置域模型，消除重复真源。
2. 提供稳定主题映射标准，减少客户端适配逻辑。
3. 定义可预测的 partial update 语义。

## 4. 升级 API 提议

1. 新增统一偏好接口 `GET/PUT /app/v3/api/settings/preferences`
- 作为主题、语言、字体、通知等通用偏好真源。
- `settings/ui` 与 `user/settings` 可保留为兼容层，并标注 deprecated。

2. 主题标准化
- 增加统一枚举：`system/light/dark`。
- 在 OpenAPI 增加扩展映射（兼容历史主题）。

3. 字体缩放标准化
- 明确 `fontScale` 为主字段（数值）。
- `fontSize` 作为可选展示字段。

## 5. 交付规范（给 SDK 实现 Agent）

1. 先更新 OpenAPI 3.x，再生成 SDK。
2. 不手改 SDK 生成代码。
3. 覆盖测试场景：
- preferences 读写回环
- theme/language 在兼容端点与统一端点的一致性
- 旧字段映射回归

## 6. 对应 OpenAPI 文档

- `upgrade/upgrade-设置模块-v1.1.0-20260303-131108-openapi.yaml`
