import { assert } from 'std/assert/assert.ts'
import { YesNoGrid } from '../../../islands/form/inputs/yes_no.tsx'
import { MostRecentRecord } from '../../../islands/MostRecentRecord.tsx'
import { TaskGroup } from '../../../types.ts'
import { hyphenate } from '../../../util/hyphenate.ts'
import negate from '../../../util/negate.ts'
import partition from '../../../util/partition.ts'
import { CheckForTask } from './CheckFor.tsx'
import { MeasurementTask } from './Measurement.tsx'
import { isFinding, isLink, isMeasurement } from './type-predicates.ts'
import { uniqueIdentifier } from './uniqueIdentifier.ts'

export function TaskGroupCard({
  group,
  organization_id,
}: {
  group: TaskGroup
  organization_id: string
}) {
  const solicit_findings_tasks = group.tasks.filter(negate(isLink))
  console.log({solicit_findings_tasks})
  if (!solicit_findings_tasks.length) return null
  const [check_for_tasks, other_tasks] = partition(solicit_findings_tasks, isFinding)
  const [measure_tasks, none] = partition(other_tasks, isMeasurement)
  assert(none.length === 0)

  return (
    <div class='task-group-card flex flex-col gap-4' data-due-to={group.due_to.map((x) => hyphenate(x.displays.full)).join('-')}>
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
