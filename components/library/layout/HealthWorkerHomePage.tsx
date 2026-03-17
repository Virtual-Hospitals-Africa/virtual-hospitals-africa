import { ComponentChild, ComponentChildren } from 'preact'
import type { RenderedEmployee } from '../../../types.ts'
import HealthWorkerContentsWithSidebarAndDrawer from './HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { HealthWorkerHomePageSidebar } from '../sidebar/Sidebar.tsx'
import { HealthWorkerSidebarBottom } from '../HealthWorkerSidebarBottom.tsx'

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
  tutorial,
  children,
}: {
  title: string
  url: URL
  route: string
  params: Record<string, string>
  employee: RenderedEmployee
  drawer?: ComponentChild
  tutorial?: boolean
  children: ComponentChildren
}) {
  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      title={title}
      url={url}
      sidebar={
        <HealthWorkerHomePageSidebar
          route={route}
          params={params}
          urlSearchParams={url.searchParams}
          bottom={<HealthWorkerSidebarBottom employee={employee} />}
          tutorial={tutorial}
        />
      }
      drawer={drawer}
    >
      <div className='px-4'>{children}</div>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
