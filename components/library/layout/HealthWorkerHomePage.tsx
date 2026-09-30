import { ComponentChild, ComponentChildren } from 'preact'
import type { Priority } from '../../../shared/priorities.ts'
import type { RenderedEmployee } from '../../../types.ts'
import HealthWorkerContentsWithSidebarAndDrawer from './HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { HealthWorkerSidebarBottom } from '../HealthWorkerSidebarBottom.tsx'
import { HealthWorkerHomePageSidebar } from '../sidebar/HealthWorkerHomePage.tsx'
import { employeeDisplay } from '../../../util/healthWorkerDisplay.ts'

/**
 * Standalone layout component for health worker home pages.
 * Used by tutorial and other contexts that don't have a LoggedInHealthWorkerContext.
 */
export function HealthWorkerHomePageLayout({
  title,
  url,
  route,
  params,
  employee,
  drawer,
  footer,
  tutorial,
  health_worker_notification_count = 0,
  health_worker_notification_priority = null,
  children,
}: {
  title: string
  url: URL
  route: string
  params: Record<string, string>
  employee: RenderedEmployee
  drawer?: ComponentChild
  footer: ComponentChild
  tutorial?: boolean
  health_worker_notification_count?: number
  health_worker_notification_priority?: Priority | null
  children: ComponentChildren
}) {
  const account = employeeDisplay(employee)
  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      title={title}
      url={url}
      avatar_url={account.avatar_url}
      mobile_account={{
        avatar_url: account.avatar_url,
        display_name: account.display_name,
        description: account.description,
        profile_href: tutorial ? '#' : `/app/organizations/${employee.organization_id}/employees/${employee.id}`,
      }}
      sidebar={
        <div className='hidden h-full md:block'>
          <HealthWorkerHomePageSidebar
            route={route}
            params={params}
            urlSearchParams={url.searchParams}
            health_worker_notification_count={health_worker_notification_count}
            health_worker_notification_priority={health_worker_notification_priority}
            bottom={<HealthWorkerSidebarBottom employee={employee} />}
            tutorial={tutorial}
          />
        </div>
      }
      footer={footer}
      drawer={drawer}
    >
      <div className='px-4'>{children}</div>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
