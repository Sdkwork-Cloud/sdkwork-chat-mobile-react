# Service Factory Runtime Template (v2.4-draft)

## 1. 目的

为模块提供统一的 service 依赖注入模板，便于从“本地实现”平滑过渡到“SDK 实现”。

## 2. 依赖模型

核心最小依赖模型定义在 `@sdkwork/react-mobile-core`：

1. `ServiceFactoryRuntimeDeps`（最小运行时依赖）
   - `storage`
   - `eventBus`
   - `logger`
   - `clock`
   - `idGenerator`
2. `ServiceFactoryDeps`（向后兼容）
   - `Partial<ServiceFactoryRuntimeDeps>` + `sdk/apiClient` 扩展位。

## 3. 模块模板

```ts
import {
  resolveServiceFactoryRuntimeDeps,
  type ServiceFactoryDeps,
} from '@sdkwork/react-mobile-core';
import type { IExampleService } from '../types';

class ExampleServiceImpl implements IExampleService {
  constructor(private readonly deps = resolveServiceFactoryRuntimeDeps()) {}

  async createEntity(input: { name: string }) {
    const id = this.deps.idGenerator.next('example');
    const now = this.deps.clock.now();
    await this.deps.storage.set(`example:${id}`, { id, name: input.name, createTime: now, updateTime: now });
    this.deps.eventBus.emit('example:created', { id });
    this.deps.logger.info('ExampleService', 'Entity created', { id });
  }
}

export function createExampleService(_deps?: ServiceFactoryDeps): IExampleService {
  return new ExampleServiceImpl(resolveServiceFactoryRuntimeDeps(_deps));
}

export const exampleService: IExampleService = createExampleService();
```

## 4. 迁移建议

1. 第一阶段：只改工厂签名与类型，业务逻辑保持不变。
2. 第二阶段：逐步把 `Date.now / crypto.randomUUID / eventBus / storage / logger` 替换为 `deps` 调用。
3. 第三阶段：接入 SDK 时只在 `create*Service(_deps)` 注入 SDK 依赖，不改页面与 hooks 代码。
