# 商城模块 SDK 升级需求 (v1.1.0)

- 模块: 商城（商品 / 购物车 / 订单）
- 版本: `v1.1.0`
- 时间: `2026-03-03 01:05:00`
- 客户端工程: `openchat-react-mobile`
- SDK 工程: `sdkwork-sdk-app`

## 1. 背景

客户端已完成商城模块 TypeScript SDK 优先接入，当前已对接以下能力:

1. 商品列表/详情/分类
2. 购物车查询与增删改选
3. 订单创建、查询、支付、取消、确认收货、退款、统计

在真实联调中发现若干接口标准不足，会导致客户端需要降级或做不稳定映射，建议升级 SDK 对应 OpenAPI 3.x 标准。

## 2. 已发现的标准缺口

1. 购物车加购请求 `productId/skuId` 仅支持数字类型
- 现状: 客户端商品域主键是字符串（如 `prod_1` / uuid）。
- 影响: 需要客户端做数字提取降级，存在映射不稳定风险。
- 建议: 接口标准同时支持 `string` 与 `integer`（`oneOf`），并明确以字符串 ID 作为首选规范。

2. 购物车选中状态变更接口返回 `void`
- 现状: `/cart/items/{id}/select` 与 `/cart/items/select` 无购物车快照返回。
- 影响: 客户端每次操作后必须额外发起 `GET /cart`，产生额外网络开销与状态时序复杂度。
- 建议: 返回 `ShoppingCartVO` 快照，客户端可直接刷新本地状态。

3. 订单统计字段不足
- 现状: `/orders/statistics` 仅有 `pendingPayment/pendingShipment/pendingReceipt/completed`。
- 影响: 客户端 `paid/shipped/cancelled/refunding/refunded` 统计无法精确映射。
- 建议: 扩展统计字段覆盖客户端完整状态集。

4. 订单创建仅支持 `addressId`
- 现状: `POST /orders` 只接受 `addressId`，不支持地址对象直传。
- 影响: 未持久化地址或跨端创建流程需额外依赖地址先创建步骤，流程耦合高。
- 建议: 支持 `shippingAddress` 对象直传（与 `addressId` 二选一）。

5. 商品收藏接口缺失
- 现状: 无商品收藏列表/切换接口。
- 影响: 客户端只能本地收藏，无法跨端同步。
- 建议: 增加 `/products/favorites` 读写接口。

## 3. 升级优先级

1. P0: 购物车 ID 类型兼容 + 选中接口返回快照
2. P1: 订单统计字段扩展 + 订单创建支持地址对象
3. P2: 商品收藏接口

## 4. 兼容性策略

1. 保持旧字段与旧行为可用（增量升级）
2. 新字段、新返回结构作为向后兼容扩展
3. 统一业务成功码仍为 `code = "2000"`

## 5. 验收标准

1. 客户端不再需要对 `productId/skuId` 做数字提取降级
2. 购物车选中相关操作后无需额外 `GET /cart`
3. 订单统计可直接映射完整状态
4. 订单创建在无地址 ID 场景可直接提交地址对象
5. 收藏数据可跨端一致

## 6. 对应 OpenAPI 文档

- `upgrade/upgrade-商城模块-v1.1.0-20260303-010500-openapi.yaml`
