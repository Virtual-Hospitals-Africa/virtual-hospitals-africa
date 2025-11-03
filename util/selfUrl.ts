import { readPositiveIntegerEnvironmentVariable } from './env.ts'
import { exists } from './exists.ts'
import memoize from './memoize.ts'

export default memoize(function getSelfUrl(): string {
  if (Deno.env.has('SELF_URL')) {
    return Deno.env.get('SELF_URL')!
  }
  const HTTPS_PROXY_SERVER_PORT = exists(
    readPositiveIntegerEnvironmentVariable('HTTPS_PROXY_SERVER_PORT'),
  )
  return `https://localhost:${HTTPS_PROXY_SERVER_PORT}`
})
