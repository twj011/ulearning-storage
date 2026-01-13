# 优学院登录Token获取说明

## 问题分析

经过HAR文件分析，发现优学院的登录机制比较特殊：

### 登录API流程
1. `GET /textbook/cheatCheck?loginName={username}` - 检查作弊（可选）
2. `GET /users/check?loginName={username}&password={password}` - 验证账号密码
   - 返回: `{"code":1,"message":"成功","result":1}`
3. `GET /users/loginApi?loginName={username}` - 执行登录
   - 返回: `{"code":2,"message":"成功"}`

### Token问题
- **服务器不返回Token**: 所有API响应中都没有通过HTTP Set-Cookie返回Token
- **Token在前端生成**: Token `F3C05332AAAB2CB0561C3F7E2D64F977` 是在浏览器端通过JavaScript设置的
- **Token格式**: 32位十六进制字符（类似MD5格式）

## 解决方案

### 方案1: 手动获取Token（推荐）
由于服务器不直接返回Token，最简单的方法是：

1. 在浏览器中登录优学院
2. 按F12打开开发者工具
3. 在Console中执行：
```javascript
document.cookie.split(';').find(c => c.includes('AUTHORIZATION'))
```
4. 复制Token值

### 方案2: 使用Selenium自动化
```python
from selenium import webdriver

driver = webdriver.Chrome()
driver.get('https://courseweb.ulearning.cn')
# 登录操作...
token = driver.get_cookie('AUTHORIZATION')['value']
```

### 方案3: 逆向前端代码
分析优学院前端JavaScript代码，找到Token生成逻辑。

## 当前实现

`uleaning_storage/login.py` 实现了账号密码验证，并可从响应体中返回 `authorization`。

**建议使用方式**:
1. 手动登录一次获取Token
2. 将Token保存到 `.env`（`ULEARNING_TOKEN=...`）
3. 使用 `uleaning-upload` 进行文件上传

```bash
# 使用Token上传
uleaning-upload test.png -t YOUR_TOKEN

# 使用账号密码（需要手动获取Token）
uv run python -c "from uleaning_storage.login import UlearningLogin; print(UlearningLogin().login('username','password'))"
# 将输出的 Token 写入 .env 的 ULEARNING_TOKEN
```

## Token有效期

根据HAR分析，Token可能长期有效（类似Session Token），但具体有效期未知。
建议定期更新Token。
