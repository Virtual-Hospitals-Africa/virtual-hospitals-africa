import cls from '../../util/cls.ts'
import { CheckedWarningSign, OnToggle, ToggleableWarningSign, uniqueIdentifier } from './shared.ts'

export function KeyedWarningSignCheckbox(
  { sign, onCheck, onOpenDetails }: {
    sign: ToggleableWarningSign
    onCheck: OnToggle
    onOpenDetails?(sign: CheckedWarningSign): void
  },
) {
  const span_class = 'text-[12px] leading-4 text-gray-500 md:text-[8pt] md:leading-3 2xl:text-xs 2xl:leading-4'

  return (
    <label
      className={cls(
        'flex gap-3 md:gap-1.5 2xl:gap-3 items-start cursor-pointer flex-1 min-w-0 px-1 py-2.5 max-md:min-h-12 md:p-1',
        sign.category === 'Common Symptoms' ? 'md:py-1.5 2xl:py-2' : 'md:py-2 2xl:py-3',
      )}
      onClick={(e) => {
        if (!sign.entered) return
        if (e.target && 'tagName' in e.target && e.target.tagName === 'INPUT') return
        e.preventDefault()
        onOpenDetails?.(sign as CheckedWarningSign)
      }}
    >
      <div className='pt-0.5'>
        <input
          id={uniqueIdentifier(sign)}
          type='checkbox'
          checked={!!sign.entered}
          className='size-5 rounded border-gray-600 text-indigo-700 focus:ring-indigo-700 max-md:border-[1.5px] md:size-4 md:rounded-md md:border-gray-300 2xl:size-5'
          // Atypical, but if they uncheck the box still launch the modal,
          // Requiring them to click "Remove" before it's truly removed
          onInput={(event) => {
            if (event.currentTarget.checked) {
              onCheck(sign)
            } else {
              onOpenDetails?.(sign as CheckedWarningSign)
            }
          }}
        />
      </div>
      <div className='flex min-w-0 flex-col gap-0.5 pt-0.5 md:gap-0.75 2xl:gap-1'>
        <span className='text-sm font-medium leading-5 text-gray-600 max-md:break-words max-md:text-[14px] max-md:leading-[20px] md:text-xs md:leading-4 2xl:text-sm 2xl:leading-5'>
          {sign.name}
        </span>
        <span className={span_class}>
          {sign.description || ''}
        </span>
      </div>
    </label>
  )
}
