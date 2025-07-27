import { getCookies } from 'std/http/cookie.ts'

export const session_key = 'session_id'

export function get(req: Request): string | undefined {
  return getCookies(req.headers)[session_key]
}
