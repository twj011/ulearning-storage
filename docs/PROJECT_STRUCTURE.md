# 项目结构说明

## 目录组织

```
uleaning-storage/
├── src/                          # 源代码（艺术品）
│   ├── uleaning_storage/        # 标准Python包（可安装/可复用）
│   │   ├── __init__.py
│   │   ├── cli.py               # 命令行入口（uleaning-upload）
│   │   ├── client.py            # 完整客户端（推荐使用）
│   │   ├── login.py             # 登录模块
│   │   ├── uploader_v1.py       # 上传工具v1（手动签名）
│   │   ├── uploader_v2.py       # 上传工具v2（OBS SDK）
│   │   ├── api_client.py        # API封装（登录/获取上传令牌/通知/发布）
│   │   ├── http_client.py       # requests.Session 创建与通用headers
│   │   ├── obs_uploader.py      # OBS SDK 上传封装
│   │   ├── utils.py             # 工具函数
│   │   └── config.py            # 配置管理（.env）
│   │
│   ├── analyze_har.py           # HAR分析工具
│   └── analyze_login_har.py     # 登录HAR分析
│
├── docs/                         # 文档
│   ├── todo/                    # 待办事项
│   └── project_document/        # 项目文档
│       ├── API_DISCOVERY.md     # API发现过程
│       ├── har_analysis_report.md
│       ├── USAGE_GUIDE.md
│       ├── TOKEN_ISSUE.md
│       └── HOW_TO_GET_LOGIN_API.py
│
├── examples/                     # 使用示例
│   ├── simple_upload.py         # 简单上传示例
│   └── batch_upload.py          # 批量上传示例
│
├── tests/                        # 测试文件（草稿）
│   └── test_upload.txt          # 测试用文件
│
├── f12-log/                      # HAR文件存档
│   ├── login.har
│   ├── upfile.har
│   ├── real_login.har
│   └── umooc.ulearning.cn_Archive [25-12-21 10-19-55].har
│
├── .env.example                  # 环境配置模板
├── .gitignore                   # Git忽略规则
├── pyproject.toml               # Python依赖与项目配置
├── uv.lock                      # uv 锁定依赖
├── README.md                    # 项目说明
└── PROJECT_STRUCTURE.md         # 本文件
```

## 文件说明

### 核心模块（src/）

| 文件 | 说明 | 状态 |
|------|------|------|
| `uleaning_storage/client.py` | **推荐使用**，完整客户端，支持登录+上传 | ✅ 生产就绪 |
| `uleaning_storage/cli.py` | 命令行工具入口（`uleaning-upload`） | ✅ 生产就绪 |
| `uleaning_storage/login.py` | 独立登录模块，用于获取Token | ✅ 生产就绪 |
| `uleaning_storage/uploader_v2.py` | 上传工具v2，使用OBS SDK | ✅ 生产就绪 |
| `uleaning_storage/uploader_v1.py` | 上传工具v1，手动签名 | ⚠️ 备用方案 |
| `analyze_har.py` | HAR文件分析工具 | 🔧 开发工具 |
| `uleaning_storage/config.py` | 配置管理，支持.env文件 | ✅ 生产就绪 |

### 文档（docs/project_document/）

| 文件 | 说明 |
|------|------|
| `API_DISCOVERY.md` | **重要**：记录API发现过程和关键发现 |
| `USAGE_GUIDE.md` | 完整使用指南 |
| `har_analysis_report.md` | 详细的HAR分析报告 |
| `TOKEN_ISSUE.md` | Token获取问题说明（已解决） |

### 示例（examples/）

| 文件 | 说明 |
|------|------|
| `simple_upload.py` | 简单上传示例，适合快速上手 |
| `batch_upload.py` | 批量上传示例，适合批量操作 |

## 使用建议

### 日常使用
```bash
# 推荐：使用命令行入口（安装后）
uleaning-upload file.png -t YOUR_TOKEN -c 153836
```

### 开发调试
```bash
# 分析新的HAR文件
uv run python src/analyze_har.py

# 测试登录（示例：直接调用包内登录类）
uv run python -c "from uleaning_storage.login import UlearningLogin; print(UlearningLogin().login('username','password'))"

# 直接上传（建议）
uv run uleaning-upload test.png -t YOUR_TOKEN -c 153836
```

### 批量操作
```bash
# 参考examples/batch_upload.py
python examples/batch_upload.py
```

## 设计原则

1. **源代码（src/）= 艺术品**
   - 代码质量高，可直接用于生产
   - 完整的错误处理
   - 清晰的文档注释

2. **测试文件（tests/）= 草稿**
   - 用于临时测试
   - 不提交到版本控制
   - 可随时删除

3. **文档（docs/）= 知识库**
   - 记录发现过程
   - 保存技术细节
   - 便于后续维护

4. **示例（examples/）= 教程**
   - 简单易懂
   - 可直接运行
   - 覆盖常见场景
