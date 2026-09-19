import { useSignal } from '@preact/signals'
import { FindingSiteWithMaybeRecords, SnomedWarningSignSearchResult, WarningSignWithMaybeRecord } from '../../types.ts'
import { searchRouteFor } from './shared.ts'
import useAsyncSearch from '../useAsyncSearch.tsx'
import WarningSignsInnerContent from './InnerContent.tsx'

export default function WarningSigns({
  search_route,
  post_route,
  rules_dry_run_route,
  none_of_the_above_findings_route,
  warning_signs,
  finding_sites,
}: {
  search_route: string
  post_route: string
  rules_dry_run_route: string
  none_of_the_above_findings_route: string
  warning_signs: WarningSignWithMaybeRecord[]
  finding_sites: FindingSiteWithMaybeRecords[]
}) {
  const search_results = useSignal<null | WarningSignWithMaybeRecord[]>(null)
  const finding_site = useSignal<null | FindingSiteWithMaybeRecords>(null)

  // The hook searches afresh when its route changes, so choosing a site re-runs any query under it
  const snomed_warning_signs_async_search = useAsyncSearch<SnomedWarningSignSearchResult>({
    search_route: searchRouteFor(search_route, finding_site.value),
    skip_blank_search: true,
    onSearchResults(results) {
      // TODO one day we'll type results from jsonSearchHandler
      search_results.value = results.pages.flatMap((page) => page.results) as unknown as SnomedWarningSignSearchResult[]
    },
    onQueryBlanked() {
      search_results.value = null
    },
  })

  return (
    <WarningSignsInnerContent
      post_route={post_route}
      rules_dry_run_route={rules_dry_run_route}
      none_of_the_above_findings_route={none_of_the_above_findings_route}
      warning_signs={warning_signs}
      finding_sites={finding_sites}
      finding_site={finding_site}
      search_results={search_results}
      snomed_warning_signs_async_search={snomed_warning_signs_async_search}
    />
  )
}
