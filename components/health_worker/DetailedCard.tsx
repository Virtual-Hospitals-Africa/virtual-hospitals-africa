import { EmployeeInfo } from '../../types.ts'
import { ArrowDownTrayIcon } from '../library/icons/heroicons/outline.tsx'

type HealthWorkerDetailedCardProps = {
  employee: EmployeeInfo
}

function ImageDownload(props: { name: string; href: string }) {
  return (
    <li className='py-4 pl-4 pr-5 text-sm leading-6'>
      <div className='flex items-center justify-between'>
        <div className='ml-4 flex min-w-0 flex-1 gap-2'>
          <span className='truncate font-bold'>
            {props.name}
          </span>
        </div>

        <div className='ml-4 flex-shrink-0'>
          <a
            href={props.href}
            className='font-bold flex text-indigo-600 hover:text-indigo-500'
            target='_blank'
          >
            <ArrowDownTrayIcon
              className='mr-1 h-5 w-5 flex-shrink-0 text-gray-400'
              aria-hidden='true'
            />Download
          </a>
        </div>
      </div>
      <div className='flex justify-center mt-2 bg-gray-300 p-2 w-full'>
        <img
          src={props.href}
          alt='Download Preview'
          className='mt-2 w-full max-w-xs mx-auto'
        />
      </div>
    </li>
  )
}

export default function HealthWorkerDetailedCard(
  { employee }: HealthWorkerDetailedCardProps,
) {
  return (
    <>
      <div>
        <div class='mt-6'>
          <dl class='grid grid-cols-1 sm:grid-cols-4'>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                First Name
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.name.split(' ')[0]}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Middle Name
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.name.split(' ').length > 2
                  ? employee.name.split(' ').slice(1, -1).join(' ')
                  : 'N/A'}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Last Name
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.name.split(' ').at(-1)}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Gender
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.gender}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Date of Birth
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.date_of_birth ? employee.date_of_birth : 'TBD'}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                National ID Number
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.national_id_number}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Email
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.email}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Phone Number
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.mobile_number || 'N/A'}
              </dd>
            </div>
            <div class='py-6 sm:col-span-4 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Address
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.address || 'N/A'}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Specialty
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.specialty
                  ? employee.specialty.replaceAll('_', ' ')
                  : 'N/A'}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Date of First Practice
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.date_of_first_practice || 'TBD'}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Nurse's Council Number
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.ncz_registration_number}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                {employee.employment.length > 1 ? 'Facilities' : 'Facility'}
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                <ul>
                  {employee.employment.map((item, index) => (
                    <li key={index}>
                      <div>
                        {item.facility_name}
                      </div>
                      <div className='pl-4 text-xs'>
                        {item.address ? item.address : 'N/A'}
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-3 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Virtual Hospitals
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {'TBD'}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-4 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Documents
              </dt>
              {employee.documents.length > 0
                ? (
                  <dd className='mt-2 text-sm text-gray-900'>
                    <ul
                      role='list'
                      className='mx-auto divide-y divide-gray-100 rounded-md border border-gray-200'
                      style={{ width: '50%' }}
                    >
                      {employee.documents.map((document, index) => (
                        <ImageDownload {...document} />
                      ))}
                    </ul>
                  </dd>
                )
                : (
                  <dt class='mt-2 text-sm leading-6 text-gray-900'>
                    No Documents
                  </dt>
                )}
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}
