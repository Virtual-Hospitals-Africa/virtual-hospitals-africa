import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { RecordPanel } from '../components/library/RecordPanel.tsx'
import { Priority, RenderedEvaluationRelativeToHealthWorker } from '../types.ts'
import { PRIORITY_COLORS } from '../shared/priorities.ts'
import cls from '../util/cls.ts'

export function PriorityChipWithPopover({
  priority,
  priority_evaluation,
  organization_id,
}: {
  priority: Priority
  priority_evaluation: RenderedEvaluationRelativeToHealthWorker
  organization_id: string
}) {
  const colors = PRIORITY_COLORS[priority]

  return (
    <Popover className='relative'>
      <PopoverButton
        className={cls(
          "font-['Inter:Semi_Bold',sans-serif] font-semibold leading-6 cursor-pointer bg-transparent border-0 p-0 m-0",
          colors.text,
        )}
      >
        {priority}
      </PopoverButton>
      <PopoverPanel anchor={{ to: 'bottom start', gap: 8, padding: 8 }} className='panel z-50 transition duration-100 ease-out'>
        <RecordPanel record={priority_evaluation} organization_id={organization_id} />
      </PopoverPanel>
    </Popover>
  )
}
