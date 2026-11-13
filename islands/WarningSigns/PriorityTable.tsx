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
  const body = has_subcategories
    ? (
      <div className='bg-white divide-y divide-gray-100 max-md:py-1'>
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
        className='grid grid-cols-1 bg-white px-3 max-md:py-1 md:grid-cols-5 md:px-1 2xl:gap-4'
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
    )

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
      <div
        data-category-body
        className={cls(
          'max-md:grid max-md:grid-rows-[0fr] max-md:transition-[grid-template-rows] max-md:duration-300 max-md:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
          expanded && 'max-md:grid-rows-[1fr] max-md:min-h-0 max-md:flex-1',
          'md:contents',
        )}
      >
        <div className='max-md:min-h-0 max-md:overflow-hidden md:contents'>
          <div className={cls(expanded && 'max-md:h-full max-md:overflow-y-auto')}>
            {body}
          </div>
        </div>
      </div>
    </div>
  )
}
