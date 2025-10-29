import { useSignal } from '@preact/signals'
import ErrorMessage, {
  ErrorMessageProps,
  WrappedError,
} from './ErrorMessage.tsx'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'

type ErrorInput = string | null | {
  name: 'error_with_actions'
  message: string
  actions: {
    name: string
    href: string
    method?: 'GET' | 'POST'
  }[]
}

function wrapError(e: ErrorInput): WrappedError | null {
  return typeof e === 'string' ? { message: e } : e
}

export function ErrorListener({
  initialError,
}: {
  initialError: ErrorInput
}) {
  const error: ErrorMessageProps['error'] = useSignal(
    wrapError(initialError),
  )

  useEffect(() => {
    function listener(event: Event) {
      assert(event instanceof CustomEvent)
      error.value = wrapError(event.detail)
    }
    self.addEventListener('show-error', listener)
    return () => {
      self.removeEventListener('show-error', listener)
    }
  }, [])
  return (
    <ErrorMessage
      error={error}
      className='fixed top-0 left-0 right-0 z-50 m-12'
    />
  )
}

export function showErrorMessage(detail: string) {
  self.dispatchEvent(new CustomEvent('show-error', { detail }))
}
