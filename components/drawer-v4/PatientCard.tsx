import { Priority, PRIORITY_COLORS } from '../../shared/priorities.ts'
import { Maybe, RenderedPatient } from '../../types.ts'
import cls from '../../util/cls.ts'
// import {
//   IdentificationIcon,
//   LinkIcon,
// } from '../library/icons/heroicons/outline.tsx'

// Patient's drawer card component with avatar, name, DOB, and triage
export function DrawerPatientCard(
  { patient, organization_id, priority }: {
    patient: RenderedPatient
    organization_id: string
    priority: Maybe<Priority>
  },
) {
  const priority_color = priority
    ? PRIORITY_COLORS[priority]
    : { bg: 'bg-gray-100', text: 'gray-800' }

  const href = patient.completed_registration
    ? `/app/organizations/${organization_id}/patients/${patient.id}/profile`
    : undefined
  const Tag = href ? 'a' : 'div'

  return (
    <div
      className={cls(
        'sticky top-0 z-10 box-border flex items-start gap-2 w-full px-3 py-2',
        priority_color.bg,
      )}
    >
      <Tag
        className='flex flex-col justify-between gap-1 relative min-w-0 flex-1'
        href={href}
      >
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] leading-6.5 text-gray-800">
          {patient.name}
        </p>
        <p className='text-xs text-[#29313d]'>
          {patient.description}
        </p>
      </Tag>
      <div
        id='patient-drawer-priority'
        className={cls(
          "font-['Inter:Semi_Bold',sans-serif] font-semibold leading-6 self-center shrink-0",
          priority_color.text,
        )}
      >
        {priority || 'Priority to be determined'}
      </div>
    </div>
  )
}
