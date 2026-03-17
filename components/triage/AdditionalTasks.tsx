import { assert } from 'std/assert/assert.ts'
import { TaskGroup } from '../../types.ts'
import cls from '../../util/cls.ts'
import compactMap from '../../util/compactMap.ts'
import { HiddenInput } from '../library/HiddenInput.tsx'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import { ReferenceDocs } from '../ReferenceDocs.tsx'
import { NoTasks } from './tasks/NoTasks.tsx'
import { TaskGroupCard } from './tasks/TaskGroupCard.tsx'
import { isLink } from './tasks/type-predicates.ts'

export default function AdditionalTasks({
  organization_id,
  evaluation_ids,
  task_groups,
}: {
  organization_id: string
  evaluation_ids: string[]
  task_groups: TaskGroup[]
}) {
  if (!task_groups.length) {
    return <NoTasks />
  }

  const all_tasks = task_groups.flatMap((task_group) => task_group.tasks)

  const reference_docs = all_tasks.filter(isLink)
  const reference_docs_el = <ReferenceDocs reference_docs={reference_docs} />

  const task_group_cards = compactMap(task_groups, (group, index) => (
    <TaskGroupCard
      key={index}
      group={group}
      organization_id={organization_id}
    />
  ))

  console.log('mm')
  const column_count = Number(!!reference_docs_el) + Number(!!task_group_cards.length)
  if (!column_count) {
    return <NoTasks />
  }
  assert(column_count <= 2)

  return (
    <>
      <div
        class={cls('grid gap-6', {
          'grid-cols-2': column_count === 2,
          'grid-cols-1': column_count === 1,
        })}
      >
        {!!task_group_cards.length && (
          <div id='additional-investigations-column' class='flex flex-col gap-3.5 pb-4 pt-2 w-full max-w-3xl'>
            <SectionHeader className='w-full xl:w-60'>
              Additional Investigations
            </SectionHeader>
            {task_group_cards}
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
