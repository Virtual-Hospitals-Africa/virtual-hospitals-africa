import { assert } from 'std/assert/assert.ts'
import { TaskGroup } from '../../types.ts'
import cls from '../../util/cls.ts'
import { HiddenInput } from '../library/HiddenInput.tsx'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import { NoTasks } from './tasks/NoTasks.tsx'
import { TaskGroupCard } from './tasks/TaskGroupCard.tsx'
import { isLink } from './tasks/type-predicates.ts'
import negate from '../../util/negate.ts'
import { ReferenceDocs } from './tasks/ReferenceDocs.tsx'

export default function AdditionalTasks({
  organization_id,
  evaluation_ids,
  task_groups,
  use_pdf_viewer = false,
}: {
  organization_id: string
  evaluation_ids: string[]
  task_groups: TaskGroup[]
  use_pdf_viewer?: boolean
}) {
  if (!task_groups.length) {
    return <NoTasks />
  }

  const all_tasks = task_groups.flatMap((task_group) => task_group.tasks)
  const all_due_to = task_groups.flatMap((task_group) => task_group.due_to)

  const some_soliticing_finding_task = all_tasks.some(negate(isLink))
  const reference_docs = all_tasks.filter(isLink)
  const reference_docs_el = (
    <ReferenceDocs
      reference_docs={reference_docs}
      due_to={some_soliticing_finding_task ? null : all_due_to}
      organization_id={organization_id}
      use_pdf_viewer={use_pdf_viewer}
    />
  )

  const column_count = Number(!!reference_docs_el) + Number(some_soliticing_finding_task)
  if (!column_count) {
    return <NoTasks />
  }
  assert(column_count <= 2)

  return (
    <>
      <div
        class={cls('grid gap-6 grid-cols-1', {
          'xl:grid-cols-2': column_count === 2,
        })}
      >
        {some_soliticing_finding_task && (
          <div id='additional-investigations-column' class='flex flex-col gap-3.5 pb-4 pt-2 w-full max-w-3xl'>
            <SectionHeader className='w-full xl:w-60'>
              Additional Investigations
            </SectionHeader>
            {task_groups.map((group, index) => (
              <TaskGroupCard
                key={index}
                group={group}
                organization_id={organization_id}
              />
            ))}
          </div>
        )}
        {reference_docs_el}
      </div>
      <HiddenInput
        name='evaluation_ids'
        value={evaluation_ids}
      />
    </>
  )
}
