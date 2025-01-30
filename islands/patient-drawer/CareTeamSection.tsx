import Avatar from '../../components/library/Avatar.tsx'
import { DoctorIcon } from '../../components/library/icons/Doctor.tsx'

// {
//   name: patient.primary_provider_name,
//   health_worker_id: patient.primary_provider_health_worker_id,
//   specialty: 'Primary Care Provider',
//   avatar_url: patient.primary_provider_avatar_url,
//   professions: [patient.primary_provider_profession],
//   organization_name: patient.primary_provider_organization_name,
//   documents: [],
// },

export function CareTeamSection({ care_team }: {
  // deno-lint-ignore no-explicit-any
  care_team: any[]
}) {
  // care_team.forEach(
  //   (health_worker) => console.log('health_worker', health_worker),
  // )
  return (
    <div>
      <p>
        {'See a list of all the doctors who have had contact with the patient in the recent past. '}
      </p>
      <br />
      {care_team.map((health_worker) => (
        <div className='flex gap-3 items-center'>
          {health_worker.avatar_url && (
            <div className='flex-shrink-0'>
              <Avatar
                src={health_worker.avatar_url}
                className='h-15 w-15'
              />
            </div>
          )}

          {/* gap-3 items-center */}
          <div className='flex flex-col items-start'>
            <p className='font-semibold text-gray-900 min-w-0 flex-1 flex'>
              Dr. {health_worker.name}
            </p>
            <div className={'flex flex-row items-center text-sm my-2'}>
              <svg
                viewBox='0 0 13 14'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='w-5 h-4'
              >
                <mask
                  id='mask0_1698_13178'
                  style='mask-type:luminance'
                  maskUnits='userSpaceOnUse'
                  x='0'
                  y='0'
                >
                  <path
                    d='M9.2487 1.44836H1.08203V12.5317H9.2487V1.44836Z'
                    fill='white'
                    stroke='white'
                    stroke-linejoin='round'
                  />
                  <path
                    d='M9.25 6.11499H12.1667V12.5317H9.25'
                    stroke='white'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                  />
                  <path
                    d='M3.41406 6.11499H6.91406M5.16406 4.36499V7.86499'
                    stroke='black'
                    stroke-linecap='round'
                  />
                </mask>
                <g mask='url(#mask0_1698_13178)'>
                  <path
                    d='M-0.375 -0.0100098H13.625V13.99H-0.375V-0.0100098Z'
                    fill='#6B7280'
                  />
                </g>
              </svg>
              <p className={'text-xs'}>{health_worker.organization_name}</p>
            </div>
            <p
              className={'text-xs font-medium text-purple-600 flex flex-row items-center'}
            >
              <DoctorIcon className='w-4 h-4 mr-1' />
              {health_worker.specialty}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
