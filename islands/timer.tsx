import { useEffect, useState } from 'preact/hooks'

export function Timer() {
  const [time, setTime] = useState({
    start: Date.now(),
    elapsed: 0,
  })

  function tick() {
    setTime({
      start: time.start,
      elapsed: Date.now() - time.start,
    })
    requestAnimationFrame(tick)
  }

  useEffect(() => {
    requestAnimationFrame(tick)
  }, [])

  return <div>{time.elapsed}ms</div>
}
