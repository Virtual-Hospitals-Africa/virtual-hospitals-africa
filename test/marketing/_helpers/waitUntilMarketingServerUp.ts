import { route } from '../_route.ts'

export default function waitUntilMarketingServerUp(): Promise<void> {
  return new Promise((resolve, reject) => {
    let retry_timeout: number
    const controller = new AbortController()

    const cancel_timeout = setTimeout(() => {
      controller.abort()
      clearTimeout(retry_timeout)
      reject(new Error('Marketing test server did not start in time'))
    }, 60000)

    function healthCheck() {
      fetch(route, { signal: controller.signal }).then(
        (response) => {
          response.body?.cancel()
          if (response.status >= 500) {
            throw new Error(`Marketing server returned ${response.status}`)
          }
          clearTimeout(cancel_timeout)
          resolve()
        },
      ).catch(() => {
        retry_timeout = setTimeout(healthCheck, 300)
      })
    }

    healthCheck()
  })
}
