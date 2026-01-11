import { RenderedPatient } from '../../types.ts'
import { PaperClipIcon } from '../library/icons/heroicons/outline.tsx'

type PatientDetailedCardProps = {
  patient: RenderedPatient
}

export default function PatientDetailedCard(
  { patient }: PatientDetailedCardProps,
) {
  return (
    <div className='px-4 py-6 bg-gray-300 border-2 border-gray-300 rounded-md'>
      <div className='px-4 sm:px-0'>
        <h3 className='text-base font-semibold leading-7 text-gray-900'>
          Patient Registration
        </h3>
        <p className='max-w-2xl mt-1 text-sm leading-6 text-gray-500'>
          Personal details and application.
        </p>
      </div>
      <div className='mt-6'>
        <dl className='grid grid-cols-1 sm:grid-cols-2'>
          <div className='px-4 py-6 border-t border-gray-100 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Full name
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {patient.name}
            </dd>
          </div>
          <div className='px-4 py-6 border-t border-gray-100 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Application for
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              Backend Developer
            </dd>
          </div>
          {
            /* <div className='px-4 py-6 border-t border-gray-100 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Phone number
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              {patient.phone_number}
            </dd>
          </div> */
          }
          <div className='px-4 py-6 border-t border-gray-100 sm:col-span-1 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Salary expectation
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              $120,000
            </dd>
          </div>
          <div className='px-4 py-6 border-t border-gray-100 sm:col-span-2 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              About
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
              Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id
              mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
            </dd>
          </div>
          <div className='px-4 py-6 border-t border-gray-100 sm:col-span-2 sm:px-0'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Attachments
            </dt>
            <dd className='mt-2 text-sm text-gray-900'>
              <ul
                role='list'
                className='border border-gray-200 divide-y divide-gray-100 rounded-md'
              >
                <li className='flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6'>
                  <div className='flex items-center flex-1 w-0'>
                    <PaperClipIcon
                      className='flex-shrink-0 w-5 h-5 text-gray-400'
                      aria-hidden='true'
                    />
                    <div className='flex flex-1 min-w-0 gap-2 ml-4'>
                      <span className='font-medium truncate'>
                        resume_back_end_developer.pdf
                      </span>
                      <span className='flex-shrink-0 text-gray-400'>2.4mb</span>
                    </div>
                  </div>
                  <div className='flex-shrink-0 ml-4'>
                    <a
                      href='#'
                      className='font-medium text-indigo-600 hover:text-indigo-500'
                    >
                      Download
                    </a>
                  </div>
                </li>
                <li className='flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6'>
                  <div className='flex items-center flex-1 w-0'>
                    <PaperClipIcon
                      className='flex-shrink-0 w-5 h-5 text-gray-400'
                      aria-hidden='true'
                    />
                    <div className='flex flex-1 min-w-0 gap-2 ml-4'>
                      <span className='font-medium truncate'>
                        coverletter_back_end_developer.pdf
                      </span>
                      <span className='flex-shrink-0 text-gray-400'>4.5mb</span>
                    </div>
                  </div>
                  <div className='flex-shrink-0 ml-4'>
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
