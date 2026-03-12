// =============================================================================
// FILE: /islands/tutorial/steps/WarningSignsStep.tsx
// Warning signs step wrapper for tutorial
// =============================================================================

import { useSignal } from '@preact/signals'
import { MIGRAINE_SEARCH_RESPONSE, TUTORIAL_WARNING_SIGNS } from '../../../shared/tutorial/mock-data.ts'
import { AsyncSearchHookResult, SnomedConceptSearchResult, WarningSignWithMaybeRecord } from '../../../types.ts'
import WarningSignsInnerContent from '../../WarningSigns/InnerContent.tsx'
import { useEffect } from 'preact/hooks'

export function WarningSignsStep() {
  const search_results = useSignal<null | WarningSignWithMaybeRecord[]>(null)

  const initial_search = {
    query: '',
    page: 1,
    delay: null,
    active_request: null,
    pages: [],
    has_next_page: false,
  }
  const initial_async_search: AsyncSearchHookResult<SnomedConceptSearchResult> = {
    loading: false,
    search: initial_search,
    search_route: '/tutorial/unused',
    results: [],
    setQuery: (_query: string) => {
      return
    },
  }

  const mock_snomed_warning_signs_async_search = useSignal<AsyncSearchHookResult<SnomedConceptSearchResult>>(initial_async_search)

  useEffect(() => {
    function searchMigraineListener() {
      search_results.value = MIGRAINE_SEARCH_RESPONSE.results
      mock_snomed_warning_signs_async_search.value = {
        ...initial_async_search,
        search: {
          query: 'migraine',
          page: 1,
          delay: null,
          active_request: null,
          pages: [MIGRAINE_SEARCH_RESPONSE],
          has_next_page: false,
        },
      }
    }
    function clearSearchListener() {
      search_results.value = null
      mock_snomed_warning_signs_async_search.value = initial_async_search
    }
    globalThis.addEventListener('@@triage-tutorial-search-migraine', searchMigraineListener)
    globalThis.addEventListener('@@triage-tutorial-clear-search', clearSearchListener)

    return () => {
      globalThis.removeEventListener('@@triage-tutorial-search-migraine', searchMigraineListener)
      globalThis.removeEventListener('@@triage-tutorial-clear-search', clearSearchListener)
    }
  })

  return (
    <WarningSignsInnerContent
      warning_signs={TUTORIAL_WARNING_SIGNS}
      search_results={search_results}
      snomed_warning_signs_async_search={mock_snomed_warning_signs_async_search.value}
    />
  )
}
