import { getCookies } from 'std/http/cookie.ts'

type Role = 'health_worker' | 'regulator'

export function sessionKey(role: Role): string {
  return `${role}_session_id`
}

export function get(req: Request, role: Role): string | undefined {
  return getCookies(req.headers)[sessionKey(role)]
}
