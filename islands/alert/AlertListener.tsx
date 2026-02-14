import { assert } from 'std/assert/assert.ts'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import AlertMessage from './AlertMessage.tsx'
import { Alert } from '../../types.ts'

type AlertInput = null | string | Alert

function wrapAlert(e: AlertInput): Alert | null {
  return typeof e === 'string' ? { level: 'error', message: e } : e
}

function initialAlert(url: URL): Alert | null {
  const error = url.searchParams.get('error')
  const warning = url.searchParams.get('warning')
  const success = url.searchParams.get('success')
  const alert = url.searchParams.has('alert') ? JSON.parse(url.searchParams.get('alert')!) : null

  const flags = Number(!!error) + Number(!!warning) + Number(!!success) + Number(!!alert)
  assert(flags <= 1, 'Cannot have more than one of success, error, or warning')
  if (alert) {
    return alert
  }
  if (error) {
    return { message: error, level: 'error' }
  }
  if (warning) {
    return { message: warning, level: 'warning' }
  }
  if (success) {
    return { message: success, level: 'success' }
  }
  return null
}

export function showAlertMessage(detail: AlertInput) {
  self.dispatchEvent(new CustomEvent('show-alert', { detail }))
}

export function AlertListener({
  initial_url,
}: {
  initial_url: URL
}) {
  const alert = useSignal(
    initialAlert(initial_url),
  )

  useEffect(() => {
    function listener(event: Event) {
      assert(event instanceof CustomEvent)
      alert.value = wrapAlert(event.detail)
    }
    self.addEventListener('show-alert', listener)
    return () => {
      self.removeEventListener('show-alert', listener)
    }
  }, [])

  return (
    <div className='fixed top-12 z-50 w-full place-items-center'>
      <AlertMessage alert={alert} />
    </div>
  )
}
