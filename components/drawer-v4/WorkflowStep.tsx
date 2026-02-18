// @ts-types="preact"
import { ComponentChild } from 'preact'

import { RenderedSidebarWorkflowStep } from '../../types.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import cls from '../../util/cls.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import { NoFindings } from './NoFindings.tsx'
import { RecordChips } from './RecordChips.tsx'

export function WorkflowStep(
  { workflow, step, organization_id, Icon }: {
    workflow: string
    step: RenderedSidebarWorkflowStep
    organization_id: string
    Icon?: () => ComponentChild
  },
) {
  return (
    <div
      id={`patient-drawer-workflow-step-${hyphenate(workflow)}-${hyphenate(step.workflow_step)}`}
      className='box-border content-stretch flex flex-col gap-1 items-start justify-start relative shrink-0 w-full'
    >
      <div className='content-stretch flex gap-2 items-center justify-center relative shrink-0'>
        {Icon && <Icon />}
        <p
          className={cls("font-['Inter:Medium',sans-serif] font-medium leading-5 not-italic relative shrink-0 text-3.5 text-nowrap whitespace-pre", {
            'text-gray-600': step.status === 'completed',
            'text-[#959ca9]': step.status !== 'completed',
          })}
        >
          {step.title}
        </p>
        {step.status === 'in progress' && (
          <p className="font-['Inter:Medium_Italic',sans-serif] font-medium italic leading-4 relative shrink-0 text-[#959ca9] text-3 text-nowrap whitespace-pre">
            In Progress
          </p>
        )}
      </div>
      {step.status !== 'in progress' && arrayIsEmpty(step.records) && <NoFindings explanation='No findings entered' with_padding_x />}
      <RecordChips
        records={step.records}
        organization_id={organization_id}
      />
    </div>
  )
}
