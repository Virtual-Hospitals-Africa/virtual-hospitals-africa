import { useEffect } from 'preact/hooks'
import { showAlertMessage } from '../alert/AlertListener.tsx'

/*
  Holds up the workflow form while the island still has follow ups unanswered. Each island
  listing follow ups guards its own, so on the additional tasks page both the panel and the
  check_for section may object; the alert is shown once.
*/
export function useSubmitGuard(form_id: string, hasUnanswered: () => boolean) {
  useEffect(() => {
    const form = document.getElementById(form_id)
    if (!form) return
    function callback(event: SubmitEvent) {
      if (!hasUnanswered()) return
      const already_prevented = event.defaultPrevented
      event.preventDefault()
      event.stopPropagation()
      if (already_prevented) return
      showAlertMessage({
        message: 'Please answer follow up questions before continuing',
        level: 'warning',
      })
    }
    form.addEventListener('submit', callback)
    return () => form.removeEventListener('submit', callback)
  }, [form_id])
}
