# API发现文档

## 登录API

### 关键发现
经过HAR文件分析，发现登录API使用 **POST** 方法（而非GET）。

### API详情

**端点**: `POST https://courseapi.ulearning.cn/users/login`

**请求**:
```json
{
    "loginName": "username",
    "password": "password"
}
```

**响应**:
```json
{
    "userId": 13967952,
    "loginName": "1@ttwwjj.ddns-ip.net",
    "name": "唐伟佳",
    "orgId": 11,
    "roleId": 81,
    "authorization": "DAD6DECD834A78507746A7060E78FFD7"
}
```

**Token位置**: 响应体的 `authorization` 字段

## 上传API

### 流程（3步骤）

#### 1. 获取上传令牌
```
GET /obs/uploadToken?path=resources/web/{timestamp}.{ext}
Authorization: {token}
```

返回临时OBS凭证（AK/SK/SecurityToken）

#### 2. 上传到华为云OBS
```
PUT https://{bucket}.{endpoint}/{path}
Authorization: OBS {ak}:{signature}
x-obs-security-token: {token}
```

#### 3. 通知服务器
```
POST /course/content/upload?lang=zh
Authorization: {token}

{
    "title": "文件名",
    "type": 1,
    "status": 2,
    "contentSize": 12345,
    "location": "https://obscloud.ulearning.cn/...",
    "mimeType": "png",
    "isView": 0,
    "remark2": 1,
    "remark3": 0
}
```

返回 contentId

## 发布到课程API

```
POST /course/content?lang=zh
Authorization: {token}

{
    "ocId": "153836",
    "contentIds": [{
        "id": null,
        "contentId": 1865502,
        "localType": 0
    }],
    "parentId": 0
}
```

## 分析方法

1. 使用浏览器F12抓取HAR文件
2. 使用 `analyze_har.py` 分析请求流程
3. 使用Python requests模拟请求
4. 验证API响应格式
