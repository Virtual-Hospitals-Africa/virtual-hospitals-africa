import { getCookies } from 'std/http/cookie.ts'

export const session_key = 'session_id'

export function getSessionCookie(req: Request): string | undefined {
  // Try to get from cookie first
  const from_cookie = getCookies(req.headers)[session_key]
  if (from_cookie) {
    return from_cookie
  }

  // For WebSocket connections, also check URL query parameters
  const url = new URL(req.url)
  return url.searchParams.get(session_key) || undefined
}

export function getHealthWorkerCookie(req: Request): string | undefined {
  // Try to get from cookie first
  const from_cookie = getCookies(req.headers)['health_worker_id']
  if (from_cookie) {
    return from_cookie
  }

  // For WebSocket connections, also check URL query parameters
  const url = new URL(req.url)
  return url.searchParams.get('health_worker_id') || undefined
}
