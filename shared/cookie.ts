import { getCookies } from 'std/http/cookie.ts'

const USE_DOCKER_QUICKSTART = Deno.env.has('USE_DOCKER_QUICKSTART')

export const session_key = USE_DOCKER_QUICKSTART
  ? 'docker_session_id'
  : 'session_id'

export function get(req: Request): string | undefined {
  return getCookies(req.headers)[session_key]
}
