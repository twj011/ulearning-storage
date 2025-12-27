// 网站访问认证中间件
// 只对静态页面进行 Basic Auth 验证，API 请求不受影响

interface Env {
  ADMIN_NAME?: string
  ADMIN_PASSWORD?: string
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context
  const url = new URL(request.url)

  // API 请求跳过 Basic Auth
  if (url.pathname.startsWith('/api/')) {
    return next()
  }

  // 对静态页面进行 Basic Auth 验证
  const adminName = env.ADMIN_NAME || 'ADMIN'
  const adminPassword = env.ADMIN_PASSWORD || '123456'
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"'
      }
    })
  }

  const base64Credentials = authHeader.split(' ')[1]
  const credentials = atob(base64Credentials)
  const [username, password] = credentials.split(':')

  if (username !== adminName || password !== adminPassword) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"'
      }
    })
  }

  return next()
}
