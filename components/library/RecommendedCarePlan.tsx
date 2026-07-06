import { ComponentChildren, JSX } from 'preact'
import { CarePlanGroup, MedicineGroupWithPermissions, RenderedEmployeeWithPresenceAndSeniority } from '../../types.ts'
import { initials } from '../../util/initials.ts'
import cls from '../../util/cls.ts'
import Avatar from './Avatar.tsx'
import { DueTo } from '../triage/tasks/DueTo.tsx'
import { hyphenate } from '../../util/hyphenate.ts'
import { AwareBadge, Schedule } from '../RecommendedMedication.tsx'
import { DoctorIcon } from './icons/Doctor.tsx'
import { AcademicCapIcon, FaceSmileIcon, HeartIcon, UserIcon } from './icons/heroicons/mini.tsx'

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

const ROLE_ICONS: Record<string, (props: { className?: string }) => JSX.Element> = {
  doctor: DoctorIcon,
  nurse: HeartIcon,
  specialist: AcademicCapIcon,
  dentist: FaceSmileIcon,
}

// Shown in place of employee avatars when nobody at this facility holds a role
// satisfying the permission: a tiny avatar whose contents are an icon for the
// role that would be permitted.
function RoleIconAvatar({ permitted }: { permitted: string }) {
  const Icon = ROLE_ICONS[permitted] ?? UserIcon
  return (
    <div
      title={permitted}
      data-permitted={permitted}
      class='flex-none h-6 w-6 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-gray-500'
    >
      <Icon className='h-4 w-4' />
    </div>
  )
}

// "requires approval from"/"can be done by" followed by the tiny avatars of the
// employees who can satisfy the permission, on-duty first. When no employee at
// this facility qualifies, an icon for the permitted role is shown instead.
function PermissionEmployees(
  { label, permitted, on_duty, off_duty, to_be_notified_ids }: {
    label: string
    permitted: string
    on_duty: RenderedEmployeeWithPresenceAndSeniority[]
    off_duty: RenderedEmployeeWithPresenceAndSeniority[]
    to_be_notified_ids: Set<string>
  },
) {
  const employees = [...on_duty, ...off_duty]
  return (
    <div class='flex items-center gap-2 flex-none'>
      <span class='text-xs text-gray-500 whitespace-nowrap'>{label}</span>
      <div class='flex -space-x-1 overflow-hidden items-center'>
        {employees.length
          ? employees.map((employee) => (
            <EmployeeAvatar
              key={employee.id}
              employee={employee}
              to_be_notified={to_be_notified_ids.has(employee.id)}
            />
          ))
          : <RoleIconAvatar permitted={permitted} />}
      </div>
    </div>
  )
}

function TaskRow({ children }: { children: ComponentChildren }) {
  return <li class='flex items-center justify-between gap-3 text-sm text-gray-700'>{children}</li>
}

// One recommended medicine: the name once, then each option (an EML row with
// its own form/route and dose schedules) with who can prescribe it here.
function MedicineGroup(
  { group, to_be_notified_ids }: {
    group: MedicineGroupWithPermissions
    to_be_notified_ids: Set<string>
  },
) {
  return (
    <li class='flex flex-col gap-1' data-medicine={hyphenate(group.name)}>
      <span class='text-sm font-medium text-gray-900'>{group.name}</span>
      <ul class='flex flex-col gap-1.5 pl-4'>
        {group.options.map(({ option, permissions }, index) => (
          <li key={index} class='flex items-start justify-between gap-3 text-sm text-gray-700'>
            <div class='flex flex-col'>
              <span class='text-xs text-gray-500'>
                {option.form} · {option.route} <AwareBadge aware={option.aware} />
              </span>
              {option.schedules.map((schedule, schedule_index) => (
                <span key={schedule_index}>
                  {schedule.age_classifier && <span class='text-xs uppercase tracking-wide text-gray-400 mr-1'>[{schedule.age_classifier}]</span>}
                  <Schedule dose={schedule} />
                </span>
              ))}
            </div>
            {permissions.type === 'cant_do' && (
              <PermissionEmployees
                label='can be prescribed by'
                permitted={permissions.permitted}
                on_duty={permissions.employees_who_can_do.on_duty}
                off_duty={permissions.employees_who_can_do.off_duty}
                to_be_notified_ids={to_be_notified_ids}
              />
            )}
          </li>
        ))}
      </ul>
    </li>
  )
}

export default function RecommendedCarePlan(
  { to_be_notified, care_plan_groups, organization_id }: {
    to_be_notified: RenderedEmployeeWithPresenceAndSeniority[]
    care_plan_groups: CarePlanGroup[]
    organization_id: string
  },
) {
  const to_be_notified_ids = new Set(to_be_notified.map((employee) => employee.id))

  return (
    <div class='w-full flex flex-col gap-4'>
      {care_plan_groups.map((group) => (
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
                    permitted={permissions.permitted}
                    on_duty={permissions.employees_who_can_approve.on_duty}
                    off_duty={permissions.employees_who_can_approve.off_duty}
                    to_be_notified_ids={to_be_notified_ids}
                  />
                )}
                {permissions.type === 'cant_do' && (
                  <PermissionEmployees
                    label='can be done by'
                    permitted={permissions.permitted}
                    on_duty={permissions.employees_who_can_do.on_duty}
                    off_duty={permissions.employees_who_can_do.off_duty}
                    to_be_notified_ids={to_be_notified_ids}
                  />
                )}
              </TaskRow>
            ))}
            {group.medicines.map((medicine_group) => (
              <MedicineGroup
                key={medicine_group.name}
                group={medicine_group}
                to_be_notified_ids={to_be_notified_ids}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
