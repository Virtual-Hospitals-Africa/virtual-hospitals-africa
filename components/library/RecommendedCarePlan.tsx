import { ComponentChildren } from 'preact'
import { RenderedEmployeeWithPresenceAndSeniority, TaskGroupWithPermissions } from '../../types.ts'
import { initials } from '../../util/initials.ts'
import cls from '../../util/cls.ts'
import Avatar from './Avatar.tsx'
import { DueTo } from '../triage/tasks/DueTo.tsx'
import { hyphenate } from '../../util/hyphenate.ts'

// A tiny avatar for an employee who can do/approve a task. On-duty employees are
// shown at full opacity; off-duty ones are greyed out. Employees that are slated
// to be notified are wrapped in an indigo ring.
function EmployeeAvatar(
  { employee, to_be_notified }: {
    employee: RenderedEmployeeWithPresenceAndSeniority
    to_be_notified: boolean
  },
) {
  return (
    <Avatar
      size='sm'
      src={employee.avatar_url}
      initials={initials(employee.name)}
      className={cls(
        'text-xs ring-2',
        employee.at_work ? 'opacity-100' : 'opacity-50',
        to_be_notified ? 'ring-indigo-500' : 'ring-white',
      )}
    />
  )
}

// "requires approval from"/"can be done by" followed by the tiny avatars of the
// employees who can satisfy the task's permission, on-duty first.
function PermissionEmployees(
  { label, on_duty, off_duty, to_be_notified_ids }: {
    label: string
    on_duty: RenderedEmployeeWithPresenceAndSeniority[]
    off_duty: RenderedEmployeeWithPresenceAndSeniority[]
    to_be_notified_ids: Set<string>
  },
) {
  return (
    <div class='flex items-center gap-2 flex-none'>
      <span class='text-xs text-gray-500 whitespace-nowrap'>{label}</span>
      <div class='flex -space-x-1 overflow-hidden items-center'>
        {[...on_duty, ...off_duty].map((employee) => (
          <EmployeeAvatar
            key={employee.id}
            employee={employee}
            to_be_notified={to_be_notified_ids.has(employee.id)}
          />
        ))}
      </div>
    </div>
  )
}

function TaskRow({ children }: { children: ComponentChildren }) {
  return <li class='flex items-center justify-between gap-3 text-sm text-gray-700'>{children}</li>
}

export default function RecommendedCarePlan(
  { to_be_notified, task_groups_with_permissions, organization_id }: {
    to_be_notified: RenderedEmployeeWithPresenceAndSeniority[]
    task_groups_with_permissions: TaskGroupWithPermissions[]
    organization_id: string
  },
) {
  const to_be_notified_ids = new Set(to_be_notified.map((employee) => employee.id))

  return (
    <div class='w-full flex flex-col gap-4'>
      {task_groups_with_permissions.map((group) => (
        <div
          key={group.due_to.map((record) => record.id).join('-')}
          class='task-group-card flex flex-col gap-2'
          data-due-to={group.due_to.map((record) => hyphenate(record.displays.full)).join('-')}
        >
          <DueTo
            due_to={group.due_to}
            organization_id={organization_id}
          />
          <ul class='w-full flex flex-col gap-2'>
            {group.tasks.map(({ task, permissions }) => (
              <TaskRow key={task.description}>
                <span>{task.description}</span>
                {permissions.type === 'approval_needed' && (
                  <PermissionEmployees
                    label='requires approval from'
                    on_duty={permissions.employees_who_can_approve.on_duty}
                    off_duty={permissions.employees_who_can_approve.off_duty}
                    to_be_notified_ids={to_be_notified_ids}
                  />
                )}
                {permissions.type === 'cant_do' && (
                  <PermissionEmployees
                    label='can be done by'
                    on_duty={permissions.employees_who_can_do.on_duty}
                    off_duty={permissions.employees_who_can_do.off_duty}
                    to_be_notified_ids={to_be_notified_ids}
                  />
                )}
              </TaskRow>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
