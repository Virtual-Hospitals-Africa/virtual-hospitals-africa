import { MostRecentFinding } from '../components/library/MostRecentFinding.tsx'
import type { TaskGroup } from '../types.ts'
import assertLength from '../util/assertLength.ts'

function TaskCheckbox({
  group_index,
  task,
}: {
  group_index: number
  task: TaskGroup['tasks'][number]
}) {
  const name = `tasks.${group_index}.${task.procedure.record_id}`

  console.log('task.procedure', task.procedure)

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
      <div class='flex flex-col gap-1'>
        <span class='text-sm font-medium text-gray-600 leading-5'>
          {task.procedure.displays.full}
        </span>
      </div>
    </label>
  )
}

function TaskGroupCard({
  group,
  group_index,
  organization_id,
}: {
  group: TaskGroup
  group_index: number
  organization_id: string
}) {
  assertLength(group.due_to, 1)

  return (
    <div class='flex flex-col gap-4 p-4 md:p-6 rounded-xl border border-gray-200 bg-white'>
      {/* Header */}
      <div class='flex items-start justify-between'>
        <div class='flex flex-col gap-1'>
          <p class='text-sm leading-5'>
            <span class='font-semibold text-gray-600'>Due to:</span>
            <MostRecentFinding
              finding={group.due_to[0]}
              organization_id={organization_id}
            />
          </p>
        </div>
      </div>

      {/* Tasks */}
      <div class='flex flex-col gap-2'>
        {group.tasks.map((task) => (
          <TaskCheckbox
            key={task.procedure.record_id}
            group_index={group_index}
            task={task}
          />
        ))}
      </div>
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
  const percentage = total_count > 0
    ? Math.round((completed_count / total_count) * 100)
    : 0
  const progress_color = percentage === 100 ? 'bg-green-500' : 'bg-indigo-700'
  const badge_color = percentage === 100
    ? 'bg-success-bg text-success-text'
    : 'bg-error-bg text-error-text'

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
          Based on the patient's current clinical findings, no additional tasks
          are needed.
        </p>
      </div>
    )
  }

  return (
    <div class='flex flex-col gap-3.5 pb-4 pt-2 w-full max-w-3xl'>
      <a href='/medical-resources/adult-primary-care.pdf#page=132'>
        FOEIWELW
      </a>
      <ProgressHeader
        completed_count={completed_tasks}
        total_count={total_tasks}
      />

      <div class='flex flex-col gap-4'>
        {task_groups.map((group, index) => (
          <TaskGroupCard
            key={index}
            group={group}
            group_index={index}
            organization_id={organization_id}
          />
        ))}
      </div>
    </div>
  )
}
