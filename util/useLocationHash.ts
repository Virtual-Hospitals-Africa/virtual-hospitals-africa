import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'

export function useLocationHash<T>(
  callback: (hash: string) => T,
) {
  const signal = useSignal<T>(callback(''))

  function checkHash() {
    signal.value = callback(self.location.hash.slice(1))
  }

  useEffect(() => {
    self.addEventListener('hashchange', checkHash)
    checkHash()
    return () => {
      self.removeEventListener('hashchange', checkHash)
    }
  }, [])

  return signal
}
