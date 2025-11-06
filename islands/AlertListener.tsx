import { useSignal } from '@preact/signals'
import AlertMessage, { Alert, AlertMessageProps } from './AlertMessage.tsx'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'

type AlertInput = null | string | Alert

function wrapAlert(e: AlertInput): Alert | null {
  return typeof e === 'string' ? { level: 'error', message: e } : e
}

export function AlertListener({
  initial_alert,
}: {
  initial_alert: Alert | null
}) {
  const alert: AlertMessageProps['alert'] = useSignal(
    wrapAlert(initial_alert),
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
    <AlertMessage
      alert={alert}
      className='fixed top-0 left-0 right-0 z-50 m-12'
    />
  )
}

export function showAlertMessage(detail: string) {
  self.dispatchEvent(new CustomEvent('show-alert', { detail }))
}
