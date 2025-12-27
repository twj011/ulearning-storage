# Cloudflare 配置指南

本项目使用 Cloudflare Workers 和 Pages，所有配置通过绑定（Bindings）管理，无需传统的 `.env` 文件。

## 绑定配置

### 必需绑定

#### 1. D1 数据库（必需）

**用途：** 存储文件元数据（文件名、大小、URL 等）

**绑定名称：** `DB`（默认，不要修改）

**配置位置：** `wrangler.toml`

**创建方式：**
```bash
# 自动创建（推荐）
npm run setup

# 或手动创建
npx wrangler d1 create storage_db
```

**配置示例：**
```toml
[[d1_databases]]
binding = "DB"
database_name = "storage_db"
database_id = "1d5bd780-4ec6-4c4c-9043-bd4ce8970d03"
```

**代码中使用：**
```typescript
interface Env {
  DB: D1Database  // 绑定名称必须是 DB
}

// 查询数据库
const result = await env.DB.prepare('SELECT * FROM files').all()
```

### 可选绑定

#### 2. KV 命名空间（可选）

**用途：** 会话管理、缓存

**绑定名称：** `KV`（默认，不要修改）

**配置位置：** `wrangler.toml`

**创建方式：**
```bash
# 自动创建（推荐）
npm run setup

# 或手动创建
npx wrangler kv namespace create KV
npx wrangler kv namespace create KV --preview
```

**配置示例：**
```toml
[[kv_namespaces]]
binding = "KV"
id = "405cd2802fb44429b0bb0eed531a5a7b"
preview_id = "61b614017cfe48b2b06a1e00"
```

**代码中使用：**
```typescript
interface Env {
  KV: KVNamespace  // 绑定名称必须是 KV
}

// 存储会话
await env.KV.put(`session:${sessionId}`, authToken, { expirationTtl: 86400 })

// 读取会话
const token = await env.KV.get(`session:${sessionId}`)
```

## 环境变量（可选）

环境变量在 Cloudflare Dashboard 中配置，用于运行时配置。

### 配置位置

Cloudflare Dashboard → Workers & Pages → 你的项目 → Settings → Environment Variables

### 可用环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `ALLOWED_ORIGINS` | string | `*` | CORS 允许的域名，多个用逗号分隔 |
| `SESSION_TTL` | number | `86400` | 会话过期时间（秒） |

### 配置示例

在 Cloudflare Dashboard 中添加：

```
ALLOWED_ORIGINS = https://yourdomain.com,https://anotherdomain.com
SESSION_TTL = 86400
```

### 代码中使用

```typescript
interface Env {
  DB: D1Database
  KV: KVNamespace
  ALLOWED_ORIGINS?: string  // 可选环境变量
  SESSION_TTL?: string      // 可选环境变量
}

// 使用环境变量
const allowedOrigins = env.ALLOWED_ORIGINS || '*'
const sessionTtl = parseInt(env.SESSION_TTL || '86400')
```

## 绑定名称规范

### 为什么使用默认名称？

- **DB**: 简洁明了，表示数据库
- **KV**: Cloudflare 官方推荐的 KV 绑定名称

### 不要修改绑定名称

代码中硬编码了绑定名称，修改会导致错误：

```typescript
// ❌ 错误：修改了绑定名称
[[d1_databases]]
binding = "MY_DATABASE"  // 代码中找不到 env.MY_DATABASE

// ✅ 正确：使用默认名称
[[d1_databases]]
binding = "DB"  // 代码中使用 env.DB
```

## 快速配置

### 新用户（推荐）

```bash
# 1. 安装依赖
npm install

# 2. 登录 Cloudflare
npx wrangler login

# 3. 自动创建所有资源
npm run setup

# 4. 开始使用
npm run dev
```

### 手动配置

如果自动配置失败，参考 [README.md](README.md) 中的手动配置步骤。

## 本地开发

### 使用本地绑定

默认情况下，`wrangler dev` 使用本地模拟的绑定：

```bash
npm run dev
```

### 使用远程绑定

如果需要连接到真实的 Cloudflare 资源：

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "KV"
id = "your-kv-id"
preview_id = "your-kv-preview-id"

# 添加 remote = true 使用远程 KV
# remote = true
```

然后运行：
```bash
npx wrangler dev --remote
```

## 生产部署

部署到 Cloudflare Pages 时，会自动使用 `wrangler.toml` 中配置的绑定：

```bash
npm run deploy
```

## 故障排查

### 错误：Invalid KV namespace ID

**原因：** `wrangler.toml` 中的 KV ID 无效或不完整

**解决：**
```bash
# 重新运行设置脚本
npm run setup

# 或手动创建
npx wrangler kv namespace create KV
```

### 错误：D1 database not found

**原因：** D1 数据库未创建或 ID 错误

**解决：**
```bash
# 重新运行设置脚本
npm run setup

# 或手动创建
npx wrangler d1 create storage_db
```

### 错误：env.DB is undefined

**原因：** 绑定名称不匹配

**解决：** 确保 `wrangler.toml` 中的绑定名称是 `DB`：
```toml
[[d1_databases]]
binding = "DB"  # 必须是 DB
```

## 相关文档

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)
- [Cloudflare Workers 绑定](https://developers.cloudflare.com/workers/runtime-apis/bindings/)
