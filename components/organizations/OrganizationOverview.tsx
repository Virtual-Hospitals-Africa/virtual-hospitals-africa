import type { RenderedOrganizationWithDepartments } from '../../types.ts'
import Badge from '../library/Badge.tsx'

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div class='py-3 sm:grid sm:grid-cols-3 sm:gap-4'>
      <dt class='text-sm font-medium text-gray-500'>{label}</dt>
      <dd class='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>{value}</dd>
    </div>
  )
}

export default function OrganizationOverview({ organization }: { organization: RenderedOrganizationWithDepartments }) {
  return (
    <div class='mt-4'>
      <div class='overflow-hidden bg-white shadow sm:rounded-lg'>
        <div class='px-4 py-5 sm:px-6'>
          <h3 class='text-lg font-medium leading-6 text-gray-900'>{organization.name}</h3>
          {organization.formatted_address && <p class='mt-1 text-sm text-gray-500'>{organization.formatted_address}</p>}
          <div class='mt-2 flex gap-2'>
            {organization.is_test && <Badge color='purple' content='Test Organization' />}
            {organization.inactive_reason && <Badge color='red' content={`Inactive: ${organization.inactive_reason}`} />}
            {organization.category && <Badge color='blue' content={organization.category} />}
          </div>
        </div>
        <div class='border-t border-gray-200 px-4 py-5 sm:px-6'>
          <dl class='divide-y divide-gray-200'>
            <Detail label='Category' value={organization.category} />
            <Detail label='Country' value={organization.country} />
            <Detail label='Ownership' value={organization.ownership} />
            <Detail label='Address' value={organization.formatted_address} />
            {organization.departments.length > 0 && (
              <div class='py-3 sm:grid sm:grid-cols-3 sm:gap-4'>
                <dt class='text-sm font-medium text-gray-500'>Departments</dt>
                <dd class='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                  <div class='flex flex-wrap gap-2'>
                    {organization.departments.map((dept) => <Badge key={dept.id} color='blue' content={dept.name} />)}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
