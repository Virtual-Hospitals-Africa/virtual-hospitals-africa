import { GenericSidebar } from './Generic.tsx'
import { regulator_home_page_nav_links } from './home_page_links/regulator.ts'
import { RegulatorDefaultTop } from './tops.tsx'

export function RegulatorHomePageSidebar(
  { route, params, urlSearchParams }: {
    route: string
    params: Record<string, string>
    urlSearchParams: URLSearchParams
  },
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      urlSearchParams={urlSearchParams}
      nav_links={regulator_home_page_nav_links}
      top={RegulatorDefaultTop}
    />
  )
}
