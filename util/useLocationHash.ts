/*
  Wraps the location hash, returning a signal-like object
  whose value is the query parameters type-checked to be of a given State
  which you may set to update the location.hash
*/
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import isString from './isString.ts'

type FullState<
  State extends Record<string, string> & {
    action: string
  },
> = { loaded: boolean } & ({ action: 'none' } | State)

export function useLocationHash<
  State extends Record<string, string> & {
    action: string
  },
>(
  callback: (params: Record<string, string>) => params is State,
) {
  const signal = useSignal<FullState<State>>({ loaded: false, action: 'none' })

  function currentState(): FullState<State> {
    const hash = self.location.hash.slice(1)
    if (!hash) {
      return { loaded: true, action: 'none' }
    }
    const params = Object.fromEntries(new URLSearchParams(hash))
    if (!isString(params.action)) {
      return { loaded: true, action: 'none' }
    }
    if (!callback(params)) {
      return { loaded: true, action: 'none' }
    }
    return { loaded: true, ...params }
  }

  function checkHash() {
    signal.value = currentState()
  }

  useEffect(() => {
    checkHash()
    self.addEventListener('hashchange', checkHash)
    return () => {
      self.removeEventListener('hashchange', checkHash)
    }
  }, [])

  function asHash(state: State | { action: 'none' }) {
    if (state.action === 'none') {
      return ''
    }
    return new URLSearchParams(state).toString()
  }

  return {
    get value(): FullState<State> {
      return signal.value
    },
    set value(state: State | { action: 'none' }) {
      if (self.location) {
        self.location.hash = asHash(state)
      }
    },
    asHref(state: State | { action: 'none' }) {
      return '#' + asHash(state)
    },
  }
}
