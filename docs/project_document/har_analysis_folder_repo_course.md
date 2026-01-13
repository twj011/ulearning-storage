## 项目结构分析

基于对 `d:/py_work/2025/uleaning-storage` 项目的探索，以下是关键文件及其功能：

### 1. API 路由文件 (api/)

**D:\py_work\2025\uleaning-storage\api\ulearning-api.js**
- 核心 API 封装，包含所有 ulearning 平台的接口调用
- 主要功能：
  - `login()` - 用户登录获取 token
  - `getUploadToken()` - 获取 OBS 上传令牌
  - `notifyUploadComplete()` - 通知平台上传完成
  - `publishToCourse()` - 发布文件到课程
  - `getFileList()` - 获取文件列表
  - `deleteFiles()` - 删除文件
  - `buildRemotePath()` - 构建远程路径

**D:\py_work\2025\uleaning-storage\api\obs-uploader.js**
- OBS 对象存储上传功能
- 使用 Node.js crypto 生成 AWS V4 签名
- `generateSignature()` - 生成签名和请求头
- `uploadToOBS()` - 执行文件上传到 OBS

**D:\py_work\2025\uleaning-storage\api\upload.js**
- 文件上传 API 端点
- 处理前端上传请求，协调 token 获取、OBS 上传、通知完成等流程

**D:\py_work\2025\uleaning-storage\api\files.js**
- 文件管理 API 端点
- GET: 获取文件列表
- DELETE: 删除文件（需要管理员密码）

**D:\py_work\2025\uleaning-storage\api\login.js**
- 登录 API 端点
- 接收用户名密码，返回 authorization token

**D:\py_work\2025\uleaning-storage\api\lib\auth.js**
- 认证辅助模块
- 缓存 token，自动刷新（12小时有效期）
- 从环境变量读取凭证

### 2. 前端组件结构 (src/components/)

**D:\py_work\2025\uleaning-storage\src\App.tsx**
- 应用主入口，配置路由
- 路由：`/` (文件管理器) 和 `/admin` (管理面板)

**D:\py_work\2025\uleaning-storage\src\components\FileManager.tsx**
- 主文件管理界面
- 视图切换：文件列表 / 图床模式
- 集成上传、文件列表、图片画廊组件

**D:\py_work\2025\uleaning-storage\src\components\FileUpload.tsx**
- 文件上传组件
- 使用 react-dropzone 实现拖拽上传
- 将文件转为 base64 发送到后端

**D:\py_work\2025\uleaning-storage\src\components\FileList.tsx**
- 文件列表视图（表格形式）
- 显示文件名、大小、上传时间
- 支持下载和删除操作

**D:\py_work\2025\uleaning-storage\src\components\ImageGallery.tsx**
- 图床视图（网格形式）
- 显示图片缩略图
- 支持复制链接和删除

**D:\py_work\2025\uleaning-storage\src\components\Login.tsx**
- 登录组件（当前未使用）
- 表单提交到 `/api/auth/login`

### 3. Ulearning API 调用代码

所有 ulearning API 调用集中在 **api/ulearning-api.js**，使用的 API 端点：

- `https://courseapi.ulearning.cn/users/login` - 登录
- `https://courseapi.ulearning.cn/obs/uploadToken` - 获取上传令牌
- `https://courseapi.ulearning.cn/course/content/upload` - 通知上传完成
- `https://courseapi.ulearning.cn/course/content` - 发布到课程
- `https://courseapi.ulearning.cn/content/user/list` - 获取文件列表
- `https://courseapi.ulearning.cn/content/delete` - 删除文件

所有请求都包含必要的 headers：
- `Authorization`: token
- `Origin`: https://courseweb.ulearning.cn
- `Referer`: https://courseweb.ulearning.cn/
- `User-Agent`: 模拟浏览器

### 4. HAR文件分析发现

基于对网络活动HAR文件的分析，发现了优学院平台的完整API结构：

#### 4.1 双层数据模型

**库 (Repository)**
- 路径：`/content/user/list`，`/content/delete`
- 功能：文件上传、查看、删除
- 特点：扁平化存储，无文件夹结构
- API：用户上传的原始文件存储位置

**课件 (Course)**
- 路径：`/course/content/*`，`/course/content/directory/*`
- 功能：文件夹管理、文件组织、发布
- 特点：树形结构，支持文件夹层级
- API：结构化的教学内容管理

#### 4.2 新发现的API端点

**文件夹管理API：**
```javascript
// 获取课件目录树
GET /course/content/directory/{courseId}?lang=zh

// 获取课件内容（文件+文件夹）
GET /course/content?ocId={courseId}&parentId={parentId}&pn=1&ps=10&version=2&lang=zh

// 创建文件夹
POST /course/content/editor?lang=zh
Body: {"ocid":"153836","name":"文件夹名","type":0,"share":0,"parentId":0}

// 删除课件内容（文件夹或文件）
POST /course/content/delete?lang=zh
Body: [contentId]

// 移动文件/文件夹
PUT /course/content/move?lang=zh
Body: {"ocId":courseId,"contentIds":[id1,id2],"parentId":targetParentId}
```

