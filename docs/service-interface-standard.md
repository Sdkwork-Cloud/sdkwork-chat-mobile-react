# Service Interface Standard (v2.4-draft)

## 1. 目标

本标准用于统一各业务模块的 Service 封装，确保：

1. 每个业务交互都有清晰的 Service 契约（接口+DTO）。
2. 调用侧（`pages/hooks/stores`）依赖抽象，不依赖具体存储实现。
3. 为未来 SDK 接入预留替换点，实现“先业务闭环、后 SDK 切换”的渐进式演进。

## 2. 强制规范

1. 接口与 DTO
   - 每个模块在 `src/types` 定义 `I*Service`。
   - 请求、响应、过滤器等 DTO 必须定义在 `types`，避免散落在页面和 store。
2. 实现与导出
   - Service 实现类必须 `implements I*Service`。
   - 默认实例导出必须显式接口类型：`const xxxService: I*Service = ...`。
   - 每个 Service 必须提供 `create*Service()` 工厂函数。
   - Service 文件名统一使用 `PascalCase`（如 `ChatService.ts`）。
3. 调用边界
   - `pages/hooks` 禁止直接读写 `localStorage/sessionStorage`。
   - 业务持久化逻辑必须下沉到 `services`。
   - `stores` 仅允许状态编排；若需要持久化，优先调用 service，而非页面层拼装存储逻辑。
4. 返回与错误
   - 结构化业务结果统一以 `Result<T>` 为主。
   - `ServiceResult<T>` 仅允许作为 `type ServiceResult<T> = Result<T>` 的别名，不允许分叉语义。
   - 不可恢复错误可抛异常，由上层统一兜底处理。
5. SDK 预留
   - 工厂函数统一保留强类型注入参数位：`create*Service(_deps?: ServiceFactoryDeps)`。
   - `ServiceFactoryDeps` 统一定义在 `@sdkwork/react-mobile-core/types`，用于后续 SDK/网关/平台能力注入。
   - 调用侧默认使用单例，SDK 接入时可无业务改动切换为工厂实例。

## 3. 第二轮与第三轮治理结果（已完成）

本轮已完成“页面/store 直连存储收敛到 service”核心改造：

1. `wallet`
   - 新增 `IWalletService.setShowBalancePreference(showBalance)`。
   - `walletStore.toggleBalance` 由直接 `localStorage` 写入改为 `walletService` 调用。
2. `settings`
   - 新增 `ISettingsService.estimateStorageUsage()`。
   - `SettingsPage` 存储统计逻辑迁移到 `SettingsService`。
3. `chat`
   - 新增 `IChatService` 前置转发缓存方法：
     - `setForwardContent`
     - `getForwardContent`
     - `clearForwardContent`
   - `ChatPage` 不再直接写 `sessionStorage`。
4. `commerce`
   - 新增 `IGigService` 滚动状态方法：
     - `getGigCenterScrollOffset`
     - `setGigCenterScrollOffset`
     - `clearGigCenterScrollOffset`
   - `GigCenterPage` 滚动缓存迁移到 `gigService`。
5. `user`
   - 新增 `IAgentPreferenceService` 与 `AgentPreferenceOverride`。
   - 新增 `AgentPreferenceService`（含工厂+接口化单例导出）。
   - `MyAgentsPage` 中“隐藏/重命名偏好”不再直接写 `localStorage`。
6. `persist` 统一适配
   - core 新增 `getPersistStorage` 适配器。
   - `agents/creation/commerce` 的 `zustand persist` 已由模块直连 `localStorage` 改为 core 适配器调用。
7. 应用壳层（`src`）收敛
   - 新增 `AppUiStateService` 统一管理浏览器 `local/session` 存储访问。
   - `useScrollRestoration`、`Tabbar`、`ErrorBoundary`、`algorithms.calculateStorageUsage` 已迁移至 service 调用。
8. 事件命名规范统一
   - 统一采用 `domain:action_snake_case`。
   - `agents/contacts/creation` 中旧 camelCase 事件已迁移至 snake_case。
   - core `eventBus` 增加旧事件名兼容映射（`legacy -> canonical`），保障平滑升级。
9. Service 文件命名统一
   - 业务模块 service 文件已统一为 `PascalCase`，并完成全量 import/export 路径修正。
10. 工厂函数注入位统一
   - 所有 `create*Service` 已升级为 `create*Service(_deps?: ServiceFactoryDeps)`，并完成全量类型导入。

## 4.1 自动化校验（新增）

为确保“递归检查可持续执行”，新增标准校验脚本：

1. 命令：`pnpm validate:service-standard`
2. 覆盖规则：
   - service 文件命名必须 `PascalCase`；
   - `create*Service` 工厂签名必须为 `(_deps?: ServiceFactoryDeps)`；
   - 非 service/core 基础设施层禁止直连 `localStorage/sessionStorage`；
   - 非 service/core net 边界禁止直接网络请求；
   - 自动扫描乱码特征（mojibake）并阻断提交。
3. 校验定位：
   - 用于每轮迭代结束后的“红线校验”；
   - 建议纳入 CI，防止规则回退。

## 5. 已识别的不合理点（需确认）

以下为当前标准中的“仍需细化”项，建议确认后固化为 v2.1：

