import * as employment from '../../db/models/employment.ts'
import { HealthWorker, NurseRegistrationDetails, Specialities } from '../../types.ts'
import { DownloadIcon } from '../library/icons/heroicons.tsx'

type HealthWorkerDetailedCardProps = {
  employee_positions: employment.HealthWorkerWithRegistrationState[]
  healthWorker: HealthWorker
  nurseRegistrationDetails: NurseRegistrationDetails
  specialities: Specialities[]
}

export default function HealthWorkerDetailedCard(
  { employee_positions, healthWorker, nurseRegistrationDetails, specialities }:
    HealthWorkerDetailedCardProps,
) {
  return (
    <div>
      <div className='py-6 px-4 rounded-md border-2 border-gray-200 bg-gray-200'>
        <dl className='grid grid-cols-4 sm:grid-cols-4'>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              First Name
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {healthWorker.name.split(' ')[0]}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Middle Name
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {healthWorker.name.split(' ').length > 2
                ? healthWorker.name.split(' ').slice(1, -1).join(' ')
                : 'N/A'}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Last Name
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {healthWorker.name.split(' ').length > 1
                ? healthWorker.name.split(' ').at(-1)
                : 'N/A'}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Gender
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {nurseRegistrationDetails.gender}
            </dd>
          </div>
          <div className='px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Date of Birth
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {'TBD'}
            </dd>
          </div>
          <div className='px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              National ID Number
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {nurseRegistrationDetails.national_id}
            </dd>
          </div>
          <div className='px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Email
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {healthWorker.email ? healthWorker.email : 'N/A'}
            </dd>
          </div>
          <div className='px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Phone Number
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {nurseRegistrationDetails.mobile_number.substring(0, 3) + '-' +
                nurseRegistrationDetails.mobile_number.substring(3, 6) + '-' +
                nurseRegistrationDetails.mobile_number.substring(6)}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Specialty
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              <ul>
                {specialities.map((item, index) => (
                  <li key={index}>{item.speciality.replaceAll('_', ' ')}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Date of First Practice
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {nurseRegistrationDetails.date_of_first_practice.toLocaleString()
                .split(',')[0]}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Nurse Council's Number
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {nurseRegistrationDetails.ncz_registration_number}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Clinic
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {'TBD'}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-3 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Virtual Hospitals
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {'TBD'}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-4 sm:px-0'>
            <dt className='text-sm font-bold leading-6 text-gray-900'>
              Documents
            </dt>
            <dd className='mt-2 text-sm text-gray-900'>
              <ul
                role='list'
                className='mx-auto divide-y divide-gray-100 rounded-md border border-gray-200'
                style={{ width: '50%' }}
              >
                <li className='py-4 pl-4 pr-5 text-sm leading-6'>
                  <div className='flex items-center justify-between'>
                    <div className='ml-4 flex min-w-0 flex-1 gap-2'>
                      <span className='truncate font-medium'>
                        National Identification Card
                      </span>
                    </div>

                    <div className='ml-4 flex-shrink-0'>
                      <a
                        href='#'
                        className='font-medium flex text-indigo-600 hover:text-indigo-500'
                      >
                        <DownloadIcon
                          className='mr-1 h-5 w-5 flex-shrink-0 text-gray-400'
                          aria-hidden='true'
                        />Download
                      </a>
                    </div>
                  </div>
                  <div className='flex justify-center mt-2 bg-gray-300 p-2 w-full'>
                    <img
                      src={''}
                      alt='Download Preview'
                      className='mt-2 w-full max-w-xs mx-auto'
                    />
                  </div>
                </li>
                <li className='py-4 pl-4 pr-5 text-sm leading-6'>
                  <div className='flex items-center justify-between'>
                    <div className='ml-4 flex min-w-0 flex-1 gap-2'>
                      <span className='truncate font-medium'>
                        Practicing Identification
                      </span>
                    </div>

                    <div className='ml-4 flex-shrink-0'>
                      <a
                        href='#'
                        className='font-medium flex text-indigo-600 hover:text-indigo-500'
                      >
                        <DownloadIcon
                          className='mr-1 h-5 w-5 flex-shrink-0 text-gray-400'
                          aria-hidden='true'
                        />
                        Download
                      </a>
                    </div>
                  </div>
                  <div className='flex justify-center mt-2 bg-gray-300 p-2 w-full'>
                    <img
                      src={''}
                      alt='Download Preview'
                      className='mt-2 w-full max-w-xs mx-auto'
                    />
                  </div>
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
