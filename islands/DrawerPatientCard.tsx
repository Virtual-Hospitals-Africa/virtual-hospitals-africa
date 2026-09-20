import { useSignal } from '@preact/signals'
import { higherPriority, Priority, PRIORITY_COLORS } from '../shared/priorities.ts'
import {
  RenderedEmployeeWithPresenceAndSeniority,
  RenderedEvaluationRelativeToHealthWorker,
  RenderedOrganization,
  RenderedPatient,
  RenderedPatientEncounter,
} from '../types.ts'
import cls from '../util/cls.ts'
import { PriorityChipWithPopover } from './PriorityChipWithPopover.tsx'
import { assert } from 'std/assert/assert.ts'
import { useEffect } from 'preact/hooks'
import { PriorityEscalationPanel } from './PriorityEscalation/PriorityEscalationPanel.tsx'

export type PriorityEscalation = {
  priority: Priority
  priority_evaluation: RenderedEvaluationRelativeToHealthWorker
}

const PRIORITY_UPDATE_EVENT = 'priority-update-event'

export function priorityUpdate(
  detail: PriorityEscalation,
) {
  const event = new CustomEvent(PRIORITY_UPDATE_EVENT, { detail })
  self.dispatchEvent(event)
}

// Patient's drawer card component with avatar, name, DOB, and triage
export function DrawerPatientCard(
  { patient, organization_id, priority: original_priority, priority_evaluation, escalation_candidates, nearest_hospital, refer_route }: {
    patient: RenderedPatient
    organization_id: string
    priority: RenderedPatientEncounter['priority']
    priority_evaluation: RenderedEvaluationRelativeToHealthWorker | null
    escalation_candidates: RenderedEmployeeWithPresenceAndSeniority[]
    nearest_hospital: RenderedOrganization | null
    refer_route: string
  },
) {
  const open_escalation_modal = useSignal(false)
  const priority = useSignal(original_priority?.name)
  // The escalating record replaces the one rendered by the server until the page is next loaded
  const current_priority_evaluation = useSignal(priority_evaluation)
  const priority_color = priority.value ? PRIORITY_COLORS[priority.value] : { bg: 'bg-gray-100', text: 'text-gray-800' }

  const href = patient.completed_registration ? `/app/organizations/${organization_id}/patients/${patient.id}/profile` : undefined
  const Tag = href ? 'a' : 'div'

  useEffect(() => {
    function listener(event: Event) {
      assert(event instanceof CustomEvent)
      const next_priority = higherPriority(event.detail.priority, priority.value)
      if (!!next_priority && next_priority !== priority.value) {
        priority.value = next_priority
        current_priority_evaluation.value = event.detail.priority_evaluation
        open_escalation_modal.value = true
      }
    }

    Object.assign(window, {
      priorityUpdate,
    })

    self.addEventListener(
      PRIORITY_UPDATE_EVENT,
      listener,
    )

    return () => {
      self.removeEventListener(
        PRIORITY_UPDATE_EVENT,
        listener,
      )
    }
  }, [])

  return (
    <div
      className={cls(
        'sticky top-0 z-10 box-border flex items-start gap-2 w-full px-3 py-2',
        priority_color.bg,
      )}
    >
      <Tag
        className='flex flex-col justify-between gap-1 relative min-w-0 flex-1'
        href={href}
      >
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] leading-6.5 text-gray-800">
          {patient.name}
        </p>
        <p className='text-xs text-[#29313d]'>
          {patient.description}
        </p>
      </Tag>
      <div id='patient-drawer-priority' className='self-center shrink-0'>
        {priority.value
          ? (
            <PriorityChipWithPopover
              priority={priority.value}
              priority_evaluation={current_priority_evaluation.value!}
              organization_id={organization_id}
            />
          )
          : (
            <span
              className={cls(
                "font-['Inter:Semi_Bold',sans-serif] font-semibold leading-6",
                'text-gray-800',
              )}
            >
              Undetermined
            </span>
          )}
      </div>
      <PriorityEscalationPanel
        escalation_candidates={escalation_candidates}
        nearest_hospital={nearest_hospital}
        refer_route={refer_route}
        priority={priority.value}
        open={open_escalation_modal.value}
        onClose={() => open_escalation_modal.value = false}
      />
    </div>
  )
}
