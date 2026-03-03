# 升级需求说明 - 发票模块 v1.1.0

- 文档时间: 2026-03-03 14:12:35
- 业务模块: 发票模块（Invoice Title）
- 版本号: v1.1.0
- 目标仓库:
  - 业务接入侧: `openchat-react-mobile`
  - SDK 定义侧: `sdkwork-sdk-app`

## 1. 背景

OpenChat `IInvoiceService` 是“用户发票抬头管理”语义：
1. 获取发票抬头列表
2. 保存/编辑发票抬头
3. 删除发票抬头
4. 设置默认抬头

当前 SDK 已有 `invoice` 域接口更偏向“发票单据流程”（创建、提交、作废、统计），与“抬头管理”不是同一语义层。

## 2. 当前问题

1. 缺少用户抬头列表接口（现有 `invoice/my` 语义不稳定，返回模型为发票单据）。
2. 缺少默认抬头设置接口。
3. 缺少抬头专属字段模型（个人/企业抬头、税号、默认标志）。
4. 缺少抬头删除语义接口（`cancel` 是发票作废，不等于删除抬头）。

## 3. 升级目标

1. 为移动端补齐“发票抬头”专用 API。
2. 明确抬头与发票单据两类模型边界。
3. 支持默认抬头一致性与幂等写入。

## 4. 升级 API 提议

1. `GET /app/v3/api/user/invoice-titles`
- 获取当前用户抬头列表。

2. `POST /app/v3/api/user/invoice-titles`
- 创建抬头。

3. `PUT /app/v3/api/user/invoice-titles/{id}`
- 更新抬头。

4. `DELETE /app/v3/api/user/invoice-titles/{id}`
- 删除抬头。

5. `PUT /app/v3/api/user/invoice-titles/{id}/default`
- 设置默认抬头（幂等）。

## 5. 交付规范（给 SDK 实现 Agent）

1. 先更新 OpenAPI 3.x，再生成 SDK。
2. 不手改 SDK 生成代码。
3. 覆盖测试场景：
- list/create/update/delete 流程
- default 切换与幂等
- 企业/个人抬头字段兼容

## 6. 对应 OpenAPI 文档

- `upgrade/upgrade-发票模块-v1.1.0-20260303-141235-openapi.yaml`
