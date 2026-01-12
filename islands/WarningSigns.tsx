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
import { record_chip_padding_class_name, recordChipClassName } from '../components/drawer-v4/recordChipClassName.ts'
import memoize from '../util/memoize.ts'
import { XMarkIcon } from '../components/library/icons/heroicons/mini.tsx'
import { priorityColors } from '../shared/priorities.ts'
import cls from '../util/cls.ts'
import compactMap from '../util/compactMap.ts'

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

type OnToggle = (sign: CheckedWarningSign) => void


const uniqueIdentifier = memoize(
  function uniqueIdentifier({ key, category, primary_name, secondary_text }: WarningSignWithMaybeRecord) {
    const latter = key ? [key] : compact([primary_name, secondary_text])
    return hyphenate([category, ...latter].join('-').toLowerCase())
  }
)

function KeyedWarningSignCheckbox(
  { sign, onCheck, onUncheck }: {
    sign: CheckedWarningSign
    onCheck: OnToggle
    onUncheck: OnToggle
  },
) {
  
  return (
    <label className='flex gap-1.5 2xl:gap-3 py-2 2xl:py-3 items-start cursor-pointer flex-1 p-1 min-w-0'>
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
          {sign.primary_name}
        </span>
        {sign.secondary_text && (
          <span className='text-[8pt] 2xl:text-xs text-gray-500 leading-3 2xl:leading-4'>
            {sign.secondary_text}
          </span>
        )}
      </div>
    </label>
  )
}

function SelectedChip({ sign, onUncheck }: {
  sign: CheckedWarningSign
  onUncheck: OnToggle
}) {
  const name = `warning_signs.${uniqueIdentifier(sign)}`
  const existence = sign.checked ? 'Yes' : 'No'
  return <>
    <button
      type="button"
      className={recordChipClassName({
        priority: sign.sats_priority
      })}
      onClick={() => onUncheck(sign)}
    >
      {sign.primary_name}
      <XMarkIcon />
    </button>
    <HiddenInput
      name={name}
      value={{
        existence,
        s_expression: sign.clinical_finding_s_expression,
        warning_sign_key: sign.key,
        priority_level: sign.sats_priority,
        existing_record: sign.existing_record && {
          id: sign.existing_record.id,
          altered: sign.existing_record.existence !== existence
        },
      }}
    />
  </>
}

function SelectedChips({
  signs,
  onUncheck,
}: {
  signs: CheckedWarningSign[]
  onUncheck: OnToggle
}) {
  return (
    <div className='box-border content-center flex flex-wrap gap-1 items-center justify-start px-px py-0 shrink-0 w-full'>
      {!signs.length && (
        <span className={cls(record_chip_padding_class_name, 'text-gray-400')}>No findings selected</span>
      )}
      {signs.map((sign) => (
        <SelectedChip key={uniqueIdentifier(sign)} sign={sign} onUncheck={onUncheck} />
      ))}
    </div>
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

  return (
    <div
      className={cls('w-full overflow-hidden rounded-xl border', colors.border)}
      id={`priority-grid-${hyphenate(category)}`}
    >
      <div className={cls('py-1.5 2xl:py-3 flex items-center justify-center', colors.bg)}>
        <span className={cls('text-xl font-semibold uppercase', colors.text)}>
          {category}
        </span>
      </div>
      <div className='grid grid-cols-5 bg-white px-1 2xl:gap-4'>
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

export default function WarningSigns({
  search_route,
  warning_signs,
}: {
  search_route: string
  warning_signs: WarningSignWithMaybeRecord[]
}) {
  const checked_signs = useSignal<Array<CheckedWarningSign & { checked: true }>>(
    compactMap(warning_signs, (sign) => sign.existing_record?.existence === 'Yes' && {
      ...sign,
      checked: true
    }),
  )

  const search_results = useSignal<null | WarningSignWithMaybeRecord[]>(null)

  const table_signs_to_display = computed(() => search_results.value || warning_signs)
  
  const with_checked = computed(() => 
    table_signs_to_display.value.map(sign => ({
      ...sign,
      checked: checked_signs.value.some(checked_sign =>
        uniqueIdentifier(checked_sign) === uniqueIdentifier(sign)
      )
    })))

  const grouped = computed(() =>
    groupBy(with_checked.value, 'category')
  )

  const snomed_warning_signs_async_search = useAsyncSearch({
    search_route,
    skip_blank_search: true,
    value: null,
    onSearchResults(results) {
      search_results.value = results.pages.flatMap((page) => page.results) as unknown as SnomedConceptSearchResult[]
    },
  })

  function onCheck (sign: CheckedWarningSign) {
    checked_signs.value = checked_signs.value= [
      ...checked_signs.value,
      { ...sign, checked: true },
      ]
    if (search_results.value) {
      search_results.value = null
      snomed_warning_signs_async_search.setQuery('')
      return
    }
  }
  function onUncheck (sign: CheckedWarningSign) {
    assert(sign.checked)
    checked_signs.value = checked_signs.value.filter(checked_sign =>
      uniqueIdentifier(checked_sign) !== uniqueIdentifier(sign)
    )
  }

  return (
    <div className='flex flex-col gap-2 2xl:gap-4 w-full' id='warning-signs'>
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
      <SelectedChips
        signs={checked_signs.value}
        onUncheck={onUncheck}
      />
      {CATEGORIES.map((config) => (
        <WarningSignsPriorityTable
          {...config}
          onCheck={onCheck}
          onUncheck={onUncheck}
          key={config.category}
          signs={grouped.value.get(config.category) || []}
        />
      ))}
    </div>
  )
}
