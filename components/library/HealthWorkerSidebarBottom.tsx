import { RenderedEmployee } from '../../types.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import { EmergencyCallButton } from './EmergencyCallButton.tsx'
import { HealthWorker } from './HealthWorker.tsx'

export function HealthWorkerSidebarBottom({ employee }: {
  employee: RenderedEmployee
}) {
  return (
    <div className='space-y-3'>
      <EmergencyCallButton organization_id={employee.organization_id} />

      <HealthWorker
        {...employeeDisplay(employee)}
        menu_items={[
          {
            label: 'View Profile',
            href:
              `/app/organizations/${employee.organization_id}/employees/${employee.id}`,
          },
          { label: 'Sign Out', href: '/app/logout' },
        ]}
      />
    </div>
  )
}
