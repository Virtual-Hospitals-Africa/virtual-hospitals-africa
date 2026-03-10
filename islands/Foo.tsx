import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { record } from 'zod'
import { RecordPanel } from '../components/library/RecordPanel.tsx'
import cls from '../util/cls.ts'
import { LocalTime } from './LocalTime.tsx'

export function Foo() {
  return (
    <Popover
      id={'x'}
      className={cls('relative')}
    >
      {/* <span
        className={cls({
          'opacity-50': record.existence === 'No' ||
            record.existence === 'Unknown',
        })}
      > */}
        <PopoverButton
          // tabIndex={-1}
          className='text-blue-500'
          onClick={event => {
            console.log('lkwelkwelk', event)
          }}
          // href={`#most-recent-finding-${record.pertaining_to_key || record.id}`}
        >
          {'YEWOIELKWE'}
        </PopoverButton>
        
      {/* </span> */}
      <PopoverPanel
        anchor={{ to: 'bottom start', gap: 8, padding: 8 }}
        className='panel z-50 transition duration-100 ease-out'
      >
        HERE!
      </PopoverPanel>
    </Popover>
  )
}