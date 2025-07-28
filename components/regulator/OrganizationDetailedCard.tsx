import { Organization } from '../../types.ts'
import { Button } from '../library/Button.tsx'

type OrganizationDetailedCardProps = {
  organization: Organization & {
    id: string
    name: string
    category: string | null
    address: string | null
    departments: {
      id: string
      name: string
      accepts_patients: boolean
    }[]
  }
  country: string
}

export function OrganizationDetailedCard({
  organization,
  country,
}: OrganizationDetailedCardProps) {
  return (
    <div className='bg-white shadow sm:rounded-lg'>
      <div className='px-4 py-6 sm:px-6'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='text-base font-semibold leading-7 text-gray-900'>
              {organization.name}
            </h3>
            {organization.category && (
              <p className='mt-1 text-sm leading-6 text-gray-600'>
                {organization.category}
              </p>
            )}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              href={`/regulator/${country}/organizations/${organization.id}/edit`}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
      <div className='border-t border-gray-100'>
        <dl className='divide-y divide-gray-100'>
          <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium leading-6 text-gray-900'>
              Organization Name
            </dt>
            <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
              {organization.name}
            </dd>
          </div>

          {organization.category && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium leading-6 text-gray-900'>
                Category
              </dt>
              <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
                {organization.category}
              </dd>
            </div>
          )}

          {organization.address && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium leading-6 text-gray-900'>
                Address
              </dt>
              <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
                {organization.address}
              </dd>
            </div>
          )}

          {organization.departments && organization.departments.length > 0 && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium leading-6 text-gray-900'>
                Departments
              </dt>
              <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
                <div className='space-y-2'>
                  {organization.departments.map((dept) => (
                    <div key={dept.id} className='flex items-center gap-2'>
                      <span className='font-medium'>{dept.name}</span>
                      {dept.accepts_patients && (
                        <span className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full'>
                          Accepts Patients
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
