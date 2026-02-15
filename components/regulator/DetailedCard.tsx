import { RenderedCountryHealthWorker } from '../../types.ts'

export default function health_workerDetailedCard({
  health_worker,
}: {
  health_worker: RenderedCountryHealthWorker
}) {
  return (
    <>
      <div>
        <div class='mt-6'>
          <dl class='grid grid-cols-1 sm:grid-cols-4'>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                First Names
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {health_worker.first_names}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Surname
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {health_worker.surname ||
                  'N/A'}
              </dd>
            </div>
            {health_worker.licences.map((licence) => (
              <>
                <div class=' py-6 sm:col-span-1 sm:px-0'>
                  <dt class='text-sm font-bold leading-6 text-gray-900'>
                    Profession
                  </dt>
                  <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                    {licence.profession}
                  </dd>
                </div>
                <div class='py-6 sm:col-span-1 sm:px-0'>
                  <dt class='text-sm font-bold leading-6 text-gray-900'>
                    Licence Number
                  </dt>
                  <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                    {licence.licence_number}
                  </dd>
                </div>
                <div class='py-6 sm:col-span-1 sm:px-0'>
                  <dt class='text-sm font-bold leading-6 text-gray-900'>
                    Address
                  </dt>
                  <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                    {licence.address.formatted}
                  </dd>
                </div>
              </>
            ))}
            {health_worker.organizations.map((organization) => (
              <>
                <div class='border-t border-gray-100 py-6 sm:col-span-2 sm:px-0'>
                  <dt class='text-sm font-bold leading-6 text-gray-900'>
                    Organization
                  </dt>
                  <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                    <a
                      className='text-indigo-600 hover:text-indigo-900'
                      href={organization.hrefs.regulator_view}
                    >
                      {organization.name}
                    </a>
                  </dd>
                </div>
                <div class='sm:border-t border-gray-100 py-6 sm:col-span-2 sm:px-0'>
                  <dt class='text-sm font-bold leading-6 text-gray-900'>
                    Role
                  </dt>
                  <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                    {organization.profession}
                  </dd>
                </div>
              </>
            ))}
          </dl>
        </div>
      </div>
    </>
  )
}
