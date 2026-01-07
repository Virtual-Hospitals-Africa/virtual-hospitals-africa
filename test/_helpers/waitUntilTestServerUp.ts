import { assertEquals } from 'std/assert/assert_equals.ts'
import { route } from '../_route.ts'

export default function waitUntilTestServerUp(): Promise<void> {
  return new Promise((resolve, reject) => {
    let retry_timeout: number
    const controller = new AbortController()

    const cancel_timeout = setTimeout(() => {
      controller.abort()
      clearTimeout(retry_timeout)
      reject(new Error('Test server did not start in time'))
    }, 10000)

    function healthCheck() {
      fetch(`${route}/health-check`, { signal: controller.signal }).then(
        (response) => {
          response.body?.cancel()
          assertEquals(response.status, 200)
          clearTimeout(cancel_timeout)
          resolve()
        },
      ).catch(() => {
        retry_timeout = setTimeout(healthCheck, 3)
      })
    }

    healthCheck()
  })
}