**发布管理API：**
```javascript
// 获取课程列表
GET /courses?publishStatus=1&type=1&pn=1&ps=99999&lang=zh

// 发布文件到课件
POST /content/release?lang=zh
Body: {"resources":[resourceIds],"ocIds":[courseIds],"share":"1","parentId":0}
```

#### 4.3 数据流分析

**工作流程：**
1. **上传阶段**：文件上传到"库"（扁平存储）
2. **组织阶段**：在"课件"中创建文件夹结构
3. **发布阶段**：将库文件发布到课件指定位置
4. **管理阶段**：在课件环境中进行文件管理

**权限模型：**
- 普通用户：只能操作"库"中的文件
- 管理员：可以操作"课件"中的文件夹和内容

### 5. 代码实现建议

#### 5.1 API层重构

**新增文件：**
```javascript
// api/course.js - 课件管理API端点
export async function GET(req) {
  const authToken = await getAuthToken()
  const { courseId, parentId = 0 } = req.query
  
  if (req.query.action === 'directory') {
    return getCourseDirectory(authToken, courseId)
  } else {
    return getCourseContent(authToken, courseId, parentId)
  }
}

export async function POST(req) {
  const authToken = await getAuthToken()
  const { courseId, name, parentId = 0 } = await req.json()
  
  return createFolder(authToken, courseId, name, parentId)
}

export async function PUT(req) {
  const authToken = await getAuthToken()
  const { courseId, contentIds, targetParentId } = await req.json()
  
  return moveCourseContent(authToken, courseId, contentIds, targetParentId)
}

export async function DELETE(req) {
  const authToken = await getAuthToken()
  const { contentIds } = await req.json()
  
  return deleteCourseContent(authToken, contentIds)
}
```

#### 5.2 前端组件扩展

**新增组件：**
```typescript
// src/components/CourseManager.tsx
interface CourseManagerProps {
  token: string
}

export default function CourseManager({ token }: CourseManagerProps) {
  const [currentCourse, setCurrentCourse] = useState(courseId)
  const [folderTree, setFolderTree] = useState([])
  const [currentPath, setCurrentPath] = useState([])
  const [files, setFiles] = useState([])
  
  // 文件夹操作
  const createFolder = async (name: string, parentId: number) => { /* ... */ }
  const deleteFolder = async (folderId: number) => { /* ... */ }
  const moveItems = async (itemIds: number[], targetId: number) => { /* ... */ }
  
  // 文件操作
  const publishFromRepo = async (repoFiles: any[], targetFolderId: number) => { /* ... */ }
  
  return (
    <div className="flex h-full">
      <FolderTree tree={folderTree} onNavigate={handleFolderNavigate} />
      <FileList files={files} onMove={moveItems} onDelete={deleteFolder} />
      <PublishDialog onPublish={publishFromRepo} />
    </div>
  )
}
```

#### 5.3 路由扩展

**App.tsx 路由更新：**
```typescript
<Routes>
  <Route path="/" element={<FileManager token="public" onLogout={() => {}} />} />
  <Route path="/admin" element={<AdminPanel />} />
  <Route path="/course" element={<CourseManager token="public" />} />
</Routes>
```

#### 5.4 数据状态管理

**建议使用 Context 或 Zustand：**
```typescript
interface AppState {
  // 库文件状态
  repoFiles: FileItem[]
  
  // 课件状态
  courseStructure: FolderTree[]
  currentCourse: Course | null
  currentPath: number[]
  
  // 操作状态
  selectedItems: number[]
  loading: boolean
}
```

### 6. 实现优先级

**Phase 1: API基础**
1. 扩展 `ulearning-api.js` 添加课件管理函数
2. 创建 `api/course.js` 端点
3. 测试API连通性

**Phase 2: 基础UI**
1. 创建 `CourseManager` 组件
2. 实现文件夹树显示
3. 实现文件列表显示

**Phase 3: 交互功能**
1. 文件夹创建/删除/移动
2. 文件发布功能
3. 拖拽操作

**Phase 4: 优化体验**
1. 批量操作
2. 搜索过滤
3. 权限控制

### 7. 技术架构

这是一个 Vercel 部署的全栈应用：
- 前端：React + TypeScript + Vite + TailwindCSS
- 后端：Vercel Serverless Functions (Node.js)
- 存储：华为云 OBS（通过 ulearning API）
- 数据模型：库（扁平）+ 课件（树形）双层结构
- 部署：Vercel（从 git commit 历史看已从 Cloudflare Workers 迁移）

**核心优势：**
- 分离的存储模型：上传简单，组织灵活
- 完整的API覆盖：支持所有文件管理操作
- 权限分级：普通用户和管理员功能分离
- 渐进式实现：可分阶段开发和部署