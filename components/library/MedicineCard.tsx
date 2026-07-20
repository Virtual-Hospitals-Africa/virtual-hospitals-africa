import { JSX, SVGAttributes } from 'preact'
import { MedicineGroupWithPermissions, RecommendedMedicineOptionWithPermissions, TaskPermissions } from '../../types.ts'
import { Schedule } from '../RecommendedMedication.tsx'
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from './icons/heroicons/mini.tsx'
import { ChevronDownIcon } from './icons/heroicons/mini.tsx'
import cls from '../../util/cls.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import Avatar from './Avatar.tsx'
import { initials } from '../../util/initials.ts'
import { NurseIcon } from './icons/Nurse.tsx'
import { DoctorIcon } from './icons/Doctor.tsx'
import { AcademicCapIcon, FaceSmileIcon, UserIcon } from './icons/heroicons/mini.tsx'
import { AwareCircle } from './Aware.tsx'

const STOCK_ICON: Record<string, (props: SVGAttributes<SVGSVGElement>) => JSX.Element> = {
  in_stock: CheckCircleIcon,
  low: ExclamationCircleIcon,
  out: XCircleIcon,
}

const STOCK_COLOR: Record<string, string> = {
  in_stock: 'text-green-700',
  low: 'text-amber-600',
  out: 'text-red-800',
}

const STOCK_LABEL: Record<string, string> = {
  in_stock: 'In stock',
  low: 'Low Stock',
  out: 'Out of stock',
}

function StockLine(
  { stock_level, facility_name }: { stock_level: 'out' | 'low' | 'in_stock'; facility_name: string },
): JSX.Element {
  const Icon = STOCK_ICON[stock_level]
  const color = STOCK_COLOR[stock_level]
  return (
    <div class={cls('flex items-center gap-1 text-xs font-medium', color)}>
      <Icon className='w-4 h-4 flex-none' />
      <span>{STOCK_LABEL[stock_level]} · {facility_name}</span>
    </div>
  )
}

// Two permissions render identically iff they'd show the same avatars
function prescriberKey(permissions: TaskPermissions): string {
  if (permissions.type !== 'cant_do') return permissions.type
  return JSON.stringify([
    permissions.permitted,
    permissions.employees_who_can_do.on_duty.map((e) => e.id),
    permissions.employees_who_can_do.off_duty.map((e) => e.id),
  ])
}

function sharedPermissions(options: RecommendedMedicineOptionWithPermissions[]): TaskPermissions | null {
  const [first, ...rest] = options
  const key = prescriberKey(first.permissions)
  return rest.every(({ permissions }) => prescriberKey(permissions) === key) ? first.permissions : null
}

const ROLE_ICONS: Record<string, (props: { className?: string }) => JSX.Element> = {
  doctor: DoctorIcon,
  nurse: NurseIcon,
  specialist: AcademicCapIcon,
  dentist: FaceSmileIcon,
}

