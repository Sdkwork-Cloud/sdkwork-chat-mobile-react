# 升级需求说明 - 地址模块 v1.1.0

- 文档时间: 2026-03-03 13:11:08
- 业务模块: 地址模块（User Address）
- 版本号: v1.1.0
- 目标仓库:
  - 业务接入侧: `openchat-react-mobile`
  - SDK 定义侧: `sdkwork-sdk-app`

## 1. 背景

OpenChat 地址服务已完成 SDK 优先接入，覆盖：
1. `GET /app/v3/api/user/address`
2. `POST /app/v3/api/user/address`
3. `PUT /app/v3/api/user/address/{addressId}`
4. `DELETE /app/v3/api/user/address/{addressId}`
5. `PUT /app/v3/api/user/address/{addressId}/default`

## 2. 当前问题

1. `id` 类型在各端实现中存在 number/string 混用风险。
2. `addressDetail` 与 `fullAddress` 语义边界不清。
3. 区域字段（省市区）使用 code，但业务侧也存在自由文本地址需求。

## 3. 升级目标

1. 统一地址 ID 类型，避免客户端强制转换。
2. 明确写入与展示字段职责。
3. 支持“结构化区域 + 自由地址”并行场景。

## 4. 升级 API 提议

1. 地址 ID 标准化
- OpenAPI 统一 `addressId: string`。

2. 字段职责标准化
- `addressDetail`: 用户可写详细地址。
- `fullAddress`: 服务端拼装只读字段。

3. 区域字段兼容扩展
- 保留 `provinceCode/cityCode/districtCode`。
- 新增可选 `provinceName/cityName/districtName`，便于离线/外部地址源。

## 5. 交付规范（给 SDK 实现 Agent）

1. 先更新 OpenAPI 3.x，再生成 SDK。
2. 不手改 SDK 生成代码。
3. 覆盖测试场景：
- create/update/list roundtrip
- default 切换幂等
- string id 全链路兼容

## 6. 对应 OpenAPI 文档

- `upgrade/upgrade-地址模块-v1.1.0-20260303-131108-openapi.yaml`
