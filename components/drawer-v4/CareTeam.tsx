import { RenderedCareTeamHealthWorker } from '../../types.ts'

// Care Team component with provider cards
export function DrawerCareTeam(
  { care_team }: { care_team: RenderedCareTeamHealthWorker[] },
) {
  return (
    <div
      id='patient-drawer-care-team'
      className='content-stretch flex flex-col gap-[8px] items-center justify-start relative shrink-0 w-full'
    >
      <div className='relative flex flex-col items-start justify-start w-full content-stretch shrink-0'>
        <div className='box-border content-stretch flex gap-[4px] isolate items-center justify-start px-[16px] py-0 relative shrink-0 w-full'>
          <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[22px] not-italic relative shrink-0 text-[#29313d] text-[16px] text-nowrap whitespace-pre z-[3]">
            Care Team
          </p>
        </div>
        <div className='box-border content-stretch flex flex-col gap-[16px] items-start justify-start px-[16px] py-[8px] relative shrink-0 w-full'>
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-gray-600 w-full">
            See a list of all the doctors who have had contact with the patient in the recent past.
          </p>
        </div>
      </div>

      <div className='box-border content-stretch flex flex-col gap-[16px] items-start justify-start px-[16px] py-0 relative shrink-0 w-full'>
        {care_team.map((provider) => (
          <div
            key={provider.health_worker_id}
            className='bg-gray-50 box-border content-stretch flex flex-col gap-[16px] items-start justify-start p-[16px] relative rounded-[8px] shrink-0 w-full'
          >
            <div className='absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[8px]' />
            <div className='content-stretch flex gap-[16px] items-start justify-start relative shrink-0 w-full'>
              <div className='basis-0 content-stretch flex flex-col gap-[8px] grow items-start justify-start min-h-px min-w-px relative shrink-0'>
                <div className='box-border content-stretch flex gap-[4px] h-[20px] items-center justify-start px-[2px] py-0 relative rounded-[4px] shrink-0 w-full'>
                  <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-gray-800 text-nowrap">
                    <p className='leading-[20px] whitespace-pre'>
                      {provider.name}
                    </p>
                  </div>
                  <div className='overflow-clip relative shrink-0 size-[16px]'>
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
                <div className='relative flex flex-col items-start justify-start w-full content-stretch shrink-0'>
                  <div className='box-border content-stretch flex gap-[4px] h-[20px] items-center justify-start px-[2px] py-0 relative rounded-[4px] shrink-0 w-full'>
                    <div className='overflow-clip relative shrink-0 size-[16px]'>
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
                    <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#473fce] text-[12px] text-center text-nowrap">
                      <p className='leading-[16px] whitespace-pre'>
                        {provider.profession === 'doctor' ? 'Primary Care RenderedCareTeamHealthWorker' : 'Nurse'}
                      </p>
                    </div>
                  </div>
                  <div className='box-border content-stretch flex gap-[4px] h-[20px] items-center justify-start px-[2px] py-0 relative rounded-[4px] shrink-0 w-full'>
                    <div className='overflow-clip relative shrink-0 size-[16px]'>
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
                    <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-gray-600 text-nowrap">
                      <p className='leading-[16px] whitespace-pre'>
                        Medical Clinic
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='bg-center bg-cover bg-no-repeat relative rounded-[200px] shrink-0 size-[48px]'
                style={{
                  backgroundImage: `url('${provider.avatar_url || '/static/images/default-avatar.png'}')`,
                }}
              >
                <div className='absolute bottom-[-1px] overflow-clip right-[-1px] size-[14px]'>
                  <div className='absolute inset-[8.333%]'>
                    <div className='bg-green-500 rounded-full size-full'></div>
                  </div>
                </div>
              </div>
            </div>
            <div className='relative flex items-center justify-between w-full content-stretch shrink-0'>
              <div className='bg-indigo-700 box-border content-stretch flex gap-[8px] h-[32px] items-center justify-start px-[16px] py-[8px] relative rounded-[6px] shrink-0'>
                <div className='overflow-clip relative shrink-0 size-[16px]'>
                  <svg
                    className='block max-w-none size-full'
                    viewBox='0 0 16 16'
                    fill='white'
                  >
                    <path d='M2 6h12v7H2V6zm10-2V3a2 2 0 00-2-2H6a2 2 0 00-2 2v1H2v2h12V4h-2zm-6 0V3h4v1H6z' />
                  </svg>
                </div>
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-white">
                  <p className='leading-[16px] whitespace-pre'>Message</p>
                </div>
              </div>
              <div className='box-border content-stretch flex gap-[4px] h-[20px] items-center justify-start px-[2px] py-0 relative rounded-[4px] shrink-0'>
                <div className="flex flex-col font-['Inter:Italic',_sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[12px] text-center text-gray-600 text-nowrap">
                  <p className='leading-[16px] whitespace-pre'>
                    Last visit 2 months ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
