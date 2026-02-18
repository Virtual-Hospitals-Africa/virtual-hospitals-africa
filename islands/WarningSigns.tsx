import { computed, useSignal } from '@preact/signals'
import { SnomedConceptSearchResult, WarningSignWithMaybeRecord } from '../types.ts'
import { groupBy } from '../util/groupBy.ts'
import Search from './Search.tsx'
import useAsyncSearch from './useAsyncSearch.tsx'
import { EmptyState } from '../components/library/EmptyState.tsx'
import { MagnifyingGlassCircleIcon } from '../components/library/icons/heroicons/outline.tsx'
import { hyphenate } from '../util/hyphenate.ts'
import { HiddenInput } from '../components/library/HiddenInput.tsx'
import compact from '../util/compact.ts'
import { assert } from 'std/assert/assert.ts'
import memoize from '../util/memoize.ts'
import { priorityColors } from '../shared/priorities.ts'
import cls from '../util/cls.ts'
import compactMap from '../util/compactMap.ts'
import { uniqBy } from '../util/uniqBy.ts'
import { SelectedChips } from './SelectedRecordChip.tsx'

const CATEGORIES = [
  {
    category: 'Search Results' as const,
    priority: null,
  },
  {
    category: 'Emergency' as const,
    priority: 'Emergency' as const,
  },
  {
    category: 'Very urgent' as const,
    priority: 'Very urgent' as const,
  },
  {
    category: 'Urgent' as const,
    priority: 'Urgent' as const,
  },
  {
    category: 'Common Symptoms' as const,
    priority: null,
  },
]

type CategoryConfig = typeof CATEGORIES[number]

type CheckedWarningSign = WarningSignWithMaybeRecord & {
  checked: boolean
}

type SelectedWarningSign = CheckedWarningSign & { checked: true }

type OnToggle = (sign: CheckedWarningSign) => void

const uniqueIdentifier = memoize(
  function uniqueIdentifier({ key, category, name, description }: WarningSignWithMaybeRecord) {
    const latter = key ? [key] : compact([name, description])
    return hyphenate([category, ...latter].join('-').toLowerCase())
  },
)

function KeyedWarningSignCheckbox(
  { sign, onCheck, onUncheck }: {
    sign: CheckedWarningSign
    onCheck: OnToggle
    onUncheck: OnToggle
  },
) {
  return (
    <label
      className={cls(
        'flex gap-1.5 2xl:gap-3 items-start cursor-pointer flex-1 p-1 min-w-0',
        sign.category === 'Common Symptoms' ? 'py-1.5 2xl:py-2' : ' py-2 2xl:py-3',
      )}
    >
      <div className='pt-0.5'>
        <input
          id={uniqueIdentifier(sign)}
          type='checkbox'
          checked={!!sign.checked}
          className='w-4 h-4 2xl:w-5 2xl:h-5 rounded-md border-gray-300 text-indigo-700 focus:ring-indigo-700'
          onInput={(event) => event.currentTarget.checked ? onCheck(sign) : onUncheck(sign)}
        />
      </div>
      <div className='flex flex-col gap-0.75 2xl:gap-1 pt-0.5'>
        <span className='text-xs 2xl:text-sm font-medium text-gray-600 leading-4 2xl:leading-5'>
          {sign.name}
        </span>
        {sign.description && (
          <span className='text-[8pt] 2xl:text-xs text-gray-500 leading-3 2xl:leading-4'>
            {sign.description}
          </span>
        )}
      </div>
    </label>
  )
}

