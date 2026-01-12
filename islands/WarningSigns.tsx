import { computed, useSignal } from '@preact/signals'
import { SnomedConceptSearchResult, WarningSignWithMaybeRecord } from '../types.ts'
import { groupBy } from '../util/groupBy.ts'
import Search from './Search.tsx'
import useAsyncSearch from './useAsyncSearch.tsx'

import { EmptyState } from '../components/library/EmptyState.tsx'
import { MagnifyingGlassCircleIcon } from '../components/library/icons/heroicons/outline.tsx'
import sortBy from '../util/sortBy.ts'
import { hyphenate } from '../util/hyphenate.ts'
import { HiddenInput } from '../components/library/HiddenInput.tsx'
import compact from '../util/compact.ts'

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

type OnToggle = (sign: CheckedWarningSign) => void

function uniqueIdentifier(sign: CheckedWarningSign) {
  const first_unique = sign.key ||
    compact([sign.sats_primary_name + sign.sats_secondary_text]).join('-')
  return hyphenate(first_unique.toLowerCase())
}

function KeyedWarningSignCheckbox(
  { sign, onCheck, onUncheck }: {
    sign: CheckedWarningSign
    onCheck: OnToggle
    onUncheck: OnToggle
  },
) {
  const name = `warning_signs.${uniqueIdentifier(sign)}`
  return (
    <label class='flex gap-1.5 2xl:gap-3 py-2 2xl:py-3 items-start cursor-pointer flex-1 p-1 min-w-0'>
      <div class='pt-0.5'>
        <HiddenInput
          name={name}
          value={{
            s_expression: sign.clinical_finding_s_expression,
            warning_sign_key: sign.key,
            priority_level: sign.sats_priority,
            existing_record: sign.existing_record && {
              id: sign.existing_record.id,
              altered: sign.existing_record.existence !==
                (sign.checked ? 'Yes' : 'No'),
            },
          }}
        />
        <input
          id={hyphenate(name)}
          type='checkbox'
          name={`${name}.existence`}
          value='Yes'
          checked={!!sign.checked}
          class='w-4 h-4 2xl:w-5 2xl:h-5 rounded-md border-gray-300 text-indigo-700 focus:ring-indigo-700'
          onInput={(event) => event.currentTarget.checked ? onCheck(sign) : onUncheck(sign)}
        />
      </div>
      <div class='flex flex-col gap-0.75 2xl:gap-1 pt-0.5'>
        <span class='text-xs 2xl:text-sm font-medium text-gray-600 leading-4 2xl:leading-5'>
          {sign.sats_primary_name}
        </span>
        {sign.sats_secondary_text && (
          <span class='text-[8pt] 2xl:text-xs text-gray-500 leading-3 2xl:leading-4'>
            {sign.sats_secondary_text}
          </span>
        )}
      </div>
    </label>
  )
}

function KeyedWarningSignsPriorityGrid({
  priority_config,
  signs,
  onCheck,
  onUncheck,
}: {
  priority_config: PriorityConfig
  signs: CheckedWarningSign[]
  onCheck: OnToggle
  onUncheck: OnToggle
}) {
  return (
    <div
      class='w-full overflow-hidden rounded-xl border border-gray-200'
      id={`priority-grid-${hyphenate(priority_config.priority)}`}
    >
      {/* Header */}
      <div
        class='py-1.5 2xl:py-3 flex items-center justify-center'
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
      <div class='grid grid-cols-5 bg-white px-1 2xl:gap-4'>
        {signs.map((sign) => (
          <KeyedWarningSignCheckbox
            key={uniqueIdentifier(sign)}
            sign={sign}
            onCheck={onCheck}
            onUncheck={onUncheck}
          />
        ))}
      </div>
    </div>
  )
}

type CheckedWarningSign = WarningSignWithMaybeRecord & {
  checked?: boolean
}

export default function KeyedWarningSigns({
  search_route,
  warning_signs,
}: {
  search_route: string
  warning_signs: WarningSignWithMaybeRecord[]
}) {
  const checked_signs = useSignal<CheckedWarningSign[]>(
    warning_signs.map((sign) => ({
      ...sign,
      checked: sign.existing_record?.existence === 'Yes',
    })),
  )
  const search_results = useSignal<null | CheckedWarningSign[]>(null)

  const grouped = computed(() =>
    groupBy(
      search_results.value || checked_signs.value,
      'sats_priority',
    )
  )

  const sorted_priorities = computed(() =>
    sortBy(
      PRIORITIES,
      ({ priority }) =>
        -(grouped.value.get(priority) || []).filter((sign) => !!sign.checked)
          .length,
      (_config, index) => index,
    )
  )

  const snomed_warning_signs_async_search = useAsyncSearch({
    search_route,
    skip_blank_search: true,
    value: null,
    onSearchResults(results) {
      search_results.value = results.pages.flatMap((page) => page.results) as unknown as SnomedConceptSearchResult[]
    },
  })

  return (
    <div class='flex flex-col gap-2 2xl:gap-4 w-full'>
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
      {sorted_priorities.value.map((priority_config) => {
        const signs = grouped.value.get(priority_config.priority)
        if (!signs?.length) return null
        return (
          <KeyedWarningSignsPriorityGrid
            key={priority_config.priority}
            priority_config={priority_config}
            signs={signs}
            onCheck={(sign) => {
              if (search_results.value) {
                checked_signs.value = [
                  { ...sign, checked: true },
                  ...checked_signs.value,
                ]
                search_results.value = null
                snomed_warning_signs_async_search.setQuery('')
                return
              }

              checked_signs.value = checked_signs.value.map((other_sign) => other_sign === sign ? { ...sign, checked: true } : other_sign)
            }}
            onUncheck={(sign) => {
              checked_signs.value = checked_signs.value.map((other_sign) => other_sign === sign ? { ...sign, checked: false } : other_sign)
            }}
          />
        )
      })}
    </div>
  )
}
