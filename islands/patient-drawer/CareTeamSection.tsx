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
        health_worker.health_worker_id &&
        (
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
              <div className={'flex flex-row items-center text-sm'}>
                <svg
                  width='14'
                  height='15'
                  viewBox='0 0 14 15'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className={'mr-2'}
                >
                  <path
                    d='M6.42205 12.7499H5.60422C3.51297 12.7499 2.46764 12.7499 1.8178 12.0878C1.16797 11.4258 1.16797 10.36 1.16797 8.22909C1.16797 6.09817 1.16797 5.03242 1.8178 4.37034C2.46764 3.70825 3.51297 3.70825 5.60422 3.70825H7.82264C9.91389 3.70825 10.9598 3.70825 11.6096 4.37034C12.1096 4.87959 12.2245 5.628 12.2513 6.91659'
                    stroke='#6B7280'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                  />
                  <path
                    d='M10.9984 11.4958L10.2109 10.9708V9.65829M9.33594 3.70829L9.2776 3.52746C8.98944 2.62913 8.84477 2.17996 8.50119 1.92329C8.15702 1.66663 7.70085 1.66663 6.78794 1.66663H6.63394C5.72102 1.66663 5.26427 1.66663 4.92069 1.92329C4.57652 2.17996 4.43244 2.62913 4.14369 3.52746L4.08594 3.70829M7.58594 10.7083C7.58594 11.053 7.65383 11.3944 7.78575 11.7128C7.91767 12.0313 8.11103 12.3207 8.35478 12.5644C8.59854 12.8082 8.88791 13.0016 9.20639 13.1335C9.52487 13.2654 9.86622 13.3333 10.2109 13.3333C10.5557 13.3333 10.897 13.2654 11.2155 13.1335C11.534 13.0016 11.8233 12.8082 12.0671 12.5644C12.3108 12.3207 12.5042 12.0313 12.6361 11.7128C12.768 11.3944 12.8359 11.053 12.8359 10.7083C12.8359 10.0121 12.5594 9.34442 12.0671 8.85214C11.5748 8.35985 10.9071 8.08329 10.2109 8.08329C9.51474 8.08329 8.84707 8.35985 8.35478 8.85214C7.8625 9.34442 7.58594 10.0121 7.58594 10.7083Z'
                    stroke='#6B7280'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                  />
                </svg>
                <p className='text-xs'>{health_worker.specialty}</p>
              </div>
              <div className={'flex flex-row items-center text-sm my-2'}>
                <svg
                  viewBox='0 0 13 14'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-5 h-4 mr-1'
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
                <DoctorIcon className='w-4 h-4 mr-2' />
                {health_worker.specialty}
              </p>
            </div>
          </div>
        )
      ))}
    </div>
  )
}