function PrescriberInfo(
  { permissions, to_be_notified_ids }: { permissions: TaskPermissions; to_be_notified_ids: Set<string> },
): JSX.Element | null {
  if (permissions.type === 'no_approval_needed') return null
  if (permissions.type !== 'cant_do') return null

  const { permitted, employees_who_can_do } = permissions
  const employees = [...employees_who_can_do.on_duty, ...employees_who_can_do.off_duty]
  const Icon = ROLE_ICONS[permitted] ?? UserIcon

  return (
    <div class='flex items-center gap-2 text-xs text-gray-500' data-permitted={permitted}>
      <Icon className='w-4 h-4 flex-none' />
      <span>Prescribable by {permitted}</span>
      {employees.length > 0 && (
        <div class='flex -space-x-1 overflow-hidden items-center'>
          {employees.map((employee) => (
            <Avatar
              key={employee.id}
              size='sm'
              src={employee.avatar_url}
              initials={initials(employee.name)}
              className={cls(
                'text-xs ring-2',
                employee.at_work ? 'opacity-100' : 'opacity-50',
                to_be_notified_ids.has(employee.id) ? 'ring-indigo-500' : 'ring-white',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MedicineCard(
  { group, to_be_notified_ids, prescribable }: {
    group: MedicineGroupWithPermissions
    to_be_notified_ids: Set<string>
    prescribable: boolean
  },
): JSX.Element {
  const group_permissions = sharedPermissions(group.forms.flatMap((form) => form.options))

  // Derive form/route display from first form
  const first_form_route = group.forms[0]?.form_route
  const [form_label, route_label] = first_form_route?.includes(' · ') ? first_form_route.split(' · ') : [first_form_route, undefined]

  return (
    <li class='flex flex-col rounded-[14px] border border-gray-200 bg-white' data-medicine={hyphenate(group.name)}>
      {/* Top section */}
      <div class='flex items-start justify-between px-3 py-3.5'>
        {/* Left column */}
        <div class='flex flex-col gap-2 flex-1 min-w-0'>
          <span class='text-base font-semibold text-gray-900 tracking-tight'>{group.name}</span>

          {group.facility_availabilities.map((fa) => (
            <StockLine
              key={fa.facility.id}
              stock_level={fa.stock_level}
              facility_name={fa.facility.name}
            />
          ))}
        </div>

        {/* Right column */}
        <div class='flex flex-col items-end justify-between self-stretch shrink-0 ml-3'>
          {group.aware && <AwareCircle aware={group.aware} />}
          {first_form_route && (
            <div class='flex flex-col items-end text-right text-gray-500'>
              <span class='text-xs leading-4'>{form_label}</span>
              {route_label && <span class='text-[10px] leading-3'>{route_label}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div class='flex items-center justify-between border-t border-gray-200 px-3 py-3'>
        {/* More info toggle */}
        <details class='group flex-1'>
          <summary class='flex items-center gap-1.5 py-1 cursor-pointer text-xs font-medium text-gray-500 list-none [&::-webkit-details-marker]:hidden'>
            <ChevronDownIcon className='w-4 h-4 transition-transform group-open:rotate-180' />
            More info
          </summary>

          {/* Expanded content */}
          <div class='flex flex-col gap-3 pt-3'>
            {/* Dose schedules per form/option */}
            {group.forms.map((form) => (
              <div key={form.form_route} class='flex flex-col gap-1.5' data-form-route={hyphenate(form.form_route)}>
                {group.forms.length > 1 && <span class='text-xs text-gray-500 font-medium'>{form.form_route}</span>}
                {form.options.map(({ option }, index) => (
                  <div key={index} class='flex flex-col gap-1 pl-1'>
                    <span class='text-xs text-gray-500'>
                      {option.disorder} <AwareCircle aware={option.aware} />
                    </span>
                    {option.schedules.map((schedule, si) => (
                      <div key={si} class='text-sm text-gray-800 bg-gray-50 rounded px-2 py-1.5'>
                        {schedule.age_classifier && (
                          <span class='text-xs uppercase tracking-wide text-gray-400 mr-1'>
                            [{schedule.age_classifier}]
                          </span>
                        )}
                        <Schedule dose={schedule} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Guidelines link */}
            {group.guidelines && (
              <a
                href={group.guidelines.href}
                target='_blank'
                rel='noopener noreferrer'
                class='text-xs text-indigo-600 hover:text-indigo-800 underline'
              >
                {group.guidelines.document_name}
              </a>
            )}

            {/* AWaRe detail */}
            {group.aware && (
              <div class='flex items-center gap-1.5 text-xs text-gray-500'>
                <span>AWaRe classification:</span>
                <AwareCircle aware={group.aware} />
              </div>
            )}
          </div>
        </details>

        {/* Right side of footer */}
        {prescribable
          ? (
            <a
              href='#todo'
              class='flex items-center gap-2 bg-indigo-700 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-indigo-800'
            >
              Prescribe
            </a>
          )
          : group_permissions && <PrescriberInfo permissions={group_permissions} to_be_notified_ids={to_be_notified_ids} />}
      </div>
    </li>
  )
}
