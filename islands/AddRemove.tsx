import { ComponentChildren, JSX } from 'preact'
import {
  MinusCircleIcon,
  PlusCircleIcon,
} from '../components/library/icons/heroicons/outline.tsx'
import cls from '../util/cls.ts'

// TODO: Make an AddRemoveRow that smoothly animates from one to the other
export function AddRow(
  { text, onClick, labelled }: {
    text: string
    onClick(): void
    labelled?: boolean
  },
): JSX.Element {
  return (
    <a
      className='text-indigo-600 flex cursor-pointer gap-2 py-[6px]'
      onClick={onClick}
    >
      <PlusCircleIcon className='h-6 w-6' />
      {text}
    </a>
  )
}

export function RemoveRow(
  { children, onClick, labelled, centered }: {
    children: ComponentChildren
    onClick(): void
    labelled?: boolean
    centered?: boolean
  },
): JSX.Element {
  return (
    <div className='flex gap-2'>
      <a
        role='button'
        className={cls(
          'text-indigo-600 flex cursor-pointer',
          centered && 'items-center',
        )}
        onClick={onClick}
      >
        <MinusCircleIcon
          className={cls(
            'h-6 w-6',
            !centered && (labelled ? 'mt-[30px]' : 'mt-[6px]'),
          )}
        />
      </a>
      {children}
    </div>
  )
}
