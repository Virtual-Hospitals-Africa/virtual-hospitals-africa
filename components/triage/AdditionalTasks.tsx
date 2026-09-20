import { assert } from 'std/assert/assert.ts'
import { FollowUpGroup, TaskGroup } from '../../types.ts'
import cls from '../../util/cls.ts'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import { NoTasks } from './tasks/NoTasks.tsx'
import { MeasurementGroup } from './tasks/MeasurementGroup.tsx'
import { ReferenceDocs } from './tasks/ReferenceDocs.tsx'
import { isLink, isMeasurement } from '../../shared/tasks.ts'
import CheckForSection from '../../islands/FollowUps/CheckForSection.tsx'

export const ADDITIONAL_TASKS_FORM_ID = 'additional_tasks_and_investigations'

/*
  The check_for tasks outstanding when the page loaded are shown in the body of the page
  (islands/FollowUps/CheckForSection.tsx) rather than the follow ups panel, which is left to
  the follow ups that answering them raises. Measurement tasks are submitted with the page.
*/
export default function AdditionalTasks({
  organization_id,
  task_groups,
  check_for_follow_ups,
  none_of_the_above_findings_route,
  use_pdf_viewer = false,
}: {
  organization_id: string
  task_groups: TaskGroup[]
  check_for_follow_ups: FollowUpGroup[]
  none_of_the_above_findings_route: string | null // null hides "None of the above" (tutorial)
  use_pdf_viewer?: boolean
}) {
  if (!task_groups.length) {
    return <NoTasks />
  }

  const all_tasks = task_groups.flatMap((task_group) => task_group.tasks)
  const all_due_to = task_groups.flatMap((task_group) => task_group.due_to)
  const all_completed = task_groups.every((task_group) => task_group.completed)
  const all_not_completed = task_groups.every((task_group) => !task_group.completed)

  // Mixed completion means you arrived back on this page because of findings
  // you submitted on this page, but there are new tasks for you to do and as
  // a result we show those tasks with an indicator
  const page_mixed_completion = !!task_groups.length && !all_completed && !all_not_completed

  const some_soliciting_finding_task = check_for_follow_ups.length > 0 || all_tasks.some(isMeasurement)
  const reference_docs = all_tasks.filter(isLink)
  const reference_docs_el = (
    <ReferenceDocs
      reference_docs={reference_docs}
      due_to={some_soliciting_finding_task ? null : all_due_to}
      organization_id={organization_id}
      use_pdf_viewer={use_pdf_viewer}
    />
  )

  const column_count = Number(!!reference_docs_el) + Number(some_soliciting_finding_task)
  if (!column_count) {
    return <NoTasks />
  }
  assert(column_count <= 2)

  return (
    <div
      class={cls('grid gap-6 grid-cols-1', {
        'xl:grid-cols-2': column_count === 2,
      })}
    >
      {some_soliciting_finding_task && (
        <div id='additional-investigations-column' class='flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl'>
          <SectionHeader className='w-full xl:w-60'>
            Additional Investigations
          </SectionHeader>
          <CheckForSection
            groups={check_for_follow_ups}
            none_of_the_above_findings_route={none_of_the_above_findings_route}
            form_id={ADDITIONAL_TASKS_FORM_ID}
            page_mixed_completion={page_mixed_completion}
          />
          {task_groups.map((group) => (
            <MeasurementGroup
              key={group.key}
              group={group}
              page_mixed_completion={page_mixed_completion}
              organization_id={organization_id}
            />
          ))}
        </div>
      )}
      {reference_docs_el}
    </div>
  )
}
