import { useSignal } from '@preact/signals'
import { SnomedWarningSignSearchResult, WarningSignWithMaybeRecord } from '../../types.ts'
import useAsyncSearch from '../useAsyncSearch.tsx'
import WarningSignsInnerContent from './InnerContent.tsx'

export default function WarningSigns({
  search_route,
  post_route,
  warning_signs,
}: {
  search_route: string
  post_route: string
  warning_signs: WarningSignWithMaybeRecord[]
}) {
  const search_results = useSignal<null | WarningSignWithMaybeRecord[]>(null)

  const snomed_warning_signs_async_search = useAsyncSearch<SnomedWarningSignSearchResult>({
    search_route,
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
      warning_signs={warning_signs}
      search_results={search_results}
      snomed_warning_signs_async_search={snomed_warning_signs_async_search}
    />
  )
}
