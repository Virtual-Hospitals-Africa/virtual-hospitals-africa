import { RenderedCareTeamHealthWorker } from '../../types.ts'
import { ActionButton } from '../library/ActionButton.tsx'
import { GoogleMeetIcon } from '../library/icons/GoogleMeet.tsx'

// Care Team component with provider cards
export function DrawerCareTeam(
  { care_team, organization_id, patient_id }: { care_team: RenderedCareTeamHealthWorker[]; organization_id: string; patient_id: string },
) {
  return (
    <div
      id='patient-drawer-care-team'
      className='content-stretch flex flex-col gap-2 items-center justify-start relative shrink-0 w-full'
    >
      <div className='relative flex flex-col items-start justify-start w-full content-stretch shrink-0'>
        <div className='box-border content-stretch flex gap-1 isolate items-center justify-start px-4 py-0 relative shrink-0 w-full'>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-5.5 not-italic relative shrink-0 text-[#29313d] text-4 text-nowrap whitespace-pre z-[3]">
            Care Team
          </p>
        </div>
        <div className='box-border content-stretch flex flex-col gap-4 items-start justify-start px-4 py-2 relative shrink-0 w-full'>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-4 not-italic relative shrink-0 text-[12px] text-gray-600 w-full">
            See a list of all the doctors who have had contact with the patient in the recent past.
          </p>
        </div>
      </div>
      <ActionButton
        action={{
          method: 'POST',
          href: `/app/organizations/${organization_id}/patients/${patient_id}/open_encounter/start-google-meet`,
        }}
        variant='primary'
      >
        <GoogleMeetIcon className='w-5 mr-1' />
        Create Google Meet
      </ActionButton>

      <div className='box-border content-stretch flex flex-col gap-4 items-start justify-start px-4 py-0 relative shrink-0 w-full'>
        {care_team.map((provider) => (
          <div
            key={provider.health_worker_id}
            className='bg-gray-50 box-border content-stretch flex flex-col gap-4 items-start justify-start p-4 relative rounded-2 shrink-0 w-full'
          >
            <div className='absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-2' />
            <div className='content-stretch flex gap-4 items-start justify-start relative shrink-0 w-full'>
              <div className='basis-0 content-stretch flex flex-col gap-2 grow items-start justify-start min-h-px min-w-px relative shrink-0'>
                <div className='box-border content-stretch flex gap-1 h-5 items-center justify-start px-0.5 py-0 relative rounded-1 shrink-0 w-full'>
                  <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-0 not-italic relative shrink-0 text-[14px] text-center text-gray-800 text-nowrap">
                    <p className='leading-5 whitespace-pre'>
                      {provider.name}
                    </p>
                  </div>
                  <div className='overflow-clip relative shrink-0 size-4'>
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
                  <div className='box-border content-stretch flex gap-1 h-5 items-center justify-start px-0.5 py-0 relative rounded-1 shrink-0 w-full'>
                    <div className='overflow-clip relative shrink-0 size-4'>
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
                    <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-0 not-italic relative shrink-0 text-[#473fce] text-[12px] text-center text-nowrap">
                      <p className='leading-4 whitespace-pre'>
                        {provider.role === 'doctor' ? 'Primary care RenderedCareTeamHealthWorker' : 'Nurse'}
                      </p>
                    </div>
                  </div>
                  <div className='box-border content-stretch flex gap-1 h-5 items-center justify-start px-0.5 py-0 relative rounded-1 shrink-0 w-full'>
                    <div className='overflow-clip relative shrink-0 size-4'>
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
                    <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-0 not-italic relative shrink-0 text-[12px] text-center text-gray-600 text-nowrap">
                      <p className='leading-4 whitespace-pre'>
                        Medical Clinic
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className='bg-center bg-cover bg-no-repeat relative rounded-[200px] shrink-0 size-12'
                style={{
                  backgroundImage: `url('${provider.avatar_url || '/static/images/default-avatar.png'}')`,
                }}
              >
                <div className='absolute -bottom-px overflow-clip -right-px size-3.5'>
                  <div className='absolute inset-[8.333%]'>
                    <div className='bg-green-500 rounded-full size-full'></div>
                  </div>
                </div>
              </div>
            </div>
            <div className='relative flex items-center justify-between w-full content-stretch shrink-0'>
              <div className='bg-indigo-700 box-border content-stretch flex gap-2 h-8 items-center justify-start px-4 py-2 relative rounded-[6px] shrink-0'>
                <div className='overflow-clip relative shrink-0 size-4'>
                  <svg
                    className='block max-w-none size-full'
                    viewBox='0 0 16 16'
                    fill='white'
                  >
                    <path d='M2 6h12v7H2V6zm10-2V3a2 2 0 00-2-2H6a2 2 0 00-2 2v1H2v2h12V4h-2zm-6 0V3h4v1H6z' />
                  </svg>
                </div>
                <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-0 not-italic relative shrink-0 text-[12px] text-center text-nowrap text-white">
                  <p className='leading-4 whitespace-pre'>Message</p>
                </div>
              </div>
              <div className='box-border content-stretch flex gap-1 h-5 items-center justify-start px-0.5 py-0 relative rounded-1 shrink-0'>
                <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center leading-0 relative shrink-0 text-[12px] text-center text-gray-600 text-nowrap">
                  <p className='leading-4 whitespace-pre'>
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
