# 优学院文件上传工具 - 完整使用指南

## 📋 项目概述

基于HAR网络活动分析实现的优学院自动化文件上传工具，支持账号密码登录和Token认证。

## 🔍 已完成的分析

### 1. 登录流程
- ✅ 账号密码验证API: `/users/check`
- ✅ 登录API: `/users/loginApi`
- ⚠️ **Token获取问题**: 服务器不通过HTTP响应返回Token，需要手动获取

### 2. 上传流程（完全实现）
- ✅ 获取上传令牌
- ✅ 上传到华为云OBS
- ✅ 通知服务器完成
- ✅ 发布到课程

## 🚀 快速开始

### 安装依赖

```bash
uv sync
```

### 方法1: 使用Token上传（推荐）

#### 步骤1: 获取Token

在浏览器中登录优学院后，按F12打开开发者工具，在Console中执行：

```javascript
document.cookie.split(';').find(c => c.includes('AUTHORIZATION')).split('=')[1]
```

复制输出的Token。

#### 步骤2: 上传文件

```bash
# 仅上传
uv run uleaning-upload test.png -t YOUR_TOKEN

# 上传并发布到课程
uv run uleaning-upload test.png -t YOUR_TOKEN -c 153836
```

### 方法2: 使用账号密码（需手动获取Token）

```bash
# 验证账号密码（会提示Token获取问题）
uv run python -c "from uleaning_storage.login import UlearningLogin; print(UlearningLogin().login('username','password'))"

# 然后在浏览器中手动登录获取Token
# 使用获取的Token进行上传
uv run uleaning-upload test.png -t YOUR_TOKEN
```

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `analyze_har.py` | HAR文件分析工具 |
| `har_analysis_report.md` | 详细技术分析报告 |
| `uleaning_storage/login.py` | 登录模块（获取Token） |
| `uleaning_storage/client.py` | **完整客户端（推荐使用）** |
| `uleaning_storage/uploader_v1.py` | 上传工具v1 |
| `uleaning_storage/uploader_v2.py` | 上传工具v2（使用OBS SDK） |
| `TOKEN_ISSUE.md` | Token获取问题说明 |
| `.env.example` | 环境变量模板（复制为 `.env` 后填写） |

## 💡 使用示例

### 示例1: 批量上传文件

```python
from uleaning_storage.client import UlearningClient

# 使用Token初始化
client = UlearningClient(auth_token="YOUR_TOKEN")

# 批量上传
files = ["file1.png", "file2.pdf", "file3.zip"]
for file in files:
    result = client.upload_file(file)
    print(f"上传成功: {result['content_id']}")
```

### 示例2: 上传并发布到课程

```python
from uleaning_storage.client import UlearningClient

client = UlearningClient(auth_token="YOUR_TOKEN")

# 上传文件
result = client.upload_file("lecture.pdf")

# 发布到课程
client.publish_to_course(result['content_id'], course_id="153836")
```

### 示例3: 使用环境变量

```bash
# 设置环境变量
export ULEARNING_TOKEN="YOUR_TOKEN"

# 直接上传（自动读取环境变量）
uv run uleaning-upload test.png
```

## ⚠️ 重要说明

### Token获取限制

由于优学院的特殊登录机制：
- ✅ 可以验证账号密码是否正确
- ❌ 无法通过API自动获取Token
- 💡 需要在浏览器中手动登录一次获取Token

### Token有效期

- Token类似Session Token，可能长期有效
- 建议定期更新Token
- 如果上传失败提示"缺少访问token"，需要重新获取

## 🔧 故障排查

### 问题1: Token无效
```
错误: 缺少访问token
```
**解决**: 重新在浏览器中登录获取新Token

### 问题2: 上传失败
```
错误: OBS上传失败
```
**解决**:
1. 检查网络连接
2. 确认文件路径正确
3. 检查文件大小（建议<100MB）

### 问题3: 模块未找到
```
ModuleNotFoundError: No module named 'requests'
```
**解决**: 执行 `uv sync` 安装依赖，并使用 `uv run uleaning-upload ...` 运行

## 📊 API流程图

```
登录流程:
1. /textbook/cheatCheck → 检查作弊
2. /users/check → 验证账号密码 ✅
3. /users/loginApi → 执行登录 ✅
4. [手动] → 获取Token ⚠️

上传流程:
1. /obs/uploadToken → 获取临时凭证 ✅
2. PUT to OBS → 上传文件 ✅
3. /course/content/upload → 通知服务器 ✅
4. /course/content → 发布到课程 ✅
```

## 📝 配置（推荐使用 .env）

1. 复制模板：

```bash
copy .env.example .env
```

2. 在 `.env` 中填写：

- `ULEARNING_TOKEN=...`
- （可选）`DEFAULT_COURSE_ID=...`

## 🎯 最佳实践

1. **Token管理**: 将Token保存到环境变量或配置文件，不要硬编码
2. **错误处理**: 上传失败时检查Token是否过期
3. **批量操作**: 使用Python脚本批量上传文件
4. **安全性**: 不要将Token提交到公开仓库

## 📚 相关文档

- [HAR分析报告](har_analysis_report.md) - 详细的API分析
- [Token问题说明](TOKEN_ISSUE.md) - Token获取问题的深入分析
- [README.md](README.md) - 项目总览

## 🤝 贡献

基于HAR网络活动分析开发，欢迎提交Issue和PR。

## 📄 许可证

MIT License
