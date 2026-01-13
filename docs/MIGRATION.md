# 从 Python CLI 到 Cloudflare Pages 的迁移说明

## 项目背景

原项目 `uleaning-storage` 是一个 Python CLI 工具，用于将优学院（Ulearning）平台作为免费网盘使用。现在我们将其改造为一个独立的在线网盘系统，部署到 Cloudflare Pages。

## 架构对比

### 原架构（Python CLI）

```
用户 → Python CLI → 优学院 API → 华为云 OBS
```

- 依赖优学院平台
- 需要本地运行 Python
- 使用华为云 OBS 存储
- 命令行操作

### 新架构（Cloudflare Pages）

```
用户 → Web UI → Cloudflare Workers → Cloudflare R2
                      ↓
                Cloudflare D1
```

- 完全独立的系统
- 浏览器访问，无需安装
- 使用 Cloudflare R2 存储
- 图形化界面

## 核心功能迁移

| 原功能 | 新实现 | 说明 |
|--------|--------|------|
| 登录认证 | JWT + D1 数据库 | 自建用户系统 |
| 文件上传 | R2 + Workers | 直接上传到 R2 |
| 文件管理 | React UI | 可视化文件管理器 |
| 命令行工具 | Web 界面 | 更友好的用户体验 |

## 代码迁移映射

### 1. 认证模块

**原代码：** `src/uleaning_storage/login.py`
```python
class UlearningLogin:
    def login(username, password):
        # 调用优学院 API
```

**新代码：** `web/functions/[[path]].ts`
```typescript
async function handleAuth(request, env) {
  // 查询 D1 数据库
  // 生成 JWT token
}
```

### 2. 文件上传

**原代码：** `src/uleaning_storage/obs_uploader.py`
```python
class OBSUploader:
    def upload(file_path):
        # 上传到华为云 OBS
```

**新代码：** `web/functions/[[path]].ts`
```typescript
async function handleFiles(request, env) {
  // 上传到 Cloudflare R2
  await env.STORAGE.put(key, file.stream())
}
```

### 3. API 客户端

**原代码：** `src/uleaning_storage/api_client.py`
```python
class APIClient:
    def get_upload_token():
        # 获取上传令牌
```

**新代码：** 不再需要，直接使用 R2 API

## 优势对比

### 原方案（优学院）

✅ 免费存储空间
✅ 无需自己搭建服务器
❌ 依赖第三方平台
❌ 可能违反服务条款
❌ 功能受限
❌ 需要本地运行

### 新方案（Cloudflare）

✅ 完全独立可控
✅ 合法合规使用
✅ 全球 CDN 加速
✅ 无服务器架构
✅ 免费额度充足
✅ 浏览器直接访问
✅ 可扩展性强
❌ 需要 Cloudflare 账号

## 免费额度对比

### 优学院（原方案）
- 存储空间：未知（可能被限制）
- 风险：账号可能被封禁

### Cloudflare（新方案）
- R2 存储：10 GB 免费
- D1 数据库：5 GB 免费
- Pages 托管：无限请求
- Workers：每天 10 万次请求
- 风险：无，正常使用

## 迁移建议

如果您之前使用 Python CLI 版本：

1. **导出数据**：使用原 CLI 工具下载所有文件
2. **部署新系统**：按照 QUICKSTART.md 部署
3. **重新上传**：通过 Web 界面上传文件
4. **删除旧数据**：清理优学院平台上的文件

## 保留原项目的价值

原 Python CLI 项目仍然有价值：

1. **学习参考**：展示如何通过 HAR 分析逆向 API
2. **技术文档**：详细的 API 发现过程
3. **代码示例**：Python 客户端实现参考

建议保留原项目代码和文档，作为技术学习资料。

## 下一步

1. 部署新系统：参考 [QUICKSTART.md](./QUICKSTART.md)
2. 迁移数据：手动上传重要文件
3. 测试功能：确保所有功能正常
4. 自定义配置：根据需求调整

## 技术支持

如有问题，请查看：
- [完整文档](./README.md)
- [快速开始](./QUICKSTART.md)
- [Cloudflare 文档](https://developers.cloudflare.com/)
