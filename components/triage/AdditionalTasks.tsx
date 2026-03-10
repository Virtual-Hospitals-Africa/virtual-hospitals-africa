import { assert } from 'std/assert/assert.ts'
import { MostRecentRecord } from '../../islands/MostRecentRecord.tsx'
import type { RenderedTask, TaskGroup } from '../../types.ts'
import partition from '../../util/partition.ts'
import { HiddenInput } from '../library/HiddenInput.tsx'
import { YesNoGrid, YesNoQuestion } from '../../islands/form/inputs/yes_no.tsx'
// import isString from '../../util/isString.ts'
import MeasurementInput from '../vitals/MeasurementInput.tsx'
import { hyphenate } from '../../util/hyphenate.ts'
import memoize from '../../util/memoize.ts'
import VitalsInputRow from '../vitals/InputRow.tsx'
import { Foo } from '../../islands/Foo.tsx'
import negate from '../../util/negate.ts'
import cls from '../../util/cls.ts'
import SectionHeader from '../library/typography/SectionHeader.tsx'

const uniqueIdentifier = memoize(
  function uniqueIdentifier(task: RenderedTask) {
    if (task.atom === 'link') {
      return `${task.atom}-${hyphenate(task.title).toLowerCase()}`
    }
    return `${task.atom}-${hyphenate(task.displays.full).toLowerCase()}`
  },
)

// function JustDoItTask({
//   task,
// }: {
//   task: RenderedTask & { atom: 'link' }
// }) {
//   const name = `just_do_it_tasks.${uniqueIdentifier(task)}`

//   return (
//     <label class='flex gap-4 items-center cursor-pointer p-4 rounded-lg border border-gray-300 bg-white hover:border-gray-400 transition-colors'>
//       <div class='flex items-center justify-center px-0 py-0.5 w-5'>
//         <div class='flex items-center justify-center rounded'>
//           <input
//             id={name}
//             type='checkbox'
//             name={name}
//             value='true'
//             // checked={task.completed}
//             class='w-5 h-5 rounded-md border-gray-400 text-indigo-700 focus:ring-indigo-700'
//           />
//         </div>
//       </div>
//       <div class='flex gap-1'>
//         <span class='text-sm font-medium text-gray-600 leading-5'>
//           <a href={task.href} className='flex'>
//             {task.title}
//             {task.thumbnail_href && <img width='200' src={task.thumbnail_href} />}
//           </a>
//         </span>
//       </div>
//     </label>
//   )
// }

function CheckForTask({
  organization_id,
  task,
}: {
  organization_id: string
  task: RenderedTask & { atom: 'finding' }
}) {
  const name = `check_for.${uniqueIdentifier(task)}`

  return (
    <>
      <HiddenInput
        name={`${name}.s_expression`}
        value={task.s_expression}
      />
      <HiddenInput
        name={`${name}.existing_finding.id`}
        value={task.existing_finding?.id}
      />
      <HiddenInput
        name={`${name}.existing_finding.existence`}
        value={task.existing_finding?.existence}
      />
      <YesNoQuestion
        name={`${name}.existence`}
        value={task.existing_finding?.existence}
        label={task.displays.full}
        required
        most_recent_finding={
          <MostRecentRecord
            record={task.existing_finding}
            organization_id={organization_id}
          />
        }
      />
    </>
  )
}

function MeasurementTask({ organization_id, task }: { organization_id: string; task: RenderedTask & { atom: 'measurement' } }) {
  const name = `measurements.${uniqueIdentifier(task)}`
  return (
    <>
      <VitalsInputRow
        required
        name={name}
        most_recent_patient_finding={task.existing_measurement}
        label={task.snomed_concept.name}
        organization_id={organization_id}
        input_width='w-32'
        input={
          <MeasurementInput
            required
            units={task.units}
            name={name}
            value={task.existing_measurement?.value.value}
            label=''
          />
        }
      />
      <HiddenInput
        name={`${name}.s_expression`}
        value={task.s_expression}
      />
      <HiddenInput
        name={`${name}.existing_measurement.id`}
        value={task.existing_measurement?.id}
      />
      <HiddenInput
        name={`${name}.existing_measurement.value`}
        value={task.existing_measurement?.value.value}
      />
    </>
  )
}

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

// function ProgressHeader({
//   completed_count,
//   total_count,
// }: {
//   completed_count: number
//   total_count: number
// }) {
//   const percentage = total_count > 0 ? Math.round((completed_count / total_count) * 100) : 0
//   const progress_color = percentage === 100 ? 'bg-green-500' : 'bg-indigo-700'
//   const badge_color = percentage === 100 ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'

//   return (
//     <div class='flex flex-col gap-3.5'>
//       <div class='flex items-start justify-between'>
//         <p class='text-lg font-normal text-gray-600 leading-7'>
//           {completed_count}/{total_count} tasks done
//         </p>
//         <div class={`px-4 py-0.5 rounded-full ${badge_color}`}>
//           <span class='text-xs font-medium'>
//             {percentage}%
//           </span>
//         </div>
//       </div>
//       {/* Progress bar */}
//       <div class='flex gap-3 items-center w-full'>
//         <div class='flex-1 h-1 bg-gray-200 rounded-full min-h-px min-w-px relative'>
//           <div
//             class={`absolute h-1 rounded-full ${progress_color}`}
//             style={{ width: `${percentage}%` }}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

function NoTasks() {
  return (
    <div class='flex flex-col gap-4 items-center justify-center py-12 text-gray-500'>
      <svg
        class='w-16 h-16 text-gray-300'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='1.5'
          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
      <p class='text-lg font-medium'>No additional tasks required</p>
      <p class='text-sm'>
        Based on the patient's current clinical findings, no additional tasks are needed.
      </p>
    </div>
  )
}

function ReferenceDocs({ reference_docs }: { reference_docs: Array<RenderedTask & {
    atom: "link";
}> }) {
  if (!reference_docs.length) return null
  return (

    <div class='flex flex-col gap-4'>
      <SectionHeader className='w-full xl:w-60'>
        Reference Documents
      </SectionHeader>
      <ul>
        {
          reference_docs.map(
              reference_doc => (
                <a href={reference_doc.href} className='flex text-sm font-medium text-gray-600 leading-5'>
                  {reference_doc.thumbnail_href ? <img width='400' src={reference_doc.thumbnail_href.replace('/150', '/400')} /> : reference_doc.title}
                </a>
              )
            )
        }
      </ul>
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
  // // Calculate totals
  // const total_tasks = task_groups.reduce(
  //   (sum, g) => sum + g.tasks.length,
  //   0,
  // )
  // const completed_tasks = task_groups.reduce(
  //   (sum, g) => sum + g.tasks.filter((t) => t.completed).length,
  //   0,
  // )

  const reference_docs = task_groups.flatMap(task_group => task_group.tasks).filter(isLink)
  const reference_docs_el = <ReferenceDocs reference_docs={reference_docs} />

  return (
    <div class={cls('grid', {
      'grid-cols-2': !!reference_docs_el,
      'grid-cols-1': !reference_docs_el
    })}>
      <div class='flex flex-col gap-3.5 pb-4 pt-2 w-full max-w-3xl'>
        {
          /* <ProgressHeader
          completed_count={completed_tasks}
          total_count={total_tasks}
        /> */
        }
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