1. 原条款“业务方不得直接读写底层存储”过于绝对
   - 问题：`zustand persist` 场景需要同步存储适配，完全禁止会影响 hydration 性能和复杂度。
   - 建议修正：
     - 禁止 `pages/hooks` 直连存储（必须）。
     - `stores` 不允许业务键的手写存储逻辑，但允许通过统一 `PersistStorageAdapter` 使用存储。
2. 原条款未明确“UI 临时态”归属
   - 问题：滚动位置、转发草稿、开关偏好属于 UI 状态，但直接写页面存储会导致边界漂移。
   - 建议修正：统一定义为模块 `PreferenceService`/`UiStateService` 职责，归口 `services` 管理。
3. 返回模型规范缺少“例外说明”
   - 问题：纯本地确定性方法（如 `getGigCenterScrollOffset`）返回 `Result<T>` 会增加样板代码。
   - 建议修正：跨边界/业务失败可恢复的接口使用 `Result<T>`；纯本地、无业务分支的方法允许直接类型返回。
4. “services 目录全量 PascalCase”存在误伤风险
   - 问题：`services` 目录可能包含导航/适配等辅助文件，不一定是标准 service 契约实现。
   - 建议修正：命名硬规则仅作用于“service 契约文件”（`*Service.ts` 或包含 `create*Service` 工厂）。

## 6. 待执行项（下一轮）

1. 将核心依赖默认装配从 `platform/eventBus/clock/idGenerator/logger` 扩展到 `apiClient/sdk` 映射规则。
2. 在至少 2 个业务模块试点接入 `resolveServiceFactoryRuntimeDeps`，验证 SDK 注入替换链路。
3. `platform-impl/web` 属于基础设施层，保留对浏览器原生存储的可控访问（迁移脚本和设备标识场景）。
4. 持续扩展 `validate:service-standard` 规则（如 service 层事件常量命名一致性、`hooks/pages` 的 `eventBus` 直连禁用等）。

## 6.1 本轮新增完成项

1. `agents/commerce/creation/chat` 的 `hooks` 事件交互已全部迁移为 service 订阅/发布门面。
2. `pnpm validate:service-standard` 当前结果：`Errors: 0`，`Warnings: 0`。

## 6.2 本轮新增完成项（继续迭代）

1. service 层 `eventBus` 事件字面量已完成常量化收敛，覆盖：
   - `agents/commerce/creation/search/chat/auth/contacts/user/social/settings/content/wallet`。
2. 已新增 CI 校验工作流：
   - `.github/workflows/service-standard.yml`；
   - PR 与 `main` 分支推送都会执行 `pnpm validate:service-standard`。

## 6.3 本轮新增完成项（递归收敛）

1. 标准校验脚本新增硬约束：
   - service 层禁止 `eventBus.on/emit('...')` 事件字面量；
   - `pages/hooks/stores` 禁止直接依赖 `eventBus`（必须经由 service 事件门面）。
2. 上述规则已纳入 `pnpm validate:service-standard`，回归即阻断。
3. 新增 service 单例类型守卫：
   - `export const xxxService = createXxxService()` 形式必须显式标注接口类型；
   - 类型必须为 `I*Service`，确保调用侧只依赖契约。
4. 校验范围修正：
   - `src/services/*` 与 `packages/*/src/services/*` 统一纳入；
   - 命名规则仅命中 service 契约文件，辅助文件不误报。
5. 新增运行时依赖模板：
   - core 新增 `ServiceFactoryRuntimeDeps`（最小必选运行时依赖）；
   - 新增 `createDefaultServiceFactoryRuntimeDeps / resolveServiceFactoryRuntimeDeps`；
   - 新增模块模板文档 `docs/service-factory-runtime-template.md`。
6. 模块试点接入（本轮）：
   - `auth` service 已接入 `resolveServiceFactoryRuntimeDeps`，`storage/eventBus/logger/clock` 改为依赖驱动；
   - `creation` service 已接入 `resolveServiceFactoryRuntimeDeps`，`storage/eventBus/clock/idGenerator` 改为依赖驱动。

## 7. 验收清单

1. `pages/hooks` 搜索 `localStorage/sessionStorage` 无业务直连。
2. 新增交互均有 `I*Service` 契约与实现。
3. `index.ts` 对外导出 service 单例与 factory。
4. 标准争议点有明确“规则+例外+迁移路径”。

## 8. v2.3 提议规范（待确认）

1. 事件交互边界
   - `hooks/pages` 禁止直接依赖 `eventBus`；
   - 必须通过 `I*Service` 暴露的事件门面（`onXxx` / `emitXxx`）交互；
   - 事件名在 service 内集中定义常量，禁止散落字符串字面量。
2. Result 统一与例外
   - 跨边界调用（网络、平台、异步存储）默认返回 `Result<T>`；
   - 纯本地确定性方法允许返回原始类型（如 `number/void`），但必须在接口注释里标注“无业务失败分支”。
3. 存储边界
   - `pages/hooks` 禁止直接使用 `localStorage/sessionStorage`；
   - `stores` 允许通过统一持久化适配器接入，不允许业务键手写读写。
4. SDK 预留与依赖注入
   - 工厂签名固定为 `create*Service(_deps?: ServiceFactoryDeps)`；
   - `ServiceFactoryDeps` 仅增不减，新增字段必须是可选，保证兼容。
5. 自动化守护
   - `pnpm validate:service-standard` 作为 CI 必过项；
   - 新增模块必须先补接口与 service，再接入页面逻辑。
