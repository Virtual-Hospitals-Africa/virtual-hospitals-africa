import {
  KeyedTriggeredTaskGroup,
  TaskPriority,
} from '../shared/additional_tasks.ts'
import { Button } from '../components/library/Button.tsx'

type TaskCompletion = {
  group_key: string
  task_key: string
  completed: boolean
}

type ActiveTaskGroup = KeyedTriggeredTaskGroup & {
  task_completions: Map<string, boolean>
}

const PRIORITY_STYLES: Record<
  TaskPriority,
  { bg: string; text: string; badge_bg: string; badge_text: string }
> = {
  'Emergency': {
    bg: 'bg-error-bg',
    text: 'text-error-text',
    badge_bg: 'bg-error-bg',
    badge_text: 'text-error-text',
  },
  'Very urgent': {
    bg: 'bg-accent-orange-bg',
    text: 'text-accent-orange-text',
    badge_bg: 'bg-accent-orange-bg',
    badge_text: 'text-accent-orange-text',
  },
  'Urgent': {
    bg: 'bg-warning-bg',
    text: 'text-warning-text',
    badge_bg: 'bg-warning-bg',
    badge_text: 'text-warning-text',
  },
}

function TaskCheckbox({
  group_key,
  task,
  checked,
}: {
  group_key: string
  task: { key: string; label: string; description?: string }
  checked: boolean
}) {
  const name = `tasks.${group_key}.${task.key}`

  return (
    <label class='flex gap-4 items-center cursor-pointer p-4 rounded-lg border border-gray-300 bg-white hover:border-gray-400 transition-colors'>
      <div class='flex items-center justify-center px-0 py-0.5 w-5'>
        <div class='flex items-center justify-center rounded'>
          <input
            id={name}
            type='checkbox'
            name={name}
            value='true'
            checked={checked}
            class='w-5 h-5 rounded-md border-gray-400 text-indigo-700 focus:ring-indigo-700'
          />
        </div>
      </div>
      <div class='flex flex-col gap-1'>
        <span class='text-sm font-medium text-gray-600 leading-5'>
          {task.label}
        </span>
        {task.description && (
          <span class='text-xs text-gray-500 leading-4'>
            {task.description}
          </span>
        )}
      </div>
    </label>
  )
}

function HandoverAction({
  group_key,
  label,
}: {
  group_key: string
  label: string
}) {
  return (
    <div class='flex items-center justify-between p-4 rounded-lg bg-red-50 border border-gray-300'>
      <div class='flex gap-4 items-center'>
        <div class='relative size-6'>
          <svg
            class='w-6 h-6 text-red-600'
            fill='currentColor'
            viewBox='0 0 24 24'
          >
            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
          </svg>
        </div>
        <span class='text-base font-normal text-gray-600'>
          {label}
        </span>
      </div>
      <Button
        variant='destructive'
        size='lg'
        type='button'
        name='handover_group'
        value={group_key}
        right_icon={
          <svg
            class='w-4 h-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M14 5l7 7m0 0l-7 7m7-7H3'
            />
          </svg>
        }
      >
        Start Handover
      </Button>
    </div>
  )
}

function TaskGroupCard({
  group,
}: {
  group: ActiveTaskGroup
}) {
  const styles = PRIORITY_STYLES[group.priority]

  return (
    <div class='flex flex-col gap-4 p-4 md:p-6 rounded-xl border border-gray-200 bg-white'>
      {/* Header */}
      <div class='flex items-start justify-between'>
        <div class='flex flex-col gap-1'>
          <p class='text-sm leading-5'>
            <span class='font-semibold text-gray-600'>Due to:</span>
            <span class='font-normal text-indigo-700'>
              {group.trigger_label}
            </span>
          </p>
        </div>
        <div class={`px-4 py-0.5 rounded-full ${styles.badge_bg}`}>
          <span class={`text-sm font-medium ${styles.badge_text}`}>
            {group.priority}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div class='flex flex-col gap-2'>
        {group.tasks.map((task) => (
          <TaskCheckbox
            key={task.key}
            group_key={group.key}
            task={task}
            checked={group.task_completions.get(task.key) ?? false}
          />
        ))}
      </div>

      {/* Handover action if required */}
      {group.handover_required && group.handover_label && (
        <HandoverAction
          group_key={group.key}
          label={group.handover_label}
        />
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
  task_groups
}: {
  task_groups: TaskGroup[]
}) {
  // Build completion map for quick lookup
  const completion_map = new Map<string, Map<string, boolean>>()
  for (const completion of task_completions) {
    if (!completion_map.has(completion.group_key)) {
      completion_map.set(completion.group_key, new Map())
    }
    completion_map.get(completion.group_key)!.set(
      completion.task_key,
      completion.completed,
    )
  }

  // Enrich groups with completion status
  const groups_with_status: ActiveTaskGroup[] = active_task_groups.map((
    group,
  ) => ({
    ...group,
    task_completions: completion_map.get(group.key) ?? new Map(),
  }))

  // Calculate totals
  const total_tasks = active_task_groups.reduce(
    (sum, g) => sum + g.tasks.length,
    0,
  )
  const completed_tasks = task_completions.filter((c) => c.completed).length

  if (active_task_groups.length === 0) {
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
      <ProgressHeader
        completed_count={completed_tasks}
        total_count={total_tasks}
      />

      <div class='flex flex-col gap-4'>
        {groups_with_status.map((group) => (
          <TaskGroupCard key={group.key} group={group} />
        ))}
      </div>
    </div>
  )
}
