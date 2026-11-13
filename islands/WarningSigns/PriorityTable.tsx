import { ChevronDownIcon, ChevronRightIcon } from '../../components/library/icons/heroicons/outline.tsx'
import cls from '../../util/cls.ts'
import { priorityColors } from '../../shared/priorities.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import { KeyedWarningSignCheckbox } from './KeyedCheckbox.tsx'
import { CategoryConfig, CheckedWarningSign, EMERGENCY_SUBCATEGORY_ORDER, OnToggle, ToggleableWarningSign, uniqueIdentifier } from './shared.ts'

export function WarningSignsPriorityTable({
  priority,
  category,
  signs,
  expanded,
  onToggleExpanded,
  onCheck,
  onOpenDetails,
}: CategoryConfig & {
  signs: ToggleableWarningSign[]
  // One category is open at a time on mobile. At md and up the body stays visible either way.
  expanded: boolean
  onToggleExpanded(): void
  onCheck: OnToggle
  onOpenDetails(sign: CheckedWarningSign): void
}) {
  if (!signs.length) return null
  const colors = priorityColors(priority)
  const category_attribute = hyphenate(category)
  // deno-lint-ignore no-explicit-any
  const has_subcategories = signs.some((s) => (s as any).subcategory != null)
  // max-md:hidden! beats the grid display below md. At md and up the body stays visible either way.
  const collapsed_on_mobile = !expanded && 'max-md:hidden!'
  const mobile_body_scroll = expanded && 'max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto max-md:py-1'

  return (
    <div
      className={cls(
        'priority-table w-full overflow-hidden rounded-xl border',
        colors.border,
        expanded && 'max-md:flex max-md:min-h-0 max-md:flex-1 max-md:flex-col',
      )}
      id={`priority-table-${category_attribute}`}
      data-category={category}
      data-expanded={expanded ? 'true' : 'false'}
    >
      <h2
        className={cls(
          'relative py-1 2xl:py-3 flex items-center justify-center text-lg font-semibold uppercase max-md:h-12 max-md:shrink-0 max-md:px-8 max-md:py-0 max-md:text-[16px] max-md:leading-[24px]',
          colors.text,
          colors.bg,
        )}
      >
        {category}
        <button
          type='button'
          className='md:hidden absolute inset-0 flex items-center justify-end pr-3'
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${category}`}
          onClick={onToggleExpanded}
        >
          {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </button>
      </h2>
      {has_subcategories
        ? (
          <div className={cls('bg-white divide-y divide-gray-100', collapsed_on_mobile, mobile_body_scroll)}>
            {EMERGENCY_SUBCATEGORY_ORDER.map((subcategory) => {
              // deno-lint-ignore no-explicit-any
              const subcategory_signs = signs.filter((s) => (s as any).subcategory === subcategory)
              if (!subcategory_signs.length) return null
              return (
                <div key={subcategory} data-subcategory={subcategory} className='flex flex-col md:flex-row items-start px-3 md:px-1'>
                  <div className='w-full md:w-36 2xl:w-48 md:shrink-0 py-2 2xl:py-3 max-md:pb-0'>
                    <span className='text-xs 2xl:text-sm font-semibold uppercase underline text-gray-700'>
                      {subcategory}
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-4 flex-1'>
                    {subcategory_signs.map((sign) => (
                      <KeyedWarningSignCheckbox
                        key={uniqueIdentifier(sign)}
                        sign={sign}
                        onCheck={onCheck}
                        onOpenDetails={onOpenDetails}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
        : (
          <div
            id={`priority-grid-${category_attribute}`}
            className={cls('grid grid-cols-1 bg-white px-3 md:grid-cols-5 md:px-1 2xl:gap-4', collapsed_on_mobile, mobile_body_scroll)}
          >
            {signs.map((sign) => (
              <KeyedWarningSignCheckbox
                key={uniqueIdentifier(sign)}
                sign={sign}
                onCheck={onCheck}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        )}
    </div>
  )
}
