import { ComponentChild } from 'preact'
import { practitioner_home_page_nav_links } from './home_page_links/health_worker.ts'
import { HealthWorkerDefaultTop } from './Top.tsx'
import { GenericSidebar } from './Generic.tsx'

export type HealthWorkerHomePageSidebarProps = {
  route: string
  params: Record<string, string>
  urlSearchParams: URLSearchParams
  bottom?: ComponentChild
  tutorial?: boolean
}

export function HealthWorkerHomePageSidebar(
  { route, params, urlSearchParams, bottom, tutorial }: HealthWorkerHomePageSidebarProps,
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      urlSearchParams={urlSearchParams}
      nav_links={practitioner_home_page_nav_links}
      top={<HealthWorkerDefaultTop />}
      bottom={bottom}
      tutorial={tutorial}
    />
  )
}
