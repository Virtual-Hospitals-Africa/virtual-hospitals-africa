import { useEffect } from 'preact/hooks'

export function IdleTimer({
  timer,
  url,
}: {
  timer: number
  url: URL
}) {
  useEffect(() => {
    const checkForInactivity = () => {
      const prevTimestamp = localStorage.getItem('api_activity_timestamp')

      if (prevTimestamp == null) {
        localStorage.setItem('api_activity_timestamp', Date.now().toString())
      }

      if (
        url.toString() ===
          url.toString().split('/').slice(0, -1).join('/') + '/'
      ) {
        // Ignoring activity on the home page
        return
      }

      // console.log('prevTimestamp', prevTimestamp)

      if (Date.now() - Number(prevTimestamp) > timer * 1000) {
        console.log('Inactivity detected')
        // deno-lint-ignore no-window
        window.location.href = '/app/logout'
      }
    }

    const interval = setInterval(checkForInactivity, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='hidden'>
      timer
    </div>
  )
}
