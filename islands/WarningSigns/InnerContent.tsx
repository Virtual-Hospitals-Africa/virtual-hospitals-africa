import { computed, Signal, useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { MagnifyingGlassIcon } from '../../components/library/icons/heroicons/mini.tsx'
import {
  AsyncSearchHookResult,
  Existence,
  FindingSiteWithMaybeRecords,
  RecordedFinding,
  SnomedWarningSignSearchResult,
  WarningSignWithMaybeRecord,
} from '../../types.ts'
import compactMap from '../../util/compactMap.ts'
import { groupBy } from '../../util/groupBy.ts'
import Search from '../Search.tsx'
import { SelectedChips } from '../SelectedRecordChip.tsx'
import { WarningSignsHiddenInputs } from './HiddenInputs.tsx'
import { WarningSignsPriorityTable } from './PriorityTable.tsx'
import { findRecorded, signOf, signsToDisplay, SignWithRecorded, tableCategories, uniqueIdentifier } from './shared.ts'
import { FindingSiteFilter } from './FindingSiteFilter.tsx'
import { warningSignsFormValues } from './form_values.ts'
import { asEntered, openFinding } from '../finding/metadata.ts'
import { useRecordedFindings } from '../finding/useRecordedFindings.ts'
import { addFindingEventListener } from '../../shared/finding_events.ts'
import { normalized } from '../FollowUps/follow_ups.ts'

/*
  Lists the signs and keeps track of which are recorded. Checking one asks the page's finding
  recorder to open the modal (islands/finding/Recorder.tsx); what becomes of it arrives back
  through the finding events, as do findings recorded from the follow ups panel, so that the
  page vouches for all of them when submitted (shared/finding_events.ts).
*/
export default function WarningSignsInnerContent({
  search_results,
  snomed_warning_signs_async_search,
  warning_signs,
  finding_sites,
  finding_site,
}: {
  search_results: Signal<null | WarningSignWithMaybeRecord[]>
  snomed_warning_signs_async_search: AsyncSearchHookResult<SnomedWarningSignSearchResult>
  warning_signs: WarningSignWithMaybeRecord[]
  finding_sites: FindingSiteWithMaybeRecords[] // The body sites the page can be filtered by, none for children
  finding_site: Signal<null | FindingSiteWithMaybeRecords>
}) {
  const recorded = useRecordedFindings(() =>
    compactMap(warning_signs, (sign): RecordedFinding | false =>
      sign.existing_record?.existence === 'Yes' && {
        key: uniqueIdentifier(sign),
        entered: sign.existing_record.augmented || asEntered(sign),
        record_id: sign.existing_record.id,
        saving: false,
      })
  )

  // Findings recorded as absent on this visit by a round of "none of the above", by normalised
  // s_expression, so that checking a sign for one of them overturns that record
  const absent_records = useSignal(new Map<string, { id: string }>())
  useEffect(() =>
    addFindingEventListener('findings:recorded-absent', ({ records }) => {
      absent_records.value = new Map([
        ...absent_records.value,
        ...records.map(({ id, s_expression }): [string, { id: string }] => [normalized(s_expression), { id }]),
      ])
    }), [])

  const table_signs_to_display = computed(() => signsToDisplay({ search_results: search_results.value, finding_site: finding_site.value, warning_signs }))

  const table_signs_with_recorded = computed(() =>
    table_signs_to_display.value.map((sign): SignWithRecorded => ({ ...sign, recorded: findRecorded(recorded.value, sign) }))
  )

  const grouped = computed(() => groupBy(table_signs_with_recorded.value, 'category'))
  const categories = computed(() => tableCategories(finding_site.value))

  const form_values = computed(() => warningSignsFormValues({ warning_signs, recorded: recorded.value }))

  // Chips need an id to key by; the recorded finding's record serves
  const chips = computed(() => recorded.value.map((finding) => ({ ...finding, id: finding.record_id })))

  // The record a sign has that checking it overturns or reopening it edits
  function existingOf(sign: WarningSignWithMaybeRecord): null | { record_id: string; existence: Existence } {
    if (sign.existing_record) return { record_id: sign.existing_record.id, existence: sign.existing_record.existence }
    const absent = absent_records.value.get(normalized(sign.clinical_finding_s_expression))
    if (absent) return { record_id: absent.id, existence: 'No' }
    return null
  }

  function onCheck(sign: WarningSignWithMaybeRecord) {
    openFinding({
      key: uniqueIdentifier(sign),
      finding: sign,
      entered: sign.existing_record?.augmented || asEntered(sign),
      just_checked: true,
      existing: existingOf(sign),
    })

    if (search_results.value) {
      search_results.value = null
      snomed_warning_signs_async_search.setQuery('')
    }
  }

  function onOpenDetails(sign: WarningSignWithMaybeRecord | undefined, recorded_finding: RecordedFinding) {
    openFinding({
      key: recorded_finding.key,
      finding: sign || null,
      entered: recorded_finding.entered,
      just_checked: false,
      existing: { record_id: recorded_finding.record_id, existence: 'Yes' },
    })
  }

  // Every sign the page knows, for the modifiers of a chip's finding
  function allSigns(): WarningSignWithMaybeRecord[] {
    return [...warning_signs, ...finding_sites.flatMap((site) => site.signs), ...(search_results.value || [])]
  }

  return (
    <div className='flex flex-col gap-1.25 2xl:gap-4 w-full' id='warning-signs'>
      <div className='sticky top-0 z-10 bg-white flex flex-col gap-1 pb-1'>
        <div className='flex gap-2 items-stretch'>
          <Search
            id='warning-signs-search'
            placeholder='Chief complaint'
            data-searchroute={snomed_warning_signs_async_search.search_route}
            options={snomed_warning_signs_async_search.results}
            onQuery={snomed_warning_signs_async_search.setQuery}
            loading_options={snomed_warning_signs_async_search.loading}
            do_not_render_built_in_options
            is_async
          />
          {finding_sites.length > 0 && (
            <FindingSiteFilter
              finding_sites={finding_sites}
              selected={finding_site.value}
              onSelect={(selected) => finding_site.value = selected}
            />
          )}
        </div>
        <SelectedChips
          id='warning-signs-selected-chips'
          items={chips.value}
          onEdit={(chip) => onOpenDetails(signOf(allSigns(), chip), chip)}
        />
      </div>
      {grouped.value.size === 0 && (
        <EmptyState
          header='No findings found matching that search or its aliases'
          explanation='Try a different search'
          icon={<MagnifyingGlassIcon className='h-5 w-5' />}
        />
      )}
      {categories.value.map((config) => (
        <WarningSignsPriorityTable
          {...config}
          onCheck={onCheck}
          onOpenDetails={onOpenDetails}
          key={config.category}
          signs={grouped.value.get(config.category) || []}
        />
      ))}
      <WarningSignsHiddenInputs form_values={form_values.value} />
    </div>
  )
}
