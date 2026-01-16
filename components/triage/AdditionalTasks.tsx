import { assert } from 'std/assert/assert.ts'
import { MostRecentFinding } from '../library/MostRecentFinding.tsx'
import type { CheckForTask, RecordValueLink, RenderedTask, TaskGroup } from '../../types.ts'
import partition from '../../util/partition.ts'
import { HiddenInput } from '../library/HiddenInput.tsx'
import { isCheckFor } from '../../shared/tasks.ts'
import { YesNoGrid, YesNoQuestion } from '../../islands/form/inputs/yes_no.tsx'
import isString from '../../util/isString.ts'

function ValueDisplay({ value }: { value: string | RecordValueLink }) {
  if (isString(value)) return value
  return (
    <a href={value.href} className='flex'>
      {value.title}
      {value.thumbnail_href && <img width='200' src={value.thumbnail_href} />}
    </a>
  )
}

function TaskCheckbox({
  task,
}: {
  task: RenderedTask
}) {
  const name = `just_do_it_tasks.${task.procedure.record_id}`

  return (
    <label class='flex gap-4 items-center cursor-pointer p-4 rounded-lg border border-gray-300 bg-white hover:border-gray-400 transition-colors'>
      <div class='flex items-center justify-center px-0 py-0.5 w-5'>
        <div class='flex items-center justify-center rounded'>
          <input
            id={name}
            type='checkbox'
            name={name}
            value='true'
            checked={task.completed}
            class='w-5 h-5 rounded-md border-gray-400 text-indigo-700 focus:ring-indigo-700'
          />
        </div>
      </div>
      <div class='flex gap-1'>
        <span class='text-sm font-medium text-gray-600 leading-5'>
          {task.procedure.displays.finding}
          {task.procedure.displays.value && (
            <>
              : <ValueDisplay value={task.procedure.displays.value} />
            </>
          )}
        </span>
      </div>
    </label>
  )
}

function CheckForTaskInput({
  task,
}: {
  task: CheckForTask
}) {
  assert(task.procedure.displays.value)
  const name = `check_for.${task.procedure.record_id}`

  // Parse the current value from the s-expression if it exists
  let value: 'Yes' | 'No' | 'Unknown' | undefined
  if (task.completed && task.procedure.value) {
    // Extract the value from the s-expression
    // The s-expression contains qualifiers that tell us if something was found or not
    const sexp = task.procedure.value.s_expression
    if (sexp.includes('(qualifier 410515003)')) { // Known present
      value = 'Yes'
    } else if (sexp.includes('(qualifier 410516002)')) { // Known absent
      value = 'No'
    } else if (sexp.includes('(qualifier 261665006)')) { // Unknown
      value = 'Unknown'
    }
  }

  return (
    <>
      <HiddenInput
        name={`${name}.s_expression`}
        value={task.procedure.value.s_expression}
      >
      </HiddenInput>
      <YesNoQuestion
        name={`${name}.existence`}
        value={value}
        label={task.procedure.displays.value}
        required
      />
    </>
  )
}

function TaskGroupCard({
  group,
  organization_id,
}: {
  group: TaskGroup
  organization_id: string
}) {
  const [check_for_tasks, just_do_it_tasks] = partition(group.tasks, isCheckFor)

  return (
    <div class='flex flex-col gap-4'>
      {/* Header */}
      <div class='flex items-start justify-between'>
        <div class='flex flex-col gap-1'>
          <p class='text-sm leading-5'>
            <span class='font-semibold text-gray-600'>
              {'Due to: '}
            </span>
            {group.due_to.map((finding) => (
              <MostRecentFinding
                key={finding.record_id}
                finding={finding}
                organization_id={organization_id}
              />
            ))}
          </p>
        </div>
      </div>

      {/* Check-for Tasks (YesNoGrid) */}
      {check_for_tasks.length > 0 && (
        <YesNoGrid title='Check for'>
          {check_for_tasks.map((task) => (
            <CheckForTaskInput
              key={task.procedure.record_id}
              task={task}
            />
          ))}
        </YesNoGrid>
      )}

      {/* Just-do-it Tasks (Checkboxes) */}
      {just_do_it_tasks.length > 0 && (
        <div class='flex flex-col gap-2'>
          {just_do_it_tasks.map((task) => (
            <TaskCheckbox
              key={task.procedure.record_id}
              task={task}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProgressHeader({
  completed_count,
  total_count,
}: {
  completed_count: number
  total_count: number
}) {
  const percentage = total_count > 0 ? Math.round((completed_count / total_count) * 100) : 0
  const progress_color = percentage === 100 ? 'bg-green-500' : 'bg-indigo-700'
  const badge_color = percentage === 100 ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'

  return (
    <div class='flex flex-col gap-3.5'>
      <div class='flex items-start justify-between'>
        <p class='text-lg font-normal text-gray-600 leading-7'>
          {completed_count}/{total_count} tasks done
        </p>
        <div class={`px-4 py-0.5 rounded-full ${badge_color}`}>
          <span class='text-xs font-medium'>
            {percentage}%
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div class='flex gap-3 items-center w-full'>
        <div class='flex-1 h-1 bg-gray-200 rounded-full min-h-px min-w-px relative'>
          <div
            class={`absolute h-1 rounded-full ${progress_color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function AdditionalTasks({
  task_groups,
  organization_id,
}: {
  task_groups: TaskGroup[]
  organization_id: string
}) {
  // Calculate totals
  const total_tasks = task_groups.reduce(
    (sum, g) => sum + g.tasks.length,
    0,
  )
  const completed_tasks = task_groups.reduce(
    (sum, g) => sum + g.tasks.filter((t) => t.completed).length,
    0,
  )

  if (task_groups.length === 0) {
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

  return (
    <div class='flex flex-col gap-3.5 pb-4 pt-2 w-full max-w-3xl'>
      <ProgressHeader
        completed_count={completed_tasks}
        total_count={total_tasks}
      />

      {task_groups.map((group, index) => (
        <TaskGroupCard
          key={index}
          group={group}
          organization_id={organization_id}
        />
      ))}
    </div>
  )
}
