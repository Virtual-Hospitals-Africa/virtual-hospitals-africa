import { RenderedPatientHistory } from '../../types.ts'

// History component with medical history sections
export function DrawerHistory(
  { history }: { history: RenderedPatientHistory },
) {
  const history_items = [
    {
      key: 'pre_existing_conditions',
      label: 'Pre-existing Conditions',
      icon: 'symptom',
      records: history.pre_existing_conditions,
    },
    {
      key: 'allergies',
      label: 'Allergies',
      icon: 'allergy',
      records: history.allergies,
    },
    {
      key: 'family_history',
      label: 'Family History',
      icon: 'group',
      records: history.family_history,
    },
    {
      key: 'major_surgeries',
      label: 'Major Surgeries',
      icon: 'surgery',
      records: history.major_surgeries,
    },
    {
      key: 'medications',
      label: 'Medications',
      icon: 'pharmacy',
      records: history.medications,
    },
    {
      key: 'lifestyle',
      label: 'Lifestyle',
      icon: 'heart-rate',
      records: history.lifestyle,
    },
  ]

  return (
    <div
      id='patient-drawer-history'
      className='bg-white content-stretch flex flex-col items-start justify-start relative shrink-0 w-[368px]'
    >
      <div className='content-stretch flex h-[46px] items-start justify-between relative shrink-0 w-full'>
        <div className='basis-0 box-border content-stretch flex gap-[16px] grow h-[46px] isolate items-center justify-start min-h-px min-w-px px-[16px] py-[8px] relative shrink-0'>
          <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[22px] not-italic relative shrink-0 text-[#29313d] text-[16px] text-nowrap whitespace-pre z-[2]">
            History
          </p>
        </div>
      </div>

      <div className='relative flex flex-col items-start justify-start content-stretch shrink-0'>
        {history_items.map((item) => (
          <div
            key={item.key}
            className='box-border content-stretch flex flex-col gap-[8px] items-start justify-start px-[16px] py-[8px] relative shrink-0 w-[368px]'
          >
            <div className='box-border content-stretch flex flex-col gap-[8px] items-start justify-start overflow-clip pb-[16px] pt-0 px-0 relative shrink-0 w-[342px]'>
              <div className='content-stretch flex gap-[8px] items-center justify-center relative shrink-0'>
                <div className='overflow-clip relative shrink-0 size-[16px]'>
                  <div className='absolute inset-[6.25%]'>
                    <svg
                      className='block max-w-none size-full'
                      viewBox='0 0 16 16'
                      fill='currentColor'
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
                <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-gray-600 text-nowrap whitespace-pre">
                  {item.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
