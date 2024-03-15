import { useSignal } from '@preact/signals'
import ErrorMessage from './ErrorMessage.tsx'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'

export function ErrorListener({
  initialError,
}: {
  initialError: string | null
}) {
  const error = useSignal(initialError)
  useEffect(() => {
    function listener(event: Event) {
      assert(event instanceof CustomEvent)
      error.value = event.detail
    }
    self.addEventListener('show-error', listener)
    return () => {
      self.removeEventListener('show-error', listener)
    }
  }, [])
  return (
    <ErrorMessage
      error={error}
      className='fixed z-50 top-0 left-0 right-0 m-12'
    />
  )
}

export function showErrorMessage(detail: string) {
  self.dispatchEvent(new CustomEvent('show-error', { detail }))
}
