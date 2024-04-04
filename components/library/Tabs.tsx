import { ComponentChild } from 'preact'
import cls from '../../util/cls.ts'
import words from '../../util/words.ts'

const display = (tab: string) => words(tab).join(' ')

export type TabProps = {
  tab: string
  href: string
  active: boolean
  leftIcon?: ComponentChild
  rightIcon?: ComponentChild
}

export function Tab(
  { tab, href, active, leftIcon, rightIcon }: TabProps,
) {
  return (
    <a
      href={href}
      className={cls(
        'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-2 text-sm font-medium uppercase',
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {leftIcon}
      {display(tab)}
      {rightIcon}
    </a>
  )
}

export function Tabs(
  { tabs }: {
    tabs: TabProps[]
  },
) {
  return (
    <div className='border-b border-gray-200 pb-5 sm:pb-0 mb-4'>
      <div className='mt-3 sm:mt-4'>
        <nav className='-mb-px flex px-5 flex-wrap gap-x-8 gap-y-2'>
          {tabs.map((props) => (
            <Tab
              key={props.tab}
              {...props}
            />
          ))}
        </nav>
      </div>
    </div>
  )
}
