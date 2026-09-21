import { useSignal } from '@preact/signals'
import { getConsultationWarningSignsData } from '../../../shared/consultation-tutorial/mock-data.ts'
import type { AsyncSearchHookResult, SnomedWarningSignSearchResult, WarningSignWithMaybeRecord } from '../../../types.ts'
import WarningSignsInnerContent from '../../WarningSigns/InnerContent.tsx'

export function TriageWarningSignsStep() {
  const search_results = useSignal<null | WarningSignWithMaybeRecord[]>(null)

  const mock_async_search: AsyncSearchHookResult<SnomedWarningSignSearchResult> = {
    loading: false,
    search: {
      query: '',
      page: 1,
      delay: null,
      active_request: null,
      pages: [],
      has_next_page: false,
    },
    search_route: '/consultation-tutorial/unused',
    results: [],
    setQuery: () => {
      return
    },
  }

  const async_search = useSignal(mock_async_search)

  return (
    <WarningSignsInnerContent
      warning_signs={getConsultationWarningSignsData()}
      search_results={search_results}
      snomed_warning_signs_async_search={async_search.value}
    />
  )
}
