import { assert } from 'std/assert/assert.ts'
import { MostRecentRecord } from '../../islands/MostRecentRecord.tsx'
import type { RenderedTask, TaskGroup } from '../../types.ts'
import partition from '../../util/partition.ts'
import { HiddenInput } from '../library/HiddenInput.tsx'
import { YesNoGrid } from '../../islands/form/inputs/yes_no.tsx'
import negate from '../../util/negate.ts'
import cls from '../../util/cls.ts'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import { ReferenceDocs } from '../ReferenceDocs.tsx'
import { CheckForTask } from './tasks/CheckFor.tsx'
import { MeasurementTask } from './tasks/Measurement.tsx'
import { NoTasks } from './tasks/NoTasks.tsx'
import { uniqueIdentifier } from './tasks/uniqueIdentifier.ts'

function isLink(task: RenderedTask): task is RenderedTask & { atom: 'link' } {
  return task.atom === 'link'
}

function isFinding(task: RenderedTask): task is RenderedTask & { atom: 'finding' } {
  return task.atom === 'finding'
}

function isMeasurement(task: RenderedTask): task is RenderedTask & { atom: 'measurement' } {
  return task.atom === 'measurement'
}

function TaskGroupCard({
  group,
  organization_id,
}: {
  group: TaskGroup
  organization_id: string
}) {
  const solicit_findings_tasks = group.tasks.filter(negate(isLink))
  const [check_for_tasks, other_tasks] = partition(solicit_findings_tasks, isFinding)
  const [measure_tasks, none] = partition(other_tasks, isMeasurement)
  assert(none.length === 0)

  return (
    <div class='flex flex-col gap-4'>
      {/* Header */}
      <div class='flex items-start justify-between w-full'>
        <div class='flex flex-row gap-1 text-sm leading-5'>
          <span class='font-semibold text-gray-600'>
            {'Due to '}
          </span>

          {group.due_to.map((record) => (
            <MostRecentRecord
              key={record.id}
              record={record}
              organization_id={organization_id}
            />
          ))}
        </div>
      </div>

      {/* Check-for Tasks (YesNoGrid) */}
      {check_for_tasks.length > 0 && (
        <YesNoGrid title='Check for'>
          {check_for_tasks.map((task) => (
            <CheckForTask
              key={uniqueIdentifier(task)}
              organization_id={organization_id}
              task={task}
            />
          ))}
        </YesNoGrid>
      )}

      {measure_tasks.map((task) => (
        <MeasurementTask
          key={uniqueIdentifier(task)}
          organization_id={organization_id}
          task={task}
        />
      ))}
    </div>
  )
}

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

  const reference_docs = task_groups.flatMap((task_group) => task_group.tasks).filter(isLink)
  const reference_docs_el = <ReferenceDocs reference_docs={reference_docs} />

  return (
    <div
      class={cls('grid', {
        'grid-cols-2': !!reference_docs_el,
        'grid-cols-1': !reference_docs_el,
      })}
    >
      <div class='flex flex-col gap-3.5 pb-4 pt-2 w-full max-w-3xl'>
        <HiddenInput
          name='evaluation_ids'
          value={evaluation_ids}
        />
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
      {reference_docs_el}
    </div>
  )
}
