# 升级需求说明 - 认证模块 v1.1.0

- 文档时间: 2026-03-03 13:11:08
- 业务模块: 认证模块（Auth）
- 版本号: v1.1.0
- 目标仓库:
  - 业务接入侧: `openchat-react-mobile`
  - SDK 定义侧: `sdkwork-sdk-app`

## 1. 背景

OpenChat 认证服务已按 TypeScript SDK 定义完成 SDK 优先接入（登录/注册/刷新/登出 + profile 映射）。

当前已接入 API：
1. `POST /app/v3/api/auth/login`
2. `POST /app/v3/api/auth/register`
3. `POST /app/v3/api/auth/refresh`
4. `POST /app/v3/api/auth/logout`
5. `GET /app/v3/api/user/profile`

## 2. 当前问题

1. `register` 响应仅返回 `UserInfoVO`，不返回 token，移动端无法单步完成注册即登录。
2. `login` 响应中 `userInfo` 非强约束，客户端需要额外 profile 补偿查询。
3. `refresh` 的 `refreshToken` 轮换语义不明确（返回与否、何时轮换）。
4. `code` 成功码存在 `2000` 与 `200` 双写法，业务判断复杂。

## 3. 升级目标

1. 注册流程支持“一步拿 token”。
2. 登录响应保障用户信息可用性。
3. 刷新 token 协议幂等且可预测。
4. 成功码标准统一，降低客户端分支。

## 4. 升级 API 提议

1. 新增 `POST /app/v3/api/auth/register-and-login`
- 入参：`RegisterForm`
- 出参：`PlusApiResultLoginVO`
- 语义：注册成功即返回 `accessToken/refreshToken/userInfo`

2. 明确 `POST /app/v3/api/auth/refresh`
- `data.accessToken` 必须返回
- `data.refreshToken` 建议轮换并返回
- 推荐增加 `tokenVersion` 便于审计

3. 强化 `POST /app/v3/api/auth/login`
- `data.userInfo` 建议改为必填
- 若暂不能必填，OpenAPI 中明确“客户端需调用 profile 补偿”

## 5. 交付规范（给 SDK 实现 Agent）

1. 先更新 OpenAPI 3.x，再生成 SDK。
2. 不手改生成产物。
3. 提供集成测试场景：
- register-and-login 成功路径
- login 缺省 userInfo 的兼容路径
- refresh token 轮换路径

## 6. 对应 OpenAPI 文档

- `upgrade/upgrade-认证模块-v1.1.0-20260303-131108-openapi.yaml`
