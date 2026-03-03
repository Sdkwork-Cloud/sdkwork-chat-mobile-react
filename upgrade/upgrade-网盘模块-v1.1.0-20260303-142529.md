# 升级需求 - 网盘模块 (v1.1.0)

- 业务模块: 网盘模块 (Drive)
- 版本: v1.1.0
- 时间: 2026-03-03 14:25:29
- 状态: 待 SDK/OpenAPI 实现 agent 处理

## 1. 背景

OpenChat drive service 已接入以下明确接口：

1. `GET /app/v3/api/drive/items`
2. `DELETE /app/v3/api/drive/items/{itemId}`
3. `GET /app/v3/api/filesystem/disks/default`
4. `POST /app/v3/api/filesystem/files` (当前仅可作为 best-effort 创建/文本内容上传)

对于图片/音视频/二进制文件，缺少明确的“上传标准合同”，导致上传能力无法稳定保证。

## 2. 升级目标

1. 提供网盘文件上传的一等 API，语义明确且可观测。
2. 支持 `multipart/form-data` 上传模式，覆盖常见文件类型。
3. 返回结构可直接映射到 drive item，减少应用层补偿逻辑。

## 3. 提议新增接口

1. `POST /app/v3/api/drive/items/upload`
   - 请求: `multipart/form-data`
   - 字段: `file`, `parentId`(可选)
   - 响应: 标准 `ApiResultDriveItemVO`

详细 OpenAPI 见同名 `-openapi.yaml` 文件。

## 4. 兼容策略

1. 不移除现有 `filesystem/files`，新接口增量发布。
2. 应用侧优先调用上传新接口，失败回退旧逻辑。
3. 迁移完成后逐步弱化旧上传路径。

## 5. 交付要求 (给 SDK 实现 agent)

1. 先更新 OpenAPI 3.x。
2. 重新生成 TypeScript SDK。
3. 提供最小回归测试：上传图片、上传文档、上传音频、上传后列表可见。
4. 不在 OpenChat 集成仓库改动 SDK 源码实现。
