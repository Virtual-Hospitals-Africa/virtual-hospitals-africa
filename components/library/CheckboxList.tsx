import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'
import { Maybe } from '../../types.ts'

export type CheckboxListItem = {
  id: string
  label: string
  description?: Maybe<string>
  checked: boolean
  disabled?: boolean
}

/*
  A list of checkboxes, one column on smaller screens and two from xl up.

  Checking an item calls onCheck. Unchecking, or clicking the label of a checked item, calls
  onOpenChecked when given so the caller can confirm before anything is removed, mirroring
  the warning sign checkboxes. Without onOpenChecked, unchecking calls onUncheck.
*/
export function CheckboxList<Item extends CheckboxListItem>({
  id,
  items,
  onCheck,
  onUncheck,
  onOpenChecked,
  children,
}: {
  id?: string
  items: Item[]
  onCheck(item: Item): void
  onUncheck?(item: Item): void
  onOpenChecked?(item: Item): void
  children?: ComponentChildren
}) {
  return (
    <div id={id} className='checkbox-list flex flex-col gap-2'>
      {children}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-x-6'>
        {items.map((item) => (
          <label
            key={item.id}
            className={cls('flex gap-2 items-start py-1.5 min-w-0', item.disabled ? 'cursor-default' : 'cursor-pointer')}
            data-checkbox-list-item={item.id}
            onClick={(event) => {
              if (!item.checked || !onOpenChecked) return
              if (event.target && 'tagName' in event.target && event.target.tagName === 'INPUT') return
              event.preventDefault()
              onOpenChecked(item)
            }}
          >
            <div className='pt-0.5'>
              <input
                id={item.id}
                type='checkbox'
                checked={item.checked}
                disabled={item.disabled}
                className='w-4 h-4 rounded-md border-gray-300 text-indigo-700 focus:ring-indigo-700 disabled:opacity-50'
                onInput={(event) => {
                  if (event.currentTarget.checked) return onCheck(item)
                  if (onOpenChecked) return onOpenChecked(item)
                  onUncheck?.(item)
                }}
              />
            </div>
            <div className='flex flex-col gap-0.5 min-w-0'>
              <span className='text-sm font-medium text-gray-700 leading-5'>{item.label}</span>
              {item.description && <span className='text-xs text-gray-500 leading-4'>{item.description}</span>}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
