import crypto from 'crypto'

function parseCookies(cookieHeader) {
  const cookies = {}
  if (!cookieHeader) return cookies
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    cookies[name] = rest.join('=')
  })
  return cookies
}

export function createSessionToken() {
  return crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update('admin-session')
    .digest('hex')
}

export function verifyAuth(req) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies['admin_token']
  if (!token) return false
  const expected = createSessionToken()
  if (token.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

export function setAuthCookie(res) {
  const token = createSessionToken()
  const isProduction = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie',
    `admin_token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800${isProduction ? '; Secure' : ''}`
  )
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie',
    'admin_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
  )
}
