import { assert } from 'std/assert/assert.ts'
import { TaskGroup } from '../../../types.ts'
import { hyphenate } from '../../../util/hyphenate.ts'
import negate from '../../../util/negate.ts'
import partition from '../../../util/partition.ts'
import { MeasurementTask } from './Measurement.tsx'
import { isFinding, isLink, isMeasurement } from './type-predicates.ts'
import { uniqueIdentifier } from './uniqueIdentifier.ts'
import { DueTo } from './DueTo.tsx'

export function TaskGroupCard({
  group,
  organization_id,
}: {
  group: TaskGroup
  organization_id: string
}) {
  const tasks = group.tasks
    .filter(negate(isLink))
    .filter(negate(isFinding))
  if (!tasks.length) return null
  const [measure_tasks, none] = partition(tasks, isMeasurement)
  assert(measure_tasks.length)
  assert(none.length === 0)

  return (
    <div class='task-group-card flex flex-col gap-4' data-due-to={group.due_to.map((x) => hyphenate(x.displays.full)).join('-')}>
      <DueTo due_to={group.due_to} organization_id={organization_id} />

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
