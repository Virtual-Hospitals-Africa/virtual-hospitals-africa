import cls from '../../util/cls.ts'
import { OnCheckSign, OnOpenSignDetails, SignWithRecorded, uniqueIdentifier } from './shared.ts'

export function KeyedWarningSignCheckbox(
  { sign, onCheck, onOpenDetails }: {
    sign: SignWithRecorded
    onCheck: OnCheckSign
    onOpenDetails?: OnOpenSignDetails
  },
) {
  const span_class = 'text-[8pt] 2xl:text-xs text-gray-500 leading-3 2xl:leading-4'
  const { recorded } = sign

  return (
    <label
      className={cls(
        'flex gap-1.5 2xl:gap-3 items-start cursor-pointer flex-1 p-1 min-w-0',
        sign.category === 'Common Symptoms' ? 'py-1.5 2xl:py-2' : 'py-2 2xl:py-3',
      )}
      onClick={(e) => {
        if (!recorded) return
        if (e.target && 'tagName' in e.target && e.target.tagName === 'INPUT') return
        e.preventDefault()
        onOpenDetails?.(sign, recorded)
      }}
    >
      <div className='pt-0.5'>
        <input
          id={uniqueIdentifier(sign)}
          type='checkbox'
          checked={!!recorded}
          className='w-4 h-4 2xl:w-5 2xl:h-5 rounded-md border-gray-300 text-indigo-700 focus:ring-indigo-700'
          // Atypical, but if they uncheck the box still launch the modal,
          // Requiring them to click "Remove" before it's truly removed
          onInput={(event) => {
            if (event.currentTarget.checked || !recorded) {
              onCheck(sign)
            } else {
              onOpenDetails?.(sign, recorded)
            }
          }}
        />
      </div>
      <div className='flex flex-col gap-0.75 2xl:gap-1 pt-0.5'>
        <span className='text-xs 2xl:text-sm font-medium text-gray-600 leading-4 2xl:leading-5'>
          {sign.name}
        </span>
        <span className={span_class}>
          {sign.description || ''}
        </span>
      </div>
    </label>
  )
}
