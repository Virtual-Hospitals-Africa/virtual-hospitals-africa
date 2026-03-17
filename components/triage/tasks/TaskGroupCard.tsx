import { assert } from 'std/assert/assert.ts'
import { YesNoGrid } from '../../../islands/form/inputs/yes_no.tsx'
import { TaskGroup } from '../../../types.ts'
import { hyphenate } from '../../../util/hyphenate.ts'
import negate from '../../../util/negate.ts'
import partition from '../../../util/partition.ts'
import { CheckForTask } from './CheckFor.tsx'
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
  const solicit_findings_tasks = group.tasks.filter(negate(isLink))
  console.log({ solicit_findings_tasks })
  if (!solicit_findings_tasks.length) return null
  const [check_for_tasks, other_tasks] = partition(solicit_findings_tasks, isFinding)
  const [measure_tasks, none] = partition(other_tasks, isMeasurement)
  assert(none.length === 0)

  return (
    <div class='task-group-card flex flex-col gap-4' data-due-to={group.due_to.map((x) => hyphenate(x.displays.full)).join('-')}>
      <DueTo due_to={group.due_to} organization_id={organization_id} />

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
