# 快速开始 - 5 分钟部署

## 一键部署到 Cloudflare Pages

### 前置条件

- Cloudflare 账号（免费）
- 优学院账号
- Node.js 18+

### 部署步骤

```bash
# 1. 进入项目目录
cd web

# 2. 安装依赖
npm install
npm install -g wrangler

# 3. 登录 Cloudflare
wrangler login

# 4. 创建数据库
wrangler d1 create storage_db

# 5. 复制输出的 database_id，更新 wrangler.toml
# 编辑 wrangler.toml，将 "your-database-id" 替换为实际的 ID

# 6. 初始化数据库
wrangler d1 execute storage_db --file=schema.sql

# 7. 本地测试（可选）
npm run dev
# 访问 http://localhost:5173 测试

# 8. 部署
npm run build
npm run deploy
```

### 完成！

部署成功后，访问显示的 URL（如 `https://ulearning-storage.pages.dev`），使用优学院账号登录即可使用。

## 使用说明

1. **登录**：使用优学院账号密码登录
2. **上传**：点击"上传文件"按钮，选择文件
3. **管理**：在文件列表查看、下载、删除文件
4. **图床**：切换到"图床"视图，复制图片直链

## 工作原理

```
用户 → Cloudflare Pages → Workers → 优学院 API → 华为云 OBS
```

- 文件存储在优学院的华为云 OBS（免费）
- 前端托管在 Cloudflare Pages（免费）
- 全球 CDN 加速访问

## 常见问题

**Q: 需要付费吗？**
A: 完全免费！利用优学院的存储空间和 Cloudflare 的免费服务。

**Q: 存储空间有多大？**
A: 取决于您的优学院账号配额。

**Q: 上传速度如何？**
A: 取决于网络和华为云 OBS，通常很快。

**Q: 安全吗？**
A: 使用优学院账号认证，文件存储在华为云 OBS，安全可靠。

## 下一步

- 查看完整文档：[README.md](./README.md)
- 了解技术细节：查看 `functions/` 目录
- 自定义界面：修改 `src/components/` 组件

## 获取帮助

遇到问题？查看 [README.md](./README.md) 的故障排查部分。
