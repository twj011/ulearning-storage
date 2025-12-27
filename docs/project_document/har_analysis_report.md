# 优学院网络活动分析报告

## 1. 登录流程分析

### 核心认证机制
- **认证方式**: Token-based Authentication
- **Token格式**: `F3C05332AAAB2CB0561C3F7E2D64F977` (32字符十六进制)
- **Token传递**: 通过 `Authorization` 请求头

### 关键API端点
1. **刷新会话**: `GET /users/login/refresh10Session?uaToken={token}`
2. **验证Token**: `GET /users/isValidToken/{token}?lang=zh`
3. **获取用户信息**: `GET /users/{userId}?lang=zh`
4. **获取菜单权限**: `GET /users/menu/userMenuList?lang=zh`

### 请求头要求
```
Authorization: F3C05332AAAB2CB0561C3F7E2D64F977
Content-Type: application/json
Origin: https://courseweb.ulearning.cn
Referer: https://courseweb.ulearning.cn/
```

---

## 2. 文件上传流程分析

### 上传流程（3步骤）

#### 步骤1: 获取上传令牌
**请求**:
```
GET https://courseapi.ulearning.cn/obs/uploadToken?path=resources/web/{timestamp}.{ext}
Authorization: {your_token}
```

**响应**:
```json
{
  "code": 1,
  "message": "成功",
  "result": {
    "ak": "临时访问密钥",
    "sk": "临时密钥",
    "securitytoken": "临时安全令牌",
    "bucket": "leicloud-huawei",
    "endpoint": "obs.cn-north-4.myhuaweicloud.com",
    "domain": "https://obscloud.ulearning.cn"
  }
}
```

#### 步骤2: 上传文件到华为云OBS
**请求**:
```
PUT https://leicloud-huawei.obs.cn-north-4.myhuaweicloud.com/resources/web/{timestamp}.{ext}
Content-Type: {file_mime_type}
x-obs-date: {current_date}
x-obs-security-token: {security_token}
x-obs-meta-property: property-value
Authorization: OBS {ak}:{signature}
Content-Length: {file_size}

[文件二进制数据]
```

**响应**:
- 状态码: 200
- ETag: 文件MD5哈希值

#### 步骤3: 通知服务器上传完成
**请求**:
```
POST https://courseapi.ulearning.cn/course/content/upload?lang=zh
Authorization: {your_token}
Content-Type: application/json

{
  "title": "文件名.png",
  "type": 1,
  "status": 2,
  "contentSize": 117747,
  "location": "https://obscloud.ulearning.cn/resources/web/{timestamp}.{ext}",
  "mimeType": "png",
  "isView": 0,
  "remark2": 1,
  "remark3": 0
}
```

**响应**:
```
1865501  // contentId
```

---

## 3. 关键技术细节

### OBS签名算法
使用华为云OBS SDK的签名机制，需要：
- Access Key (AK)
- Secret Key (SK)
- Security Token (临时凭证)
- 请求时间戳
- 请求方法和路径

### CORS预检请求
所有跨域请求前都会发送OPTIONS预检：
```
Access-Control-Request-Method: GET/POST/PUT
Access-Control-Request-Headers: authorization,content-type,version
```

### 文件路径命名规则
```
resources/web/{timestamp}{random}.{extension}
例: resources/web/17662817426485714.png
```
- timestamp: 13位毫秒时间戳
- random: 4位随机数
- extension: 文件扩展名

---

## 4. 安全注意事项

1. **Token保护**: Authorization token需要妥善保管
2. **临时凭证**: OBS上传凭证有时效性（约24小时）
3. **HTTPS**: 所有请求必须使用HTTPS
4. **CORS限制**: 只允许从 courseweb.ulearning.cn 域名访问

---

## 5. 实现建议

### Python实现要点
1. 使用 `requests` 库处理HTTP请求
2. 使用 `esdk-obs-python` 或自行实现OBS签名
3. 处理文件分块上传（大文件）
4. 实现重试机制
5. 添加进度回调

### 错误处理
- Token过期: 重新登录获取新token
- 上传失败: 重试机制（最多3次）
- 网络超时: 设置合理的timeout参数
