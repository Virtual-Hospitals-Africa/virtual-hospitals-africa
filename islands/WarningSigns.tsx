import { computed, useSignal } from '@preact/signals'
import { CheckedWarningSign, KeyedWarningSign } from '../types.ts'
import { groupBy } from '../util/groupBy.ts'
import Search from './Search.tsx'
import useAsyncSearch from './useAsyncSearch.tsx'
import { assert } from 'std/assert/assert.ts'
import isString from '../util/isString.ts'
import { CLINICAL_FINDING } from '../shared/snomed_concepts.ts'
import { EmptyState } from '../components/library/EmptyState.tsx'
import { MagnifyingGlassCircleIcon } from '../components/library/icons/heroicons/outline.tsx'
import sortBy from '../util/sortBy.ts'
import { hyphenate } from '../util/hyphenate.ts'
import { uniqBy } from '../util/uniqBy.ts'

const PRIORITIES = [
  {
    priority: 'Emergency' as const,
    header_bg: '#fee2e2', // error-bg
    header_text: '#991b1b', // error-textIcon
  },
  {
    priority: 'Very urgent' as const,
    header_bg: '#ffedd5', // accent-orange-bg
    header_text: '#c2410c', // accent-orange-textIcon
  },
  {
    priority: 'Urgent' as const,
    header_bg: '#fef9c3', // warning-bg
    header_text: '#854d0e', // warning-textIcon
  },
  {
    priority: 'Non-urgent' as const,
    header_bg: '#dcfce7', // success-bg
    header_text: '#166534', // success-textIcon
  },
]

type PriorityConfig = typeof PRIORITIES[number]

type OnToggle = (sign: CheckedWarningSign, checked: boolean) => void

function KeyedWarningSignCheckbox(
  { sign, onToggle }: { sign: CheckedWarningSign; onToggle: OnToggle },
) {
  const name = `warning_signs.${sign.key}`
  return (
    <label class='flex gap-3 items-start cursor-pointer flex-1 p-3 min-w-0'>
      <div class='pt-0.5'>
        <input
          id={hyphenate(name)}
          type='checkbox'
          name={name}
          value={sign.clinical_finding_s_expression}
          checked={!!sign.checked}
          class='w-5 h-5 rounded-md border-gray-300 text-indigo-700 focus:ring-indigo-700'
          onInput={(event) => onToggle(sign, event.currentTarget.checked)}
        />
      </div>
      <label class='flex flex-col gap-1' for={name}>
        <span class='text-sm font-medium text-gray-600 leading-5'>
          {sign.sats_primary_name}
        </span>
        {sign.sats_secondary_text && (
          <span class='text-xs text-gray-500 leading-4'>
            {sign.sats_secondary_text}
          </span>
        )}
      </label>
    </label>
  )
}

function KeyedWarningSignsPriorityGrid({
  priority_config,
  signs,
  onToggle,
}: {
  priority_config: PriorityConfig
  signs: CheckedWarningSign[]
  onToggle: OnToggle
}) {
  const columns = 5
  const rows: CheckedWarningSign[][] = []

  for (let i = 0; i < signs.length; i += columns) {
    rows.push(signs.slice(i, i + columns))
  }

  return (
    <div
      class='flex flex-col w-full overflow-hidden rounded-xl border border-gray-200'
      id={`priority-grid-${hyphenate(priority_config.priority)}`}
    >
      {/* Header */}
      <div
        class='py-3 flex items-center justify-center'
        style={{ backgroundColor: priority_config.header_bg }}
      >
        <span
          class='text-xl font-semibold uppercase'
          style={{ color: priority_config.header_text }}
        >
          {priority_config.priority}
        </span>
      </div>
      {/* Content rows */}
      <div class='flex flex-col bg-white'>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} class='flex'>
            {row.map((sign) => (
              <div
                key={sign.key}
                class='flex-1 p-3 min-w-0'
              >
                <KeyedWarningSignCheckbox sign={sign} onToggle={onToggle} />
              </div>
            ))}
            {/* Fill remaining columns with empty cells */}
            {row.length < columns &&
              Array.from({ length: columns - row.length }).map((_, i) => (
                <div key={`empty-${i}`} class='flex-1 p-3 min-w-0' />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KeyedWarningSigns({
  search_route,
  warning_signs,
}: {
  search_route: string
  warning_signs: CheckedWarningSign[]
}) {
  const checked_signs = useSignal<CheckedWarningSign[]>(
    warning_signs.filter((sign) => sign.checked),
  )
  const query = useSignal<string>('')
  const search_results_as_signs = useSignal<CheckedWarningSign[]>([])

  const grouped = computed(() => {
    if (!query.value) {
      return groupBy(
        uniqBy(
          [...checked_signs.value, ...warning_signs],
          (sign) => sign.sats_primary_name + (sign.sats_secondary_text || ''),
        ),
        'sats_priority',
      )
    }

    return groupBy([
      ...search_results_as_signs.value,
      ...checked_signs.value,
    ], 'sats_priority')
  })

  const snomed_warning_signs_async_search = useAsyncSearch({
    search_route,
    skip_blank_search: true,
    value: null,
    onSearchResults(results) {
      query.value = results.query

      const all_results = results.pages.flatMap((page) => page.results)

      search_results_as_signs.value = all_results.map(
        (r): CheckedWarningSign => {
          assert('id' in r)
          assert(isString(r.id))
          assert('category' in r)
          assert(isString(r.category))
          assert(r.name)
          assert('priority' in r)
          assert('priority' in r)
          return {
            satisfied_by_record_id: null,
            checked: false,
            key: 's' + r.id,
            sats_priority: (r.priority && typeof r.priority === 'object' &&
                'name' in r.priority)
              ? r.priority.name as KeyedWarningSign['sats_priority']
              : 'Non-urgent', // TODO actually get this from the server
            clinical_finding_s_expression:
              `(finding ${CLINICAL_FINDING.id} ${r.id})`,
            sats_primary_name: r.name,
            sats_secondary_text: r.category, /* + ' ' + (r.best_similarity), */
          }
        },
      )
    },
  })

  const sorted_priorities = sortBy(
    PRIORITIES,
    ({ priority }) =>
      -(grouped.value.get(priority) || []).filter((sign) =>
        sign.satisfied_by_record_id
      ).length,
    (_config, index) => index,
  )

  return (
    <div class='flex flex-col gap-4 w-full'>
      <Search
        id='warning-signs-search'
        do_not_render_built_in_options
        options={snomed_warning_signs_async_search.results}
        onQuery={(query) => {
          snomed_warning_signs_async_search.setQuery(query)
        }}
        placeholder='Chief complaint'
        data-searchroute={search_route}
      />
      {grouped.value.size === 0 && (
        <EmptyState
          header='No findings found matching that search or its aliases'
          explanation='Try a different search'
          icon={<MagnifyingGlassCircleIcon className='h-5 w-5' />}
        />
      )}
      {sorted_priorities.map((priority_config) => {
        const signs = grouped.value.get(priority_config.priority)
        if (!signs?.length) return null
        return (
          <KeyedWarningSignsPriorityGrid
            key={priority_config.priority}
            priority_config={priority_config}
            signs={signs}
            onToggle={(sign, checked) => {
              checked_signs.value = checked
                ? [...checked_signs.value, {
                  ...sign,
                  checked,
                  satisfied_by_record_id: 'meh',
                }]
                : checked_signs.value.filter((checked_sign) =>
                  checked_sign.sats_primary_name !== sign.sats_primary_name
                )

              query.value = ''
              snomed_warning_signs_async_search.setQuery('')
            }}
          />
        )
      })}
    </div>
  )
}
