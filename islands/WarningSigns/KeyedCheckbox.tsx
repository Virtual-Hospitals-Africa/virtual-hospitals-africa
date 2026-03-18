// import { Button } from '../../components/library/Button.tsx'
// import { PlusIcon } from '../../components/library/icons/heroicons/mini.tsx'
import cls from '../../util/cls.ts'
import { CheckedWarningSign, OnToggle, SelectedWarningSign, uniqueIdentifier } from './shared.ts'

export function KeyedWarningSignCheckbox(
  { sign, onCheck, onUncheck /*, onOpenDetails*/ }: {
    sign: CheckedWarningSign
    onCheck: OnToggle
    onUncheck: OnToggle
    onOpenDetails?(sign: SelectedWarningSign): void
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
        {
          /*sign.checked
          ? (
            <Button
              variant='tertiary'
              size='sm'
              type='button'
              className='!h-auto !px-1.5 !py-0.5 !text-[8pt] 2xl:!text-xs self-start'
              left_icon={<PlusIcon className='h-2.5 w-2.5 2xl:h-3 2xl:w-3' />}
              onClick={(e) => {
                e.preventDefault()
                onOpenDetails?.(sign as SelectedWarningSign)
              }}
            >
              add details
            </Button>
          )
          : */ sign.description && (
            <span className='text-[8pt] 2xl:text-xs text-gray-500 leading-3 2xl:leading-4'>
              {sign.description}
            </span>
          )
        }
      </div>
    </label>
  )
}