function WarningSignsPriorityTable({
  priority,
  category,
  signs,
  onCheck,
  onUncheck,
}: CategoryConfig & {
  signs: CheckedWarningSign[]
  onCheck: OnToggle
  onUncheck: OnToggle
}) {
  if (!signs.length) return null
  const colors = priorityColors(priority)
  const category_attribute = hyphenate(category)

  return (
    <div
      className={cls('priority-table w-full overflow-hidden rounded-xl border', colors.border)}
      id={`priority-table-${category_attribute}`}
      data-category={category}
    >
      <h2 className={cls('py-1 2xl:py-3 flex items-center justify-center text-lg font-semibold uppercase', colors.text, colors.bg)}>
        {category}
      </h2>
      <div id={`priority-grid-${category_attribute}`} className='grid grid-cols-5 bg-white px-1 2xl:gap-4'>
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

function WarningSignsHiddenInputs({ signs_to_send_to_server }: { signs_to_send_to_server: CheckedWarningSign[] }) {
  return signs_to_send_to_server.map((sign) => {
    const key = uniqueIdentifier(sign)
    const existence = sign.checked ? 'Yes' : 'No'
    return (
      <HiddenInput
        key={key}
        name={`warning_signs.${key}`}
        value={{
          existence,
          s_expression: sign.clinical_finding_s_expression,
          warning_sign_key: sign.key,
          priority_level: sign.priority,
          existing_record: sign.existing_record && {
            id: sign.existing_record.id,
            altered: sign.existing_record.existence !== existence,
          },
        }}
      />
    )
  })
}

export default function WarningSigns({
  search_route,
  warning_signs,
}: {
  search_route: string
  warning_signs: WarningSignWithMaybeRecord[]
}) {
  const selected_signs = useSignal<SelectedWarningSign[]>(
    compactMap(warning_signs, (sign) =>
      sign.existing_record?.existence === 'Yes' && {
        ...sign,
        checked: true,
      }),
  )

  const search_results = useSignal<null | WarningSignWithMaybeRecord[]>(null)

  const snomed_warning_signs_async_search = useAsyncSearch({
    search_route,
    skip_blank_search: true,
    onSearchResults(results) {
      // TODO one day we'll type results from jsonSearchHandler
      search_results.value = results.pages.flatMap((page) => page.results) as unknown as SnomedConceptSearchResult[]
    },
  })

  const table_signs_to_display = computed(() => search_results.value || warning_signs)

  const table_signs_with_checked = computed(() =>
    table_signs_to_display.value.map((sign) => ({
      ...sign,
      checked: selected_signs.value.some((checked_sign) => uniqueIdentifier(checked_sign) === uniqueIdentifier(sign)),
    }))
  )

  const grouped = computed(() => groupBy(table_signs_with_checked.value, 'category'))

  const signs_to_send_to_server = computed(() =>
    uniqBy([
      ...table_signs_with_checked.value,
      ...selected_signs.value,
    ], uniqueIdentifier)
  )

  function onCheck(sign: CheckedWarningSign) {
    selected_signs.value = selected_signs.value = [
      ...selected_signs.value,
      { ...sign, checked: true },
    ]
    if (search_results.value) {
      search_results.value = null
      snomed_warning_signs_async_search.setQuery('')
      return
    }
  }

  function onUncheck(sign: CheckedWarningSign) {
    assert(sign.checked)
    selected_signs.value = selected_signs.value.filter((checked_sign) => uniqueIdentifier(checked_sign) !== uniqueIdentifier(sign))
  }

  return (
    <div className='flex flex-col gap-1.25 2xl:gap-4 w-full' id='warning-signs'>
      <div className='sticky top-0 z-10 bg-white flex flex-col gap-1 pb-1'>
        <Search
          id='warning-signs-search'
          placeholder='Chief complaint'
          data-searchroute={search_route}
          options={snomed_warning_signs_async_search.results}
          onQuery={snomed_warning_signs_async_search.setQuery}
          do_not_render_built_in_options
        />
        <SelectedChips
          id='warning-signs-selected-chips'
          items={selected_signs.value}
          onUncheck={onUncheck}
        />
      </div>
      {grouped.value.size === 0 && (
        <EmptyState
          header='No findings found matching that search or its aliases'
          explanation='Try a different search'
          icon={<MagnifyingGlassCircleIcon className='h-5 w-5' />}
        />
      )}
      {CATEGORIES.map((config) => (
        <WarningSignsPriorityTable
          {...config}
          onCheck={onCheck}
          onUncheck={onUncheck}
          key={config.category}
          signs={grouped.value.get(config.category) || []}
        />
      ))}
      <WarningSignsHiddenInputs
        signs_to_send_to_server={signs_to_send_to_server.value}
      />
    </div>
  )
}
