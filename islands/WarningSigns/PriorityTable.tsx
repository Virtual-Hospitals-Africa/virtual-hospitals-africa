import { priorityColors } from '../../shared/priorities.ts'
import cls from '../../util/cls.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import { KeyedWarningSignCheckbox } from './KeyedCheckbox.tsx'
import { CategoryConfig, CheckedWarningSign, EMERGENCY_SUBCATEGORY_ORDER, OnToggle, SelectedWarningSign, uniqueIdentifier } from './shared.ts'

export function WarningSignsPriorityTable({
  priority,
  category,
  signs,
  onCheck,
  onUncheck,
  onOpenDetails,
}: CategoryConfig & {
  signs: CheckedWarningSign[]
  onCheck: OnToggle
  onUncheck: OnToggle
  onOpenDetails?: (sign: SelectedWarningSign) => void
}) {
  if (!signs.length) return null
  const colors = priorityColors(priority)
  const category_attribute = hyphenate(category)
  // deno-lint-ignore no-explicit-any
  const has_subcategories = signs.some((s) => (s as any).subcategory != null)

  return (
    <div
      className={cls('priority-table w-full overflow-hidden rounded-xl border', colors.border)}
      id={`priority-table-${category_attribute}`}
      data-category={category}
    >
      <h2 className={cls('py-1 2xl:py-3 flex items-center justify-center text-lg font-semibold uppercase', colors.text, colors.bg)}>
        {category}
      </h2>
      {has_subcategories
        ? (
          <div className='bg-white divide-y divide-gray-100'>
            {EMERGENCY_SUBCATEGORY_ORDER.map((subcategory) => {
              // deno-lint-ignore no-explicit-any
              const subcategory_signs = signs.filter((s) => (s as any).subcategory === subcategory)
              if (!subcategory_signs.length) return null
              return (
                <div key={subcategory} data-subcategory={subcategory} className='flex items-start px-1'>
                  <div className='w-36 2xl:w-48 shrink-0 py-2 2xl:py-3'>
                    <span className='text-xs 2xl:text-sm font-semibold uppercase underline text-gray-700'>
                      {subcategory}
                    </span>
                  </div>
                  <div className='grid grid-cols-4 flex-1'>
                    {subcategory_signs.map((sign) => (
                      <KeyedWarningSignCheckbox
                        key={uniqueIdentifier(sign)}
                        sign={sign}
                        onCheck={onCheck}
                        onUncheck={onUncheck}
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
          <div id={`priority-grid-${category_attribute}`} className='grid grid-cols-5 bg-white px-1 2xl:gap-4'>
            {signs.map((sign) => (
              <KeyedWarningSignCheckbox
                key={uniqueIdentifier(sign)}
                sign={sign}
                onCheck={onCheck}
                onUncheck={onUncheck}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        )}
    </div>
  )
}
