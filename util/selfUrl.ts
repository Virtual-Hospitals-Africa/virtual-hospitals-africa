import { readPositiveIntegerEnvironmentVariable } from './env.ts'
import memoize from './memoize.ts'

export const selfUrl = memoize(function getSelfUrl(): string {
  if (Deno.env.has('SELF_URL')) {
    return Deno.env.get('SELF_URL')!
  }
  const port = readPositiveIntegerEnvironmentVariable('HTTP_SERVER_PORT') ||
    readPositiveIntegerEnvironmentVariable('PORT') ||
    (Deno.env.get('IS_TEST') ? 8004 : 8000)
  return `http://localhost:${port}`
})

export default selfUrl
