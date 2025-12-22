import { Priority, PRIORITY_COLORS } from '../../shared/priorities.ts'
import { Maybe, RenderedPatient } from '../../types.ts'
import cls from '../../util/cls.ts'

// Patient's drawer card component with avatar, name, DOB, and triage
export function DrawerPatientCard(
  { patient, priority }: {
    patient: RenderedPatient
    priority: Maybe<Priority>
  },
) {
  const priority_color = priority
    ? PRIORITY_COLORS[priority]
    : { bg: 'bg-gray-100', text: 'gray-800' }

  return (
    <div className={cls('relative rounded-[8px] shrink-0', priority_color.bg)}>
      <div className='box-border content-stretch flex flex-col gap-[12px] items-center justify-start overflow-clip p-[16px] relative'>
        <div className='content-stretch flex gap-[12px] h-[56px] items-center justify-start relative shrink-0 w-[336px]'>
          <div className='basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-start min-h-px min-w-px relative shrink-0'>
            <div className='content-stretch flex gap-[8px] items-center justify-start relative shrink-0 w-full'>
              <div className="basis-0 flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold grow justify-center leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[18px] text-gray-800 text-nowrap">
                <p className='[white-space-collapse:collapse] leading-[26px] overflow-ellipsis overflow-hidden'>
                  {patient.name}
                </p>
              </div>
              <div className='bg-gray-50 box-border content-stretch flex gap-[10px] items-center justify-start p-[12px] relative rounded-[6px] shrink-0 size-[24px]'>
                <div className='absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[6px]' />
                <div className='absolute inset-1/4 overflow-clip'>
                  <div className='absolute inset-[6.25%]'>
                    <svg
                      className='block max-w-none size-full'
                      viewBox='0 0 16 16'
                      fill='none'
                    >
                      <path
                        d='M8 3V13M3 8H13'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className='content-stretch flex gap-[16px] items-center justify-start relative shrink-0'>
              <div className='box-border content-stretch flex gap-[4px] items-start justify-start px-0 py-[4px] relative rounded-[5px] shrink-0'>
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#29313d] text-[12px] text-center text-nowrap whitespace-pre">
                  {patient.sex || 'Unknown'}
                </p>
              </div>
              <div className='box-border content-stretch flex gap-[4px] items-start justify-start px-0 py-[4px] relative rounded-[5px] shrink-0'>
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#29313d] text-[12px] text-center text-nowrap whitespace-pre">
                  {patient.dob_formatted}{' '}
                  {patient.age_display && `(${patient.age_display})`}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className='relative w-full h-0 shrink-0'>
          <div className='absolute bottom-[-0.5px] left-0 right-0 top-[-0.5px]'>
            <svg
              className='block max-w-none size-full'
              viewBox='0 0 336 1'
              fill='none'
            >
              <line x1='0' y1='0.5' x2='336' y2='0.5' stroke='#e5e7eb' />
            </svg>
          </div>
        </div>
        <div className='relative flex items-center justify-between w-full content-stretch shrink-0'>
          <div className='relative flex flex-col items-start justify-start content-stretch shrink-0'>
            <p
              id='patient-drawer-priority'
              className={cls(
                "font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-nowrap whitespace-pre",
                priority_color.text,
              )}
            >
              {priority || 'Priority to be determined'}
            </p>
          </div>
        </div>
      </div>
      <div className='absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[8px]' />
    </div>
  )
}
