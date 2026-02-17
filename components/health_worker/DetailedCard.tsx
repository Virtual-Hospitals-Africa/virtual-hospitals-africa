import type { RenderedEmployee } from '../../types.ts'

type HealthWorkerDetailedCardProps = {
  employee: RenderedEmployee
}

export default function HealthWorkerDetailedCard(
  { employee }: HealthWorkerDetailedCardProps,
) {
  const all_licences = employee.organizations.flatMap((org) => org.active_licences)

  return (
    <>
      <div>
        <div class='mt-6'>
          <dl class='grid grid-cols-1 sm:grid-cols-4'>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                First Name(s)
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.first_names}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Surname
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.surname}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Gender
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.demographics.gender || 'N/A'}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Date of Birth
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.demographics.date_of_birth ? String(employee.demographics.date_of_birth) : 'N/A'}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Email
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.email || 'N/A'}
              </dd>
            </div>
            <div class='py-6 sm:col-span-1 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Phone Number
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.contact_details.mobile_phone_number || 'N/A'}
              </dd>
            </div>
            <div class='py-6 sm:col-span-2 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Address
              </dt>
              <dd class='mt-1 text-sm leading-6 text-gray-700 sm:mt-2'>
                {employee.contact_details.address?.formatted || 'N/A'}
              </dd>
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-4 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Licences
              </dt>
              {all_licences.length > 0
                ? (
                  <dd class='mt-2 text-sm text-gray-900'>
                    <table class='min-w-full divide-y divide-gray-300'>
                      <thead>
                        <tr>
                          <th class='py-2 pr-3 text-left text-sm font-semibold text-gray-900'>Agency</th>
                          <th class='py-2 pr-3 text-left text-sm font-semibold text-gray-900'>Licence Number</th>
                          <th class='py-2 pr-3 text-left text-sm font-semibold text-gray-900'>Profession</th>
                          <th class='py-2 pr-3 text-left text-sm font-semibold text-gray-900'>Specialty</th>
                          <th class='py-2 pr-3 text-left text-sm font-semibold text-gray-900'>Expiry</th>
                        </tr>
                      </thead>
                      <tbody class='divide-y divide-gray-200'>
                        {all_licences.map((licence) => (
                          <tr key={licence.licence_number}>
                            <td class='py-2 pr-3 text-sm text-gray-700'>{licence.regulatory_agency.acronym} ({licence.regulatory_agency.country})</td>
                            <td class='py-2 pr-3 text-sm text-gray-700'>{licence.licence_number}</td>
                            <td class='py-2 pr-3 text-sm text-gray-700'>{licence.profession}</td>
                            <td class='py-2 pr-3 text-sm text-gray-700'>{licence.specialty?.replaceAll('_', ' ') || 'N/A'}</td>
                            <td class='py-2 pr-3 text-sm text-gray-700'>{String(licence.expiry_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </dd>
                )
                : (
                  <dd class='mt-2 text-sm leading-6 text-gray-700'>
                    No active licences
                  </dd>
                )}
            </div>
            <div class='border-t border-gray-100 px-4 py-6 sm:col-span-4 sm:px-0'>
              <dt class='text-sm font-bold leading-6 text-gray-900'>
                Organizations
              </dt>
              {employee.organizations.length > 0
                ? (
                  <dd class='mt-2 text-sm text-gray-900'>
                    {employee.organizations.map((org) => (
                      <div key={org.id} class='mb-2'>
                        <div class='font-medium'>{org.name}</div>
                        <div class='pl-4 text-xs text-gray-500'>
                          {org.formatted_address || 'N/A'}
                        </div>
                        <div class='pl-4 text-xs text-gray-500'>
                          Role: {org.role}
                        </div>
                      </div>
                    ))}
                  </dd>
                )
                : (
                  <dd class='mt-2 text-sm leading-6 text-gray-700'>
                    No organizations
                  </dd>
                )}
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}
