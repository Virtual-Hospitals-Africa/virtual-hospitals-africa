import { assert } from 'std/assert/assert.ts'

import { useSignal } from '@preact/signals'

import { useEffect } from 'preact/hooks'
import { RenderedEmployeeWithPresenceAndSeniority, RenderedOrganization } from '../../types.ts'
import { PriorityEscalationModal } from './PriorityEscalationModal.tsx'

export type PriorityEscalation = {
  priority: string
}

export function showPriorityEscalation(
  detail: PriorityEscalation,
) {
  self.dispatchEvent(
    new CustomEvent('urgent-case-detected', {
      detail,
    }),
  )
}

export function PriorityEscalationListener({
  escalation_candidates,
  nearest_hospital,
}: {
  escalation_candidates: RenderedEmployeeWithPresenceAndSeniority[]
  nearest_hospital: RenderedOrganization | null
}) {
  const priorityEscalation = useSignal<PriorityEscalation | null>(null)

  useEffect(() => {
    function listener(event: Event) {
      assert(event instanceof CustomEvent)

      priorityEscalation.value = event.detail
    }

    Object.assign(window, {
      showPriorityEscalation,
    })

    self.addEventListener(
      'urgent-case-detected',
      listener,
    )

    return () => {
      self.removeEventListener(
        'urgent-case-detected',
        listener,
      )
    }
  }, [])

  return (
    <PriorityEscalationModal
      escalation={priorityEscalation.value}
      escalation_candidates={escalation_candidates}
      nearest_hospital={nearest_hospital}
      onClose={() => {
        priorityEscalation.value = null
      }}
    />
  )
}
