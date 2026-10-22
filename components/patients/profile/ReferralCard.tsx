import type { ComponentChildren } from 'preact'
import Avatar from '../../library/Avatar.tsx'
import { EllipsisVerticalIcon, PhoneIcon } from '../../library/icons/heroicons/outline.tsx'
import { organizationOf } from '../../../shared/employees.ts'
import type { RenderedEmployee } from '../../../types.ts'

function ReferralAction(
  { id, label, children }: { id: string; label: string; children: ComponentChildren },
) {
  return (
    <button
      id={id}
      type='button'
      disabled
      aria-label={label}
      title='Not available'
      className='flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-gray-600 disabled:opacity-100'
    >
      {children}
    </button>
  )
}

export function ReferralCard(
  { referring_employee }: { referring_employee: RenderedEmployee },
) {
  return (
    <section
      id='patient-case-referral'
      className='flex w-full items-center justify-between gap-2 rounded-b-lg bg-white px-4 pb-4 pt-2.5'
    >
      <div className='flex min-w-0 flex-1 items-start gap-3'>
        <Avatar src={referring_employee.avatar_url} size='lg' />
        <div className='flex min-w-0 flex-col'>
          <p id='patient-case-referral-label' className='truncate text-sm font-semibold leading-5 text-gray-800'>
            Referred by
          </p>
          <p id='patient-case-referrer-name' className='truncate text-xs leading-4 text-gray-600'>
            {referring_employee.name}
          </p>
          <p id='patient-case-referrer-organization' className='truncate text-xs leading-4 text-gray-600'>
            {organizationOf(referring_employee).name}
          </p>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <ReferralAction id='patient-case-referral-call' label='Call referring clinician'>
          <PhoneIcon />
        </ReferralAction>
        <ReferralAction id='patient-case-referral-more' label='More referral actions'>
          <EllipsisVerticalIcon />
        </ReferralAction>
      </div>
    </section>
  )
}
