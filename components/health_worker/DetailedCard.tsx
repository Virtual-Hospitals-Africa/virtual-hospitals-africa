import * as employment from '../../db/models/employment.ts'
import { HealthWorker, NurseRegistrationDetails } from '../../types.ts'

type HealthWorkerDetailedCardProps = {
  employee_positions: employment.HealthWorkerWithRegistrationState[]
  healthWorker: HealthWorker
  nurseRegistrationDetails: NurseRegistrationDetails
}

export default function HealthWorkerDetailedCard(
  { employee_positions, healthWorker, nurseRegistrationDetails }:
    HealthWorkerDetailedCardProps,
) {
  return (
    <div className='py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300'>
      <div className='mt-6'>
        <dl className='grid grid-cols-4 sm:grid-cols-4'>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              First Name
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {healthWorker.name.split(' ')[0]}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Middle name
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {healthWorker.name.split(' ').length > 2
                ? healthWorker.name.split(' ').slice(1, -1).join(' ')
                : ''} 
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Last Name
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
            {healthWorker.name.split(' ').length > 1
                ? healthWorker.name.split(' ').at(-1)
                : ''} 
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Gender
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {nurseRegistrationDetails.gender}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Nurse Council's Number
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {nurseRegistrationDetails.ncz_registration_number}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Clinic
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {}
            </dd>
          </div>
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Virtual Hospitals
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {}
            </dd>
          </div>

          
          <div className='border-t border-gray-100 px-4 py-6 sm:col-span-4 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Documents
            </dt>
            <dd className='mt-2 text-sm text-gray-900'>
              <ul
                role='list'
                className='divide-y divide-gray-100 rounded-md border border-gray-200'
              >
                <li className='flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6'>
                  <div className='flex w-0 flex-1 items-center'>
                    <div className='ml-4 flex min-w-0 flex-1 gap-2'>
                      <span className='truncate font-medium'>
                        National Identification Card
                      </span>
                      <span className='flex-shrink-0 text-gray-400'>2.4mb</span>
                    </div>
                  </div>
                  <div className='ml-4 flex-shrink-0'>
                    <a
                      href='#'
                      className='font-medium text-indigo-600 hover:text-indigo-500'
                    >
                      Download
                    </a>
                  </div>
                </li>
                <li className='flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6'>
                  <div className='flex w-0 flex-1 items-center'>
                    <div className='ml-4 flex min-w-0 flex-1 gap-2'>
                      <span className='truncate font-medium'>
                        Practicing Identification
                      </span>
                      <span className='flex-shrink-0 text-gray-400'>4.5mb</span>
                    </div>
                  </div>
                  <div className='ml-4 flex-shrink-0'>
                    <a
                      href='#'
                      className='font-medium text-indigo-600 hover:text-indigo-500'
                    >
                      Download
                    </a>
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
